import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';

interface ToolbarProps {
  warningCount: number;
  isCompiling: boolean;
  onCompile: () => void;
  onCopy: () => void;
  onClear: () => void;
  onReset: () => void;
  backLink?: string;
}

export function Toolbar({ warningCount, isCompiling, onCompile, onCopy, onClear, onReset, backLink }: ToolbarProps) {
  const [compileFeedback, setCompileFeedback] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { mode, cycleTheme } = useTheme();

  const themeIcon = mode === 'light' ? 'sun' : mode === 'dark' ? 'moon' : 'monitor';

  const handleCompile = useCallback(() => {
    onCompile();
    setCompileFeedback(true);
    setTimeout(() => setCompileFeedback(false), 1500);
  }, [onCompile]);

  const handleCopy = useCallback(() => {
    onCopy();
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 1500);
  }, [onCopy]);

  const hasErrors = warningCount > 0;

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        {backLink && (
          <Link className="toolbar-btn back-btn" to={backLink}>
            ← Back
          </Link>
        )}
        <h1 className="toolbar-title">Maillet Playground</h1>
      </div>
      <div className="toolbar-right">
        {isCompiling && <span className="toolbar-status">Compiling...</span>}
        <button className="theme-toggle" onClick={cycleTheme} type="button" title={`Theme: ${mode}`}>
          {themeIcon === 'sun' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          )}
          {themeIcon === 'moon' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
          {themeIcon === 'monitor' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
          )}
        </button>
        <button
          className={`toolbar-btn ${hasErrors ? 'has-warnings' : ''} ${compileFeedback ? 'feedback-active' : ''}`}
          onClick={handleCompile}
          type="button"
        >
          {compileFeedback ? 'Compiled!' : 'Compile Now'}
        </button>
        <button
          className={`toolbar-btn ${copyFeedback ? 'feedback-active' : ''}`}
          onClick={handleCopy}
          type="button"
        >
          {copyFeedback ? 'Copied!' : 'Copy HTML'}
        </button>
        <button className="toolbar-btn" onClick={onClear} type="button">
          Clear
        </button>
        <button className="toolbar-btn" onClick={onReset} type="button">
          Reset
        </button>
      </div>
    </div>
  );
}
