import type { Warning } from '@/types';

let warningId = 0;

function createWarning(
  severity: Warning['severity'],
  category: Warning['category'],
  message: string,
  suggestion?: string,
): Warning {
  return { id: `css-transform-${++warningId}`, severity, category, message, suggestion };
}

const SAFE_FONTS = new Set([
  'arial', 'helvetica', 'verdana', 'tahoma', 'trebuchet ms',
  'georgia', 'times new roman', 'palatino', 'garamond', 'bookman',
  'courier new', 'courier', 'comic sans ms', 'impact',
  'lucida console', 'lucida sans unicode', 'lucida grande',
  'sans-serif', 'serif', 'monospace', 'cursive', 'fantasy',
  'system-ui', '-apple-system', 'blinkmacsystemfont', 'segoe ui',
  'roboto', 'oxygen', 'ubuntu', 'cantarell', 'fira sans',
  'droid sans', 'helvetica neue',
]);

function sanitizeFontFamily(fontFamily: string): { fonts: string; warnings: Warning[] } {
  const warnings: Warning[] = [];
  const fonts = fontFamily.split(',').map((f) => f.trim().replace(/^['"]|['"]$/g, ''));
  const safeFonts: string[] = [];
  const unsafeFonts: string[] = [];

  fonts.forEach((font) => {
    if (SAFE_FONTS.has(font.toLowerCase())) {
      safeFonts.push(font);
    } else {
      unsafeFonts.push(font);
    }
  });

  if (unsafeFonts.length > 0 && safeFonts.length === 0) {
    safeFonts.push('Arial');
    safeFonts.push('Helvetica');
    safeFonts.push('sans-serif');
    warnings.push(createWarning('warning', 'css', `Unsafe font "${unsafeFonts.join(', ')}" replaced with Arial, Helvetica, sans-serif`));
  } else if (unsafeFonts.length > 0) {
    warnings.push(createWarning('info', 'css', `Unsafe font "${unsafeFonts.join(', ')}" removed, kept safe fallbacks: ${safeFonts.join(', ')}`));
  }

  return { fonts: safeFonts.join(', '), warnings };
}

const cssTransforms: Array<{
  pattern: RegExp;
  transform: (match: string) => string;
  warning: string;
}> = [
  {
    pattern: /position\s*:\s*fixed[^;]*;?/gi,
    transform: () => 'position: static;',
    warning: 'Converted position:fixed to position:static for email compatibility',
  },
  {
    pattern: /position\s*:\s*sticky[^;]*;?/gi,
    transform: () => 'position: static;',
    warning: 'Converted position:sticky to position:static for email compatibility',
  },
  {
    pattern: /position\s*:\s*absolute[^;]*;?/gi,
    transform: () => 'position: relative;',
    warning: 'Converted position:absolute to position:relative for email compatibility',
  },
  {
    pattern: /gap\s*:\s*[^;]+;?/gi,
    transform: (match) => match, // Keep gap for clients that support it, but warn
    warning: 'CSS gap property has limited support in email clients',
  },
  {
    pattern: /backdrop-filter\s*:\s*[^;]+;?/gi,
    transform: () => '',
    warning: 'Removed backdrop-filter (not supported in email)',
  },
  {
    pattern: /filter\s*:\s*[^;]+;?/gi,
    transform: () => '',
    warning: 'Removed CSS filter property (not supported in email)',
  },
  {
    pattern: /clip-path\s*:\s*[^;]+;?/gi,
    transform: () => '',
    warning: 'Removed clip-path (not supported in email)',
  },
  {
    pattern: /object-fit\s*:\s*[^;]+;?/gi,
    transform: () => '',
    warning: 'Removed object-fit (not supported in email)',
  },
  {
    pattern: /var\s*\(\s*--[^)]+\)/gi,
    transform: (match) => {
      const fallback = match.match(/var\s*\(\s*--[^,]+,\s*([^)]+)\)/);
      return fallback ? fallback[1] : 'inherit';
    },
    warning: 'CSS variables not supported, replaced with fallback value',
  },
];

const pseudoClassRemovals = [
  /:hover/gi,
  /:focus/gi,
  /:active/gi,
  /:visited/gi,
  /:focus-within/gi,
  /:focus-visible/gi,
];

const animationRemovals = [
  /@keyframes\s+[^{]+\{[^}]*\}/gi,
  /animation\s*:[^;]+;?/gi,
  /animation-name\s*:[^;]+;?/gi,
  /animation-duration\s*:[^;]+;?/gi,
  /animation-timing-function\s*:[^;]+;?/gi,
  /animation-delay\s*:[^;]+;?/gi,
  /animation-iteration-count\s*:[^;]+;?/gi,
  /animation-direction\s*:[^;]+;?/gi,
  /transition\s*:[^;]+;?/gi,
  /transform\s*:[^;]+;?/gi,
];

export function transformCss(css: string): { css: string; warnings: Warning[] } {
  const warnings: Warning[] = [];
  let result = css;

  result = result.replace(/font-family\s*:\s*([^;]+);?/gi, (_match, value) => {
    const { fonts, warnings: fontWarnings } = sanitizeFontFamily(value.trim());
    warnings.push(...fontWarnings);
    return `font-family: ${fonts};`;
  });

  const mediaQueries = result.match(/@media[^{]*\{(?:[^{}]*\{[^}]*\})*[^}]*\}/gi);
  if (mediaQueries) {
    const mediaTypes = new Set<string>();
    mediaQueries.forEach((mq) => {
      const typeMatch = mq.match(/@media\s+([^{]+)/i);
      if (typeMatch) {
        const condition = typeMatch[1].trim();
        mediaTypes.add(condition);

        if (condition.includes('prefers-color-scheme')) {
          warnings.push(createWarning('info', 'css', 'prefers-color-scheme detected — supported in Apple Mail, iOS Mail, Samsung Mail, Outlook Mac'));
        } else if (condition.includes('max-width') || condition.includes('min-width')) {
          warnings.push(createWarning('warning', 'css', `@media (${condition}) — not supported in Gmail web/app or Outlook desktop`, 'Ensure base styles work without media queries'));
        } else {
          warnings.push(createWarning('warning', 'css', `@media (${condition}) has limited email client support`));
        }
      }
    });
  }

  animationRemovals.forEach((pattern) => {
    const matches = result.match(pattern);
    if (matches && matches.length > 0) {
      warnings.push(createWarning('info', 'css', 'Removed CSS animations/transitions (not supported in email)'));
      result = result.replace(pattern, '');
    }
  });

  pseudoClassRemovals.forEach((pattern) => {
    const matches = result.match(pattern);
    if (matches && matches.length > 0) {
      warnings.push(createWarning('info', 'css', 'Removed pseudo-class selectors (limited email support)'));
    }
  });

  cssTransforms.forEach(({ pattern, transform, warning }) => {
    const matches = result.match(pattern);
    if (matches && matches.length > 0) {
      warnings.push(createWarning('info', 'css', warning));
      result = result.replace(pattern, transform);
    }
  });

  result = result.replace(/:[a-z-]+(?=\s*\{)/gi, (match) => {
    const pseudo = match.slice(1);
    const validPseudos = ['first-child', 'last-child', 'only-child', 'first-of-type', 'last-of-type', 'only-of-type', 'not', 'nth-child', 'nth-of-type', 'nth-last-child', 'nth-last-of-type'];
    if (validPseudos.includes(pseudo)) {
      return match;
    }
    return '';
  });

  result = result.replace(/,\s*,/g, ',').replace(/,\s*\}/g, '}').replace(/\s*\{\s*\}/g, '');

  return { css: result, warnings };
}

export function transformInlineStyles(styleAttr: string): { style: string; warnings: Warning[] } {
  const warnings: Warning[] = [];
  let result = styleAttr;

  result = result.replace(/font-family\s*:\s*([^;]+);?/gi, (_match, value) => {
    const { fonts, warnings: fontWarnings } = sanitizeFontFamily(value.trim());
    warnings.push(...fontWarnings);
    return `font-family: ${fonts};`;
  });

  cssTransforms.forEach(({ pattern, transform, warning }) => {
    const matches = result.match(pattern);
    if (matches && matches.length > 0) {
      warnings.push(createWarning('info', 'css', warning));
      result = result.replace(pattern, transform);
    }
  });

  return { style: result, warnings };
}
