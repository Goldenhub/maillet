const VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

export function formatHtml(html: string, indent: string = '  '): string {
  if (!html.trim()) return html;

  const hasDoctype = /^<!DOCTYPE\s+html/i.test(html.trim());

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const root = doc.documentElement;

  function formatNode(node: Node, depth: number): string {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim() || '';
      return text ? `${indent.repeat(depth)}${text}\n` : '';
    }

    if (node.nodeType !== Node.ELEMENT_NODE) return '';

    const el = node as Element;
    const tag = el.tagName.toLowerCase();
    const attrs = Array.from(el.attributes)
      .map((a) => ` ${a.name}="${a.value}"`)
      .join('');

    if (VOID_ELEMENTS.has(tag)) {
      return `${indent.repeat(depth)}<${tag}${attrs} />\n`;
    }

    const children = Array.from(el.childNodes);
    const hasTextContent = children.some(
      (c) => c.nodeType === Node.TEXT_NODE && c.textContent?.trim()
    );
    const hasElementChildren = children.some((c) => c.nodeType === Node.ELEMENT_NODE);

    if (!hasTextContent && !hasElementChildren) {
      return `${indent.repeat(depth)}<${tag}${attrs}></${tag}>\n`;
    }

    let result = '';

    if (hasTextContent && !hasElementChildren) {
      const text = children.map((c) => c.textContent?.trim() || '').join(' ');
      result = `${indent.repeat(depth)}<${tag}${attrs}>${text}</${tag}>\n`;
    } else {
      result = `${indent.repeat(depth)}<${tag}${attrs}>\n`;
      children.forEach((child) => {
        result += formatNode(child, depth + 1);
      });
      result += `${indent.repeat(depth)}</${tag}>\n`;
    }

    return result;
  }

  let formatted = formatNode(root, 0).trim();

  if (hasDoctype) {
    formatted = `<!DOCTYPE html>\n${formatted}`;
  }

  return formatted;
}
