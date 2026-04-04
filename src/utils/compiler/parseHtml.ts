import type { Warning, ParseResult } from '@/types';

let warningId = 0;

function createWarning(
  severity: Warning['severity'],
  category: Warning['category'],
  message: string,
  suggestion?: string,
): Warning {
  return { id: `parse-warn-${++warningId}`, severity, category, message, suggestion };
}

export function parseHtml(input: string): ParseResult {
  const warnings: Warning[] = [];

  if (!input.trim()) {
    warnings.push(createWarning('warning', 'html', 'Input is empty'));
    return { document: document.implementation.createHTMLDocument(''), hasDoctype: false, warnings };
  }

  const normalized = input.replace(/^\uFEFF/, '').trim();

  if (normalized.length > 500 * 1024) {
    warnings.push(createWarning('error', 'html', 'Input exceeds 500KB soft limit'));
  }

  const hasDoctype = /^<!DOCTYPE\s+html/i.test(normalized);

  let htmlToParse = normalized;

  if (!/<html[\s>]/i.test(htmlToParse)) {
    htmlToParse = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${htmlToParse}</body></html>`;
    warnings.push(createWarning('info', 'html', 'Wrapped input in basic HTML structure'));
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlToParse, 'text/html');

  const parseErrors = doc.querySelectorAll('parsererror');
  if (parseErrors.length > 0) {
    warnings.push(createWarning('warning', 'html', 'Malformed HTML detected — attempting recovery'));
  }

  return { document: doc, hasDoctype, warnings };
}
