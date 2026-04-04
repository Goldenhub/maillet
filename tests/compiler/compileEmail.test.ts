import { describe, it, expect } from 'vitest';
import { compileEmail } from '@/utils/compiler/compileEmail';

describe('compileEmail', () => {
  it('returns empty output for empty input', () => {
    const result = compileEmail('');
    expect(result.success).toBe(true);
    expect(result.html).toBe('');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('compiles basic HTML with CSS inlining', () => {
    const input = '<html><head><style>.red { color: red; }</style></head><body><p class="red">Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('color: red');
    expect(result.html).toContain('Hello');
  });

  it('strips script tags', () => {
    const input = '<html><body><script>alert("xss")</script><p>Safe</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('<script>');
    expect(result.warnings.some((w) => w.message.includes('<script>'))).toBe(true);
  });

  it('converts display:flex to table layout', () => {
    const input = '<html><head><style>.flex { display: flex; }</style></head><body><div class="flex"><div>A</div><div>B</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('display: flex');
    expect(result.html).toContain('<table');
  });

  it('converts semantic HTML5 elements to tables', () => {
    const input = '<html><body><section><article>Content</article></section></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('<section');
    expect(result.html).not.toContain('<article');
    expect(result.html).toContain('<table');
  });

  it('removes inline event handlers', () => {
    const input = '<html><body><button onclick="alert(1)">Click</button></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('onclick');
    expect(result.warnings.some((w) => w.message.includes('onclick'))).toBe(true);
  });

  it('adds missing alt attributes to images', () => {
    const input = '<html><body><img src="test.jpg"></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('alt'))).toBe(true);
  });

  it('warns about external image URLs', () => {
    const input = '<html><body><img src="https://example.com/image.jpg"></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('External image'))).toBe(true);
  });

  it('warns about base64 images', () => {
    const input = '<html><body><img src="data:image/png;base64,abc123"></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('Base64'))).toBe(true);
  });

  it('handles malformed HTML gracefully', () => {
    const input = '<p>Unclosed paragraph<div>Nested</p></div>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html.length).toBeGreaterThan(0);
  });

  it('returns failure on compilation error', () => {
    const result = compileEmail('');
    expect(result.success).toBe(true);
  });

  it('converts display:flex with children to table columns', () => {
    const input = '<html><body><div style="display: flex;"><div>A</div><div>B</div><div>C</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('display: flex');
    expect(result.html).toContain('<table');
    const tdCount = (result.html.match(/<td/g) || []).length;
    expect(tdCount).toBe(3);
  });

  it('converts display:flex with flex:1 children to equal-width columns', () => {
    const input = '<html><body><div style="display: flex;"><div style="flex: 1;">Left</div><div style="flex: 1;">Right</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('<table');
    expect(result.html).toContain('width: 50%');
  });

  it('converts flex-direction:column to table rows', () => {
    const input = '<html><body><div style="display: flex; flex-direction: column;"><div>Top</div><div>Bottom</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('<table');
    const trCount = (result.html.match(/<tr/g) || []).length;
    expect(trCount).toBeGreaterThanOrEqual(2);
  });

  it('converts inline-flex to table', () => {
    const input = '<html><body><span style="display: inline-flex;"><span>X</span><span>Y</span></span></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('inline-flex');
    expect(result.html).toContain('<table');
  });

  it('converts display:grid to table with columns from grid-template-columns', () => {
    const input = '<html><body><div style="display: grid; grid-template-columns: 1fr 1fr;"><div>A</div><div>B</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('display: grid');
    expect(result.html).toContain('<table');
    expect(result.html).toContain('<colgroup');
  });

  it('converts grid with repeat() to table columns', () => {
    const input = '<html><body><div style="display: grid; grid-template-columns: repeat(3, 1fr);"><div>A</div><div>B</div><div>C</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('<table');
    const colCount = (result.html.match(/<col\s/g) || []).length;
    expect(colCount).toBe(3);
  });

  it('converts grid with pixel column widths', () => {
    const input = '<html><body><div style="display: grid; grid-template-columns: 200px 1fr;"><div>A</div><div>B</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('width: 200px');
  });

  it('converts grid with grid-column spanning', () => {
    const input = '<html><body><div style="display: grid; grid-template-columns: 1fr 1fr 1fr;"><div style="grid-column: 1 / 3;">Wide</div><div>C</div></div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('colspan="2"');
  });

  it('converts inline-grid to table', () => {
    const input = '<html><body><span style="display: inline-grid; grid-template-columns: 1fr 1fr;"><span>X</span><span>Y</span></span></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('inline-grid');
    expect(result.html).toContain('<table');
  });

  it('adds target=_blank and rel=noopener noreferrer to links', () => {
    const input = '<html><body><a href="https://example.com">Link</a></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('target="_blank"');
    expect(result.html).toContain('rel="noopener noreferrer"');
  });

  it('strips javascript: URLs from links', () => {
    const input = '<html><body><a href="javascript:alert(1)">XSS</a></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('javascript:');
    expect(result.warnings.some((w) => w.message.includes('javascript'))).toBe(true);
  });

  it('converts anchor links to #top', () => {
    const input = '<html><body><a href="#section">Jump</a></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('href="#top"');
  });

  it('preserves existing target and adds to rel', () => {
    const input = '<html><body><a href="https://example.com" target="_self" rel="nofollow">Link</a></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('target="_self"');
    expect(result.html).toContain('noopener');
    expect(result.html).toContain('noreferrer');
    expect(result.html).toContain('nofollow');
  });

  it('preserves media queries in style blocks', () => {
    const input = '<html><head><style>@media only screen and (max-width: 600px) { .hide { display: none; } }</style></head><body><div class="hide">Hidden</div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('@media');
    expect(result.html).toContain('max-width');
  });

  it('warns about max-width media queries', () => {
    const input = '<html><head><style>@media only screen and (max-width: 600px) { .hide { display: none; } }</style></head><body><div class="hide">Hidden</div></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('max-width'))).toBe(true);
  });

  it('warns about prefers-color-scheme', () => {
    const input = '<html><head><style>@media (prefers-color-scheme: dark) { body { background: #000; } }</style></head><body><p>Dark mode</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('prefers-color-scheme'))).toBe(true);
  });

  it('replaces unsafe fonts with safe fallbacks', () => {
    const input = '<html><head><style>body { font-family: "CustomFont", sans-serif; }</style></head><body><p>Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('CustomFont'))).toBe(true);
    expect(result.html).toContain('sans-serif');
  });

  it('keeps safe fonts unchanged', () => {
    const input = '<html><head><style>body { font-family: Arial, Helvetica, sans-serif; }</style></head><body><p>Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('font'))).toBe(false);
  });

  it('replaces inline unsafe fonts', () => {
    const input = '<html><body><p style="font-family: Google Sans;">Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).toContain('Arial');
    expect(result.html).toContain('Helvetica');
  });

  it('strips external stylesheet links', () => {
    const input = '<html><head><link rel="stylesheet" href="https://example.com/style.css"></head><body><p>Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('stylesheet');
    expect(result.warnings.some((w) => w.message.includes('External stylesheet'))).toBe(true);
  });

  it('strips Google Fonts links', () => {
    const input = '<html><head><link href="https://fonts.googleapis.com/css2?family=Roboto" rel="stylesheet"></head><body><p>Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('fonts.googleapis');
    expect(result.warnings.some((w) => w.message.includes('Google Fonts'))).toBe(true);
  });

  it('strips preconnect and dns-prefetch links', () => {
    const input = '<html><head><link rel="preconnect" href="https://example.com"><link rel="dns-prefetch" href="https://cdn.example.com"></head><body><p>Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('preconnect');
    expect(result.html).not.toContain('dns-prefetch');
  });

  it('strips favicon links', () => {
    const input = '<html><head><link rel="icon" href="/favicon.ico"></head><body><p>Hello</p></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.html).not.toContain('favicon');
  });

  it('warns about button elements', () => {
    const input = '<html><body><button>Click me</button></body></html>';
    const result = compileEmail(input);
    expect(result.success).toBe(true);
    expect(result.warnings.some((w) => w.message.includes('<button>'))).toBe(true);
  });
});
