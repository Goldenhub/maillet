export interface Warning {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'css' | 'html' | 'compatibility' | 'security';
  message: string;
  line?: number;
  suggestion?: string;
}

export interface CompileResult {
  html: string;
  warnings: Warning[];
  success: boolean;
}

export interface ParseResult {
  document: Document;
  warnings: Warning[];
  hasDoctype: boolean;
}

export interface InlineResult {
  document: Document;
  warnings: Warning[];
  hasDoctype: boolean;
}

export interface TransformResult {
  document: Document;
  warnings: Warning[];
  hasDoctype: boolean;
}

export type WarningSeverity = Warning['severity'];
