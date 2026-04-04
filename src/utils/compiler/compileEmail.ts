import type { CompileResult } from '@/types';
import { parseHtml } from './parseHtml';
import { inlineStyles } from './inlineStyles';
import { transformDom } from './transformDom';
import { validateEmailHtml } from './validateEmailHtml';
import { ensureEmailMetaTags } from './ensureEmailMetaTags';
import { formatHtml } from './formatHtml';

export function compileEmail(input: string): CompileResult {
  const allWarnings: CompileResult['warnings'] = [];

  try {
    const { document: parsedDoc, warnings: parseWarnings, hasDoctype } = parseHtml(input);
    allWarnings.push(...parseWarnings);

    if (!input.trim()) {
      return { html: '', warnings: allWarnings, success: true };
    }

    const { document: inlinedDoc, warnings: inlineWarnings, hasDoctype: afterInline } = inlineStyles(parsedDoc, hasDoctype);
    allWarnings.push(...inlineWarnings);

    const { document: transformedDoc, warnings: transformWarnings } = transformDom(inlinedDoc, afterInline);
    allWarnings.push(...transformWarnings);

    ensureEmailMetaTags(transformedDoc);

    const validationWarnings = validateEmailHtml(transformedDoc);
    allWarnings.push(...validationWarnings);

    const rawHtml = '<!DOCTYPE html>' + transformedDoc.documentElement.outerHTML;
    const html = formatHtml(rawHtml);

    return { html, warnings: allWarnings, success: true };
  } catch (error) {
    allWarnings.push({
      id: `error-${Date.now()}`,
      severity: 'error',
      category: 'html',
      message: `Compilation failed: ${error instanceof Error ? error.message : String(error)}`,
    });
    return { html: '', warnings: allWarnings, success: false };
  }
}
