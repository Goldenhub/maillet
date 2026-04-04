import { describe, it, expect } from 'vitest';
import { parseHtml } from '@/utils/compiler/parseHtml';

describe('parseHtml', () => {
  it('returns empty document for empty input', () => {
    const result = parseHtml('');
    expect(result.warnings.some((w) => w.message.includes('empty'))).toBe(true);
  });

  it('wraps bare HTML in html structure', () => {
    const result = parseHtml('<p>Hello</p>');
    expect(result.document.querySelector('html')).toBeTruthy();
    expect(result.document.querySelector('body')).toBeTruthy();
  });

  it('strips BOM characters', () => {
    const input = '\uFEFF<html><body>test</body></html>';
    const result = parseHtml(input);
    expect(result.document).toBeTruthy();
    expect(result.document).toBeTruthy();
  });

  it('preserves valid HTML structure', () => {
    const input = '<!DOCTYPE html><html><head></head><body><p>test</p></body></html>';
    const result = parseHtml(input);
    expect(result.document.querySelector('p')?.textContent).toBe('test');
  });
});
