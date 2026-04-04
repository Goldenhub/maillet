import { useCallback } from 'react';
import { EditorPanel } from './components/EditorPanel';
import { PreviewPanel } from './components/PreviewPanel';
import { WarningsPanel } from './components/WarningsPanel';
import { Toolbar } from './components/Toolbar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useCompiler } from './hooks/useCompiler';
import { useLocalStorage } from './hooks/useLocalStorage';
import { STORAGE_KEY_INPUT, STORAGE_KEY_DISMISSED_WARNINGS } from './utils/constants';
import './styles/global.css';

const DEFAULT_TEMPLATE = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; }
    .footer { background: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
    .button { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; text-decoration: none; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to Email Compiler</h1>
    </div>
    <div class="content">
      <p>This is a sample email template. Start editing to see the compiled output!</p>
      <a href="https://example.com" class="button">Click Me</a>
    </div>
    <div class="footer">
      <p>&copy; 2026 Email Compiler Playground</p>
    </div>
  </div>
</body>
</html>`;

export function PlaygroundPage() {
  const [input, setInput] = useLocalStorage<string>(STORAGE_KEY_INPUT, DEFAULT_TEMPLATE);
  const [dismissedIds, setDismissedIds] = useLocalStorage<string[]>(STORAGE_KEY_DISMISSED_WARNINGS, []);
  const { output, warnings, isCompiling, compile } = useCompiler(input);

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
  }, [setInput]);

  const handleDismiss = useCallback((id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  }, [setDismissedIds]);

  const dismissedSet = new Set(dismissedIds);

  return (
    <ErrorBoundary>
      <div className="app">
        <Toolbar
          warningCount={warnings.filter((w) => !dismissedSet.has(w.id)).length}
          isCompiling={isCompiling}
          onCompile={compile}
          onCopy={handleCopy}
          onClear={handleClear}
          backLink="/"
        />
        <div className="main-content">
          <EditorPanel value={input} onChange={setInput} />
          <PreviewPanel html={output} isCompiling={isCompiling} />
        </div>
        <WarningsPanel
          warnings={warnings}
          onDismiss={handleDismiss}
          dismissedIds={dismissedSet}
        />
      </div>
    </ErrorBoundary>
  );
}
