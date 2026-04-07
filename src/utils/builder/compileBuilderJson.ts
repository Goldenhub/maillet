import type {
  Block,
  TextBlock,
  HeadingBlock,
  ImageBlock,
  ButtonBlock,
  LinkBlock,
  DividerBlock,
  SpacerBlock,
  ColumnsBlock,
  EmailBuilderData,
} from '@/types/builder';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildStyle(styles: Record<string, string | number | boolean | undefined>, opts?: { autoMargin?: boolean }): string {
  const pairs: string[] = [];
  for (const [key, value] of Object.entries(styles)) {
    if (key === 'marginAuto') continue;
    if (value !== undefined && value !== '' && value !== false) {
      const kebab = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      pairs.push(`${kebab}: ${value}${typeof value === 'number' ? 'px' : ''}`);
    }
  }
  if (opts?.autoMargin) {
    pairs.push('margin-left: auto');
    pairs.push('margin-right: auto');
  }
  return pairs.join('; ');
}

function renderText(block: TextBlock): string {
  const style = buildStyle({
    fontSize: block.styles?.fontSize,
    lineHeight: block.styles?.lineHeight,
    textAlign: block.styles?.textAlign,
    color: block.styles?.color,
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  return `<p${style ? ` style="${style}"` : ''}>${escapeHtml(block.content)}</p>`;
}

function renderHeading(block: HeadingBlock): string {
  const tag = `h${block.level}`;
  const style = buildStyle({
    fontSize: block.styles?.fontSize ?? (block.level === 1 ? 28 : block.level === 2 ? 24 : 20),
    textAlign: block.styles?.textAlign,
    color: block.styles?.color,
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  return `<${tag}${style ? ` style="${style}"` : ''}>${escapeHtml(block.content)}</${tag}>`;
}

function renderImage(block: ImageBlock): string {
  const style = buildStyle({
    width: block.styles?.width,
    height: block.styles?.height,
    textAlign: block.styles?.textAlign,
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  const textAlign = block.styles?.textAlign ?? 'center';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="${textAlign}"${style ? ` style="${style}"` : ''}>
      <img src="${escapeHtml(block.src)}" alt="${escapeHtml(block.alt)}"${block.styles?.width ? ` width="${block.styles.width}"` : ''}${block.styles?.height ? ` height="${block.styles.height}"` : ''} style="display: block; border: 0;${block.styles?.width ? ` width: ${block.styles.width}px;` : ''} max-width: 100%;" />
    </td>
  </tr>
</table>`;
}

function renderButton(block: ButtonBlock): string {
  const bgColor = block.styles?.backgroundColor ?? '#4CAF50';
  const color = block.styles?.color ?? '#ffffff';
  const fontSize = block.styles?.fontSize ?? 16;
  const textAlign = block.styles?.textAlign ?? 'center';
  const fullWidth = block.styles?.fullWidth ?? false;

  const paddingStyle = buildStyle({
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  if (fullWidth) {
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="${textAlign}"${paddingStyle ? ` style="${paddingStyle}"` : ''}>
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
        <tr>
          <td align="center" style="background-color: ${bgColor}; border-radius: ${block.styles?.borderRadius ?? 4}px;">
            <a href="${escapeHtml(block.href)}" target="_blank" rel="noopener" style="display: block; padding: 12px 24px; font-size: ${fontSize}px; color: ${color}; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold;">${escapeHtml(block.content)}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
  }

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0"${paddingStyle ? ` style="${paddingStyle}"` : ''}>
  <tr>
    <td align="center" style="background-color: ${bgColor}; border-radius: ${block.styles?.borderRadius ?? 4}px;">
      <a href="${escapeHtml(block.href)}" target="_blank" rel="noopener" style="display: inline-block; padding: 12px 24px; font-size: ${fontSize}px; color: ${color}; text-decoration: none; font-family: Arial, sans-serif; font-weight: bold;">${escapeHtml(block.content)}</a>
    </td>
  </tr>
</table>`;
}

function renderLink(block: LinkBlock): string {
  const color = block.styles?.color ?? '#1a73e8';
  const fontSize = block.styles?.fontSize ?? 14;
  const textAlign = block.styles?.textAlign ?? 'left';
  const underline = block.styles?.underline ?? true;

  const style = buildStyle({
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  const textDecoration = underline ? 'underline' : 'none';

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="${textAlign}"${style ? ` style="${style}"` : ''}>
      <a href="${escapeHtml(block.href)}" target="_blank" rel="noopener" style="color: ${color}; font-size: ${fontSize}px; text-decoration: ${textDecoration}; font-family: Arial, sans-serif;">${escapeHtml(block.content)}</a>
    </td>
  </tr>
</table>`;
}

function renderDivider(block: DividerBlock): string {
  const color = block.styles?.color ?? '#e0e0e0';
  const thickness = block.styles?.thickness ?? 1;
  const width = block.styles?.width ?? '100%';

  const style = buildStyle({
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    backgroundColor: block.styles?.backgroundColor,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td${style ? ` style="${style}"` : ''}>
      <hr style="border: none; border-top: ${thickness}px solid ${color}; width: ${typeof width === 'number' ? `${width}px` : width}; margin: 0;" />
    </td>
  </tr>
</table>`;
}

function renderSpacer(block: SpacerBlock): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td height="${block.height}" style="font-size: 0; line-height: ${block.height}px;">&nbsp;</td>
  </tr>
</table>`;
}

function renderColumns(block: ColumnsBlock): string {
  const gap = block.styles?.gap ?? 16;

  const style = buildStyle({
    paddingTop: block.styles?.paddingTop,
    paddingRight: block.styles?.paddingRight,
    paddingBottom: block.styles?.paddingBottom,
    paddingLeft: block.styles?.paddingLeft,
    backgroundColor: block.styles?.backgroundColor,
    borderRadius: block.styles?.borderRadius,
    marginTop: block.styles?.marginTop,
    marginRight: block.styles?.marginRight,
    marginBottom: block.styles?.marginBottom,
    marginLeft: block.styles?.marginLeft,
    marginAuto: block.styles?.marginAuto,
  }, { autoMargin: block.styles?.marginAuto });

  const colPct = Math.floor(10000 / block.count) / 100;

  const columnsHtml = block.children
    .map(
      (colBlocks, index) => {
        const isFirst = index === 0;
        const tdStyle = [
          `width: ${colPct}%`,
          'vertical-align: top',
          !isFirst ? `padding-left: ${gap}px` : '',
        ].filter(Boolean).join('; ');

        return `
      <td style="${tdStyle}">
        ${colBlocks.map((child) => renderBlock(child)).join('\n        ')}
      </td>`;
      }
    )
    .join('\n');

  return `<!-- Columns (${block.count}) -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"${style ? ` style="${style}"` : ''}>
  <tr>${columnsHtml}
  </tr>
</table>`;
}

function renderBlock(block: Block): string {
  switch (block.type) {
    case 'text':
      return renderText(block as TextBlock);
    case 'heading':
      return renderHeading(block as HeadingBlock);
    case 'image':
      return renderImage(block as ImageBlock);
    case 'button':
      return renderButton(block as ButtonBlock);
    case 'link':
      return renderLink(block as LinkBlock);
    case 'divider':
      return renderDivider(block as DividerBlock);
    case 'spacer':
      return renderSpacer(block as SpacerBlock);
    case 'columns':
      return renderColumns(block as ColumnsBlock);
    default:
      return '';
  }
}

export function compileBuilderJson(data: EmailBuilderData): string {
  const fontFamily = data.globalStyles?.fontFamily ?? 'Arial, sans-serif';
  const bgColor = data.globalStyles?.backgroundColor ?? '#ffffff';
  const fontSize = data.globalStyles?.fontSize ?? 16;
  const color = data.globalStyles?.color ?? '#333333';

  const bodyHtml = data.blocks.map((block) => renderBlock(block)).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <title>Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: ${bgColor}; font-family: ${fontFamily}; font-size: ${fontSize}px; color: ${color};">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: ${bgColor};">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        ${bodyHtml}
      </td>
    </tr>
  </table>
</body>
</html>`;
}
