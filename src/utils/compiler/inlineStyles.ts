import type { Warning, InlineResult } from '@/types';
import juice from 'juice';
import { transformCss, transformInlineStyles } from './transformCss';

let warningId = 0;

function createWarning(
  severity: Warning['severity'],
  category: Warning['category'],
  message: string,
  suggestion?: string,
): Warning {
  return { id: `inline-warn-${++warningId}`, severity, category, message, suggestion };
}

export function inlineStyles(doc: Document, hasDoctype: boolean = false): InlineResult {
  const warnings: Warning[] = [];

  const mediaQueries: string[] = [];

  const styleBlocks = doc.querySelectorAll('style');
  styleBlocks.forEach((block) => {
    const original = block.textContent || '';

    const mediaMatches = original.match(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/gi);
    if (mediaMatches) {
      mediaQueries.push(...mediaMatches);
    }

    const { warnings: cssWarnings } = transformCss(original);
    warnings.push(...cssWarnings);

    const withoutMedia = original.replace(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/gi, '');
    block.textContent = withoutMedia;
  });

  const inlineStylesAttr = doc.querySelectorAll('[style]');
  inlineStylesAttr.forEach((el) => {
    const original = el.getAttribute('style') || '';
    const { style, warnings: styleWarnings } = transformInlineStyles(original);
    warnings.push(...styleWarnings);
    el.setAttribute('style', style);
  });

  const linkTags = doc.querySelectorAll('link');
  linkTags.forEach((link) => {
    const rel = (link.getAttribute('rel') || '').toLowerCase();
    const href = link.getAttribute('href') || '';

    if (href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com') || href.includes('fonts.googleapis')) {
      warnings.push(createWarning('warning', 'css', 'Google Fonts external link removed — web fonts are unreliable in email', 'Use safe system fonts like Arial, Helvetica, Georgia instead'));
      link.remove();
      return;
    }

    if (rel === 'stylesheet') {
      warnings.push(createWarning('error', 'css', 'External stylesheet is not supported in email', 'Inline all CSS'));
      link.remove();
      return;
    }

    if (rel === 'preconnect' || rel === 'dns-prefetch') {
      warnings.push(createWarning('info', 'html', `<link rel="${rel}"> removed (not supported in email)`));
      link.remove();
      return;
    }

    if (rel === 'icon' || rel === 'shortcut icon') {
      warnings.push(createWarning('info', 'html', `<link rel="${rel}"> removed (not supported in email)`));
      link.remove();
      return;
    }

    warnings.push(createWarning('info', 'html', `<link rel="${rel || 'unknown'}"> removed (not supported in email)`));
    link.remove();
  });

  const html = doc.documentElement.outerHTML;

  let inlined: string;
  try {
    inlined = juice(html, {
      preserveImportant: true,
      applyWidthAttributes: true,
      applyHeightAttributes: true,
    });
  } catch (error) {
    warnings.push(createWarning('error', 'css', `CSS inlining failed: ${error instanceof Error ? error.message : String(error)}`));
    return { document: doc, warnings, hasDoctype };
  }

  let resultHtml = inlined;

  if (mediaQueries.length > 0) {
    const mediaBlock = `<style>${mediaQueries.join('\n')}</style>`;
    resultHtml = resultHtml.replace('</head>', `${mediaBlock}</head>`);
  }

  const parser = new DOMParser();
  const resultDoc = parser.parseFromString(resultHtml, 'text/html');

  const inlinedElements = resultDoc.querySelectorAll('[style]');
  inlinedElements.forEach((el) => {
    const original = el.getAttribute('style') || '';
    const { style, warnings: postWarnings } = transformInlineStyles(original);
    warnings.push(...postWarnings);
    el.setAttribute('style', style);
  });

  resultDoc.querySelectorAll('[class]').forEach((el) => el.removeAttribute('class'));
  resultDoc.querySelectorAll('[id]').forEach((el) => el.removeAttribute('id'));

  const seen = new Set<string>();
  const deduped = warnings.filter((w) => {
    if (seen.has(w.message)) return false;
    seen.add(w.message);
    return true;
  });

  return { document: resultDoc, warnings: deduped, hasDoctype };
}
