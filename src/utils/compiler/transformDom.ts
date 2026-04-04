import type { Warning, TransformResult } from '@/types';
import { UNSUPPORTED_TAGS } from '@/utils/constants';

let warningId = 0;

function createWarning(
  severity: Warning['severity'],
  category: Warning['category'],
  message: string,
  suggestion?: string,
): Warning {
  return { id: `transform-warn-${++warningId}`, severity, category, message, suggestion };
}

const SEMANTIC_TO_TABLE: Record<string, { tag: string; role?: string }> = {
  section: { tag: 'table', role: 'presentation' },
  article: { tag: 'table', role: 'presentation' },
  nav: { tag: 'table', role: 'navigation' },
  header: { tag: 'table', role: 'banner' },
  footer: { tag: 'table', role: 'contentinfo' },
  aside: { tag: 'table', role: 'complementary' },
  main: { tag: 'table', role: 'main' },
  figure: { tag: 'table', role: 'group' },
  figcaption: { tag: 'table', role: 'caption' },
};

function parseStyleDeclarations(style: string): Record<string, string> {
  const declarations: Record<string, string> = {};
  style.split(';').forEach((decl) => {
    const [prop, ...valueParts] = decl.split(':');
    if (prop && valueParts.length > 0) {
      declarations[prop.trim().toLowerCase()] = valueParts.join(':').trim();
    }
  });
  return declarations;
}

function gridToTable(doc: Document): Warning[] {
  const warnings: Warning[] = [];
  const elements = doc.querySelectorAll('*');
  const toConvert: Element[] = [];

  elements.forEach((el) => {
    const style = el.getAttribute('style') || '';
    const declarations = parseStyleDeclarations(style);
    if (declarations.display === 'grid' || declarations.display === 'inline-grid') {
      toConvert.push(el);
    }
  });

  toConvert.forEach((el) => {
    const style = el.getAttribute('style') || '';
    const declarations = parseStyleDeclarations(style);
    const gap = declarations['gap'] || declarations['grid-gap'] || '';
    const columnGap = declarations['column-gap'] || '';
    const justifyItems = declarations['justify-items'] || '';
    const alignItems = declarations['align-items'] || '';
    const justifyContent = declarations['justify-content'] || '';

    const templateColumns = parseGridTrack(declarations['grid-template-columns'] || '');
    const templateRows = parseGridTrack(declarations['grid-template-rows'] || '');

    const children = Array.from(el.children);
    const childCount = children.length;

    if (childCount === 0) {
      const newStyle = style.replace(/display\s*:\s*(inline-)?grid[^;]*;?/gi, '').trim();
      if (newStyle) {
        el.setAttribute('style', newStyle);
      } else {
        el.removeAttribute('style');
      }
      return;
    }

    const colCount = templateColumns.length > 0 ? templateColumns.length : childCount;
    const rowCount = templateRows.length > 0 ? templateRows.length : 1;

    const table = doc.createElement('table');
    table.setAttribute('role', 'presentation');
    table.setAttribute('border', '0');
    table.setAttribute('cellpadding', '0');

    let tableStyle = 'width: 100%;';
    if (gap) {
      table.setAttribute('cellspacing', gap);
    } else if (columnGap) {
      table.setAttribute('cellspacing', columnGap);
    }
    if (justifyContent === 'center') {
      tableStyle += ' margin: 0 auto;';
    } else if (justifyContent === 'end' || justifyContent === 'flex-end') {
      tableStyle += ' margin-left: auto;';
    }
    if (alignItems === 'center') {
      tableStyle += ' text-align: center;';
    }
    table.setAttribute('style', tableStyle.trim());

    const colgroup = doc.createElement('colgroup');
    for (let c = 0; c < colCount; c++) {
      const col = doc.createElement('col');
      if (templateColumns[c]) {
        col.setAttribute('style', `width: ${templateColumns[c]};`);
      } else {
        col.setAttribute('style', `width: ${100 / colCount}%;`);
      }
      colgroup.appendChild(col);
    }
    table.appendChild(colgroup);

    const cellPositions: Array<{ child: Element; col: number; row: number; colSpan: number; rowSpan: number }> = [];
    let autoCol = 0;
    let autoRow = 0;

    children.forEach((child) => {
      const childStyle = parseStyleDeclarations(child.getAttribute('style') || '');
      const gridColumn = parseGridPosition(childStyle['grid-column'] || '');
      const gridRow = parseGridPosition(childStyle['grid-row'] || '');

      let startCol: number;
      let startRow: number;
      let colSpan: number;
      let rowSpan: number;

      if (gridColumn.start) {
        startCol = Math.min(gridColumn.start - 1, colCount - 1);
        startCol = Math.max(0, startCol);
      } else {
        startCol = autoCol;
      }

      if (gridColumn.span) {
        colSpan = gridColumn.span;
      } else if (gridColumn.end) {
        colSpan = Math.min(gridColumn.end - 1, colCount) - startCol;
        colSpan = Math.max(1, colSpan);
      } else {
        colSpan = 1;
      }

      if (gridRow.start) {
        startRow = Math.min(gridRow.start - 1, rowCount - 1);
        startRow = Math.max(0, startRow);
      } else {
        startRow = autoRow;
      }

      if (gridRow.span) {
        rowSpan = gridRow.span;
      } else if (gridRow.end) {
        rowSpan = Math.min(gridRow.end - 1, rowCount) - startRow;
        rowSpan = Math.max(1, rowSpan);
      } else {
        rowSpan = 1;
      }

      cellPositions.push({ child, col: startCol, row: startRow, colSpan, rowSpan });

      if (!gridColumn.start) {
        autoCol += colSpan;
        if (autoCol >= colCount) {
          autoCol = 0;
          autoRow++;
        }
      }
      if (!gridRow.start) {
        autoRow = Math.max(autoRow, startRow);
      }
    });

    const actualRowCount = Math.max(rowCount, autoRow + 1);

    for (let r = 0; r < actualRowCount; r++) {
      const tr = doc.createElement('tr');
      if (templateRows[r]) {
        tr.setAttribute('style', `height: ${templateRows[r]};`);
      }

      for (let c = 0; c < colCount; c++) {
        const td = doc.createElement('td');
        let tdStyle = '';

        const cell = cellPositions.find((p) => p.col === c && p.row === r);
        if (cell) {
          if (cell.colSpan > 1) {
            td.setAttribute('colspan', String(cell.colSpan));
          }
          if (cell.rowSpan > 1) {
            td.setAttribute('rowspan', String(cell.rowSpan));
          }

          const childStyle = parseStyleDeclarations(cell.child.getAttribute('style') || '');

          if (justifyItems === 'center') {
            tdStyle += ' text-align: center;';
          } else if (justifyItems === 'end' || justifyItems === 'flex-end') {
            tdStyle += ' text-align: right;';
          } else if (justifyItems === 'start' || justifyItems === 'flex-start') {
            tdStyle += ' text-align: left;';
          }

          if (alignItems === 'center') {
            tdStyle += ' vertical-align: middle;';
          } else if (alignItems === 'end' || alignItems === 'flex-end') {
            tdStyle += ' vertical-align: bottom;';
          } else if (alignItems === 'start' || alignItems === 'flex-start') {
            tdStyle += ' vertical-align: top;';
          }

          if (childStyle['justify-self'] === 'center') {
            tdStyle += ' text-align: center;';
          } else if (childStyle['justify-self'] === 'end' || childStyle['justify-self'] === 'flex-end') {
            tdStyle += ' text-align: right;';
          }

          if (childStyle['align-self'] === 'center') {
            tdStyle += ' vertical-align: middle;';
          } else if (childStyle['align-self'] === 'end' || childStyle['align-self'] === 'flex-end') {
            tdStyle += ' vertical-align: bottom;';
          }

          if (childStyle.width) {
            tdStyle += ` width: ${childStyle.width};`;
          }

          if (tdStyle) {
            td.setAttribute('style', tdStyle.trim());
          }

          while (cell.child.firstChild) {
            td.appendChild(cell.child.firstChild);
          }
        }

        tr.appendChild(td);
      }

      table.appendChild(tr);
    }

    Array.from(el.attributes).forEach((attr) => {
      if (attr.name !== 'style') {
        table.setAttribute(attr.name, attr.value);
      }
    });

    el.parentNode?.replaceChild(table, el);
    warnings.push(createWarning('info', 'css', `Converted grid layout (${colCount}x${actualRowCount}) to table for email compatibility`));
  });

  return warnings;
}

function parseGridTrack(value: string): string[] {
  if (!value) return [];

  const tracks: string[] = [];
  const cleaned = value.trim();

  const repeatRegex = /repeat\s*\(\s*(\d+)\s*,\s*([^)]+)\)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = repeatRegex.exec(cleaned)) !== null) {
    const before = cleaned.substring(lastIndex, match.index).trim();
    if (before) {
      before.split(/\s+/).forEach((part) => {
        if (part) tracks.push(normalizeTrackValue(part));
      });
    }

    const count = parseInt(match[1], 10);
    const trackValues = match[2].trim().split(/\s+/);
    for (let r = 0; r < count; r++) {
      trackValues.forEach((tv) => {
        if (tv) tracks.push(normalizeTrackValue(tv));
      });
    }

    lastIndex = match.index + match[0].length;
  }

  const remaining = cleaned.substring(lastIndex).trim();
  if (remaining) {
    remaining.split(/\s+/).forEach((part) => {
      if (part) tracks.push(normalizeTrackValue(part));
    });
  }

  return tracks;
}

function normalizeTrackValue(part: string): string {
  if (part === 'minmax') return 'auto';
  if (part.endsWith('fr')) return 'auto';
  return part;
}

function parseGridPosition(value: string): { start?: number; end?: number; span?: number } {
  if (!value) return {};

  const spanMatch = value.match(/span\s+(\d+)/);
  if (spanMatch) {
    return { span: parseInt(spanMatch[1], 10) };
  }

  const parts = value.split(/\s*\/\s*/);
  const result: { start?: number; end?: number } = {};

  if (parts[0]) {
    const num = parseInt(parts[0], 10);
    if (!isNaN(num)) result.start = num;
  }
  if (parts[1]) {
    const num = parseInt(parts[1], 10);
    if (!isNaN(num)) result.end = num;
  }

  return result;
}

function flexToTable(doc: Document): Warning[] {
  const warnings: Warning[] = [];
  const elements = doc.querySelectorAll('*');
  const toConvert: Element[] = [];

  elements.forEach((el) => {
    const style = el.getAttribute('style') || '';
    const declarations = parseStyleDeclarations(style);
    if (declarations.display === 'flex' || declarations.display === 'inline-flex') {
      toConvert.push(el);
    }
  });

  toConvert.forEach((el) => {
    const style = el.getAttribute('style') || '';
    const declarations = parseStyleDeclarations(style);
    const direction = declarations['flex-direction'] || 'row';
    const wrap = declarations['flex-wrap'] === 'wrap';
    const justify = declarations['justify-content'] || '';
    const align = declarations['align-items'] || '';
    const gap = declarations['gap'] || '';

    const children = Array.from(el.children);
    const childCount = children.length;
    if (childCount === 0) {
      const newStyle = style.replace(/display\s*:\s*(inline-)?flex[^;]*;?/gi, '').trim();
      if (newStyle) {
        el.setAttribute('style', newStyle);
      } else {
        el.removeAttribute('style');
      }
      return;
    }

    const table = doc.createElement('table');
    table.setAttribute('role', 'presentation');
    table.setAttribute('cellpadding', '0');
    table.setAttribute('cellspacing', '0');
    table.setAttribute('border', '0');

    let tableStyle = 'width: 100%;';
    if (gap) {
      table.setAttribute('cellspacing', gap);
    }
    if (align === 'center') {
      tableStyle += ' text-align: center;';
    } else if (align === 'flex-end' || align === 'end') {
      tableStyle += ' text-align: right;';
    }
    if (justify === 'center') {
      tableStyle += ' margin: 0 auto;';
    } else if (justify === 'flex-end' || justify === 'end') {
      tableStyle += ' margin-left: auto;';
    }
    table.setAttribute('style', tableStyle.trim());

    if (direction === 'column' || direction === 'column-reverse') {
      const orderedChildren = direction === 'column-reverse' ? [...children].reverse() : children;
      orderedChildren.forEach((child) => {
        const tr = doc.createElement('tr');
        const td = doc.createElement('td');
        const childStyle = parseStyleDeclarations(child.getAttribute('style') || '');
        let tdStyle = '';
        if (align === 'stretch' || !align) {
          tdStyle += 'width: 100%;';
        }
        if (childStyle.flex) {
          const flexVal = childStyle.flex;
          if (flexVal === '1' || flexVal === '1 1 0%' || flexVal === '1 1 0px') {
            tdStyle += 'width: 100%;';
          }
        }
        if (childStyle.flexGrow === '1') {
          tdStyle += 'width: 100%;';
        }
        if (tdStyle) {
          td.setAttribute('style', tdStyle.trim());
        }
        while (child.firstChild) {
          td.appendChild(child.firstChild);
        }
        tr.appendChild(td);
        table.appendChild(tr);
      });
    } else {
      const orderedChildren = direction === 'row-reverse' ? [...children].reverse() : children;
      const tr = doc.createElement('tr');
      const childCount = orderedChildren.length;

      if (wrap) {
        const itemsPerRow = childCount;
        orderedChildren.forEach((child, index) => {
          if (index % itemsPerRow === 0 && index > 0) {
            table.appendChild(tr.cloneNode(false) as HTMLTableRowElement);
          }
          const td = doc.createElement('td');
          const childStyle = parseStyleDeclarations(child.getAttribute('style') || '');
          let tdStyle = 'vertical-align: top;';
          if (childStyle.flex) {
            const flexVal = childStyle.flex;
            if (flexVal === '1' || flexVal === '1 1 0%' || flexVal === '1 1 0px') {
              tdStyle += ` width: ${100 / childCount}%;`;
            }
          }
          if (childStyle.flexGrow === '1') {
            tdStyle += ` width: ${100 / childCount}%;`;
          }
          if (childStyle.flexBasis && childStyle.flexBasis !== 'auto') {
            tdStyle += ` width: ${childStyle.flexBasis};`;
          }
          if (childStyle.width) {
            tdStyle += ` width: ${childStyle.width};`;
          }
          if (align === 'center') {
            tdStyle += ' text-align: center; vertical-align: middle;';
          } else if (align === 'flex-end' || align === 'end') {
            tdStyle += ' text-align: right; vertical-align: bottom;';
          } else if (align === 'flex-start' || align === 'start') {
            tdStyle += ' text-align: left; vertical-align: top;';
          }
          td.setAttribute('style', tdStyle.trim());
          while (child.firstChild) {
            td.appendChild(child.firstChild);
          }
          tr.appendChild(td);
        });
        table.appendChild(tr);
      } else {
        orderedChildren.forEach((child) => {
          const td = doc.createElement('td');
          const childStyle = parseStyleDeclarations(child.getAttribute('style') || '');
          let tdStyle = 'vertical-align: top;';
          if (childStyle.flex) {
            const flexVal = childStyle.flex;
            if (flexVal === '1' || flexVal === '1 1 0%' || flexVal === '1 1 0px') {
              tdStyle += ` width: ${100 / childCount}%;`;
            }
          }
          if (childStyle.flexGrow === '1') {
            tdStyle += ` width: ${100 / childCount}%;`;
          }
          if (childStyle.flexBasis && childStyle.flexBasis !== 'auto') {
            tdStyle += ` width: ${childStyle.flexBasis};`;
          }
          if (childStyle.width) {
            tdStyle += ` width: ${childStyle.width};`;
          }
          if (align === 'center') {
            tdStyle += ' text-align: center; vertical-align: middle;';
          } else if (align === 'flex-end' || align === 'end') {
            tdStyle += ' text-align: right; vertical-align: bottom;';
          } else if (align === 'flex-start' || align === 'start') {
            tdStyle += ' text-align: left; vertical-align: top;';
          }
          td.setAttribute('style', tdStyle.trim());
          while (child.firstChild) {
            td.appendChild(child.firstChild);
          }
          tr.appendChild(td);
        });
        table.appendChild(tr);
      }
    }

    Array.from(el.attributes).forEach((attr) => {
      if (attr.name !== 'style') {
        table.setAttribute(attr.name, attr.value);
      }
    });

    el.parentNode?.replaceChild(table, el);
    warnings.push(createWarning('info', 'css', `Converted flex layout (${direction}, ${childCount} column${childCount > 1 ? 's' : ''}) to table for email compatibility`));
  });

  return warnings;
}

export function removeUnsupportedTags(doc: Document): { document: Document; warnings: Warning[] } {
  const warnings: Warning[] = [];

  UNSUPPORTED_TAGS.forEach((tag) => {
    const elements = doc.querySelectorAll(tag);
    if (elements.length > 0) {
      warnings.push(createWarning('error', 'security', `<${tag}> tags removed (not supported in email)`));
      elements.forEach((el) => {
        if (tag === 'video' || tag === 'audio') {
          const poster = el.getAttribute('poster') || el.getAttribute('src');
          if (poster) {
            const img = doc.createElement('img');
            img.setAttribute('src', poster);
            img.setAttribute('alt', 'Media content');
            img.setAttribute('style', 'max-width: 100%; height: auto;');
            el.parentNode?.replaceChild(img, el);
          } else {
            el.remove();
          }
        } else {
          el.remove();
        }
      });
    }
  });

  Object.entries(SEMANTIC_TO_TABLE).forEach(([semanticTag, { tag: newTag, role }]) => {
    const elements = doc.querySelectorAll(semanticTag);
    if (elements.length > 0) {
      warnings.push(createWarning('info', 'html', `<${semanticTag}> converted to <${newTag}> for email compatibility`));
      elements.forEach((el) => {
        const newEl = doc.createElement(newTag);
        if (role) {
          newEl.setAttribute('role', role);
        }
        Array.from(el.attributes).forEach((attr) => {
          if (attr.name !== 'class' || !['section', 'article', 'nav', 'header', 'footer', 'aside', 'main', 'figure', 'figcaption'].includes(attr.value)) {
            newEl.setAttribute(attr.name, attr.value);
          }
        });
        const tr = doc.createElement('tr');
        const td = doc.createElement('td');
        while (el.firstChild) {
          td.appendChild(el.firstChild);
        }
        tr.appendChild(td);
        newEl.appendChild(tr);
        el.parentNode?.replaceChild(newEl, el);
      });
    }
  });

  const eventAttrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'onfocus', 'onblur'];
  const allElements = doc.querySelectorAll('*');
  allElements.forEach((el) => {
    eventAttrs.forEach((attr) => {
      if (el.hasAttribute(attr)) {
        warnings.push(createWarning('error', 'security', `Inline event handler "${attr}" removed`));
        el.removeAttribute(attr);
      }
    });
  });

  const detailsElements = doc.querySelectorAll('details, summary');
  if (detailsElements.length > 0) {
    warnings.push(createWarning('info', 'html', '<details>/<summary> converted to <div>'));
    detailsElements.forEach((el) => {
      const div = doc.createElement('div');
      Array.from(el.attributes).forEach((attr) => div.setAttribute(attr.name, attr.value));
      while (el.firstChild) div.appendChild(el.firstChild);
      el.parentNode?.replaceChild(div, el);
    });
  }

  const buttonElements = doc.querySelectorAll('button');
  if (buttonElements.length > 0) {
    warnings.push(createWarning('warning', 'compatibility', '<button> elements have limited support in email clients', 'Use a styled <a> element instead'));
  }

  return { document: doc, warnings };
}

export function normalizeHtmlStructure(doc: Document, hasDoctype: boolean = false): { document: Document; warnings: Warning[] } {
  const warnings: Warning[] = [];

  if (!hasDoctype) {
    warnings.push(createWarning('info', 'html', 'Added <!DOCTYPE html>'));
  }

  const metaCharset = doc.querySelector('meta[charset]');
  if (!metaCharset) {
    const meta = doc.createElement('meta');
    meta.setAttribute('charset', 'utf-8');
    doc.head?.prepend(meta);
    warnings.push(createWarning('info', 'html', 'Added <meta charset="utf-8">'));
  }

  const images = doc.querySelectorAll('img');
  images.forEach((img) => {
    if (!img.hasAttribute('alt')) {
      img.setAttribute('alt', '');
    }
    if (img.getAttribute('alt') === '') {
      warnings.push(createWarning('warning', 'html', 'Image has empty alt attribute — add descriptive alt text for accessibility'));
    }

    const src = img.getAttribute('src') || '';
    if (src.startsWith('data:')) {
      warnings.push(createWarning('warning', 'compatibility', 'Base64 image detected — limited support in Gmail and Outlook', 'Use a hosted image URL instead'));
    } else if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      warnings.push(createWarning('info', 'compatibility', 'External image URL detected — images may be blocked by some email clients by default'));
    }

    const width = img.getAttribute('width');
    const height = img.getAttribute('height');

    if (!width && !height) {
      img.setAttribute('width', '100%');
      img.setAttribute('style', (img.getAttribute('style') || '') + ' max-width: 100%; height: auto;');
      warnings.push(createWarning('info', 'html', 'Added width="100%" and responsive styles to image'));
    } else if (width && !height) {
      img.setAttribute('height', 'auto');
    } else if (!width && height) {
      img.setAttribute('width', 'auto');
    }
  });

  const tables = doc.querySelectorAll('table');
  tables.forEach((table) => {
    if (!table.hasAttribute('cellpadding')) table.setAttribute('cellpadding', '0');
    if (!table.hasAttribute('cellspacing')) table.setAttribute('cellspacing', '0');
    if (!table.hasAttribute('border')) table.setAttribute('border', '0');
    if (!table.hasAttribute('role')) table.setAttribute('role', 'presentation');
  });

  const links = doc.querySelectorAll('a[href]');
  links.forEach((link) => {
    const href = link.getAttribute('href') || '';

    if (href.toLowerCase().startsWith('javascript:')) {
      warnings.push(createWarning('error', 'security', `javascript: URL removed from link`));
      link.setAttribute('href', '#');
      return;
    }

    if (href.toLowerCase().startsWith('data:')) {
      warnings.push(createWarning('warning', 'security', `data: URL removed from link`));
      link.setAttribute('href', '#');
      return;
    }

    if (href.startsWith('#') && href.length > 1) {
      link.setAttribute('href', '#top');
      warnings.push(createWarning('info', 'html', `Anchor link converted to #top (in-page anchors unreliable in email)`));
    }

    if (!link.hasAttribute('target')) {
      link.setAttribute('target', '_blank');
      warnings.push(createWarning('info', 'html', 'Added target="_blank" to link — links in email should open in new tab'));
    }

    const existingRel = link.getAttribute('rel') || '';
    const relParts = existingRel.split(/\s+/).filter(Boolean);
    const missingRel: string[] = [];
    if (!relParts.includes('noopener')) {
      relParts.push('noopener');
      missingRel.push('noopener');
    }
    if (!relParts.includes('noreferrer')) {
      relParts.push('noreferrer');
      missingRel.push('noreferrer');
    }
    if (missingRel.length > 0) {
      link.setAttribute('rel', relParts.join(' '));
      warnings.push(createWarning('info', 'html', `Added rel="${missingRel.join(' ')}" to link for security`));
    }
  });

  return { document: doc, warnings };
}

export function transformDom(doc: Document, hasDoctype: boolean = false): TransformResult {
  const allWarnings: Warning[] = [];

  const { document: afterTags, warnings: tagWarnings } = removeUnsupportedTags(doc);
  allWarnings.push(...tagWarnings);

  const flexWarnings = flexToTable(afterTags);
  allWarnings.push(...flexWarnings);

  const gridWarnings = gridToTable(afterTags);
  allWarnings.push(...gridWarnings);

  const { document: afterNormalize, warnings: normalizeWarnings } = normalizeHtmlStructure(afterTags, hasDoctype);
  allWarnings.push(...normalizeWarnings);

  return { document: afterNormalize, warnings: allWarnings, hasDoctype };
}
