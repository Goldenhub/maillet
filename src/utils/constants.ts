export const MAX_INPUT_SIZE = 500 * 1024; // 500KB soft limit
export const MAX_INPUT_SIZE_HARD = 1024 * 1024; // 1MB hard limit
export const DEBOUNCE_MS = 500;
export const STORAGE_KEY_INPUT = 'email-compiler-input';
export const STORAGE_KEY_VIEWPORT = 'email-compiler-viewport';
export const STORAGE_KEY_DISMISSED_WARNINGS = 'email-compiler-dismissed';

export const UNSUPPORTED_TAGS = ['script', 'iframe', 'object', 'embed', 'form', 'video', 'audio', 'source', 'track', 'canvas', 'svg', 'math'];

export const SEMANTIC_TO_DIV = ['section', 'article', 'nav', 'header', 'footer', 'aside', 'main', 'figure', 'figcaption'];
