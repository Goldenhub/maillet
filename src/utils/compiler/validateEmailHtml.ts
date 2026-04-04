import type { Warning } from '@/types';

let warningId = 0;

function createWarning(
  severity: Warning['severity'],
  category: Warning['category'],
  message: string,
  suggestion?: string,
): Warning {
  return { id: `warn-${++warningId}`, severity, category, message, suggestion };
}

export function validateEmailHtml(doc: Document): Warning[] {
  const warnings: Warning[] = [];

  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:')) {
      warnings.push(createWarning('warning', 'compatibility', 'Data URI images have limited support', 'Use hosted images instead'));
    }
  });

  const links = doc.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
      warnings.push(createWarning('info', 'html', 'Anchor-only links may not work in email clients'));
    }
  });

  const scripts = doc.querySelectorAll('script');
  if (scripts.length > 0) {
    warnings.push(createWarning('error', 'security', 'JavaScript is not supported in email'));
  }

  const forms = doc.querySelectorAll('form');
  if (forms.length > 0) {
    warnings.push(createWarning('error', 'compatibility', 'Forms are not supported in email'));
  }

  return warnings;
}
