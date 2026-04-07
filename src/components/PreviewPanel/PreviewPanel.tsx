import Editor from '@monaco-editor/react';

interface PreviewPanelProps {
  html: string;
  isCompiling: boolean;
  viewport: 'desktop' | 'mobile';
}

export function PreviewPanel({ html, isCompiling, viewport }: PreviewPanelProps) {
  const width = viewport === 'mobile' ? '375px' : '100%';

  return (
    <div className="preview-panel">
      <div className="preview-container">
        {isCompiling && <div className="compiling-indicator">Compiling...</div>}
        {html ? (
          <iframe
            className="preview-iframe"
            style={{ width }}
            srcDoc={html}
            title="Email Preview"
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <div className="preview-placeholder">
            Start building to see the compiled output
          </div>
        )}
      </div>
    </div>
  );
}

interface CodeViewProps {
  html: string;
}

export function CodeView({ html }: CodeViewProps) {
  return (
    <div className="code-view">
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={html}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: 'on',
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: 'on',
          renderLineHighlight: 'none',
          contextmenu: false,
        }}
      />
    </div>
  );
}

interface JsonViewProps {
  json: string;
}

export function JsonView({ json }: JsonViewProps) {
  return (
    <div className="json-view">
      <Editor
        height="100%"
        defaultLanguage="json"
        theme="vs-dark"
        value={json}
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: 'on',
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          lineNumbers: 'on',
          renderLineHighlight: 'none',
          contextmenu: false,
        }}
      />
    </div>
  );
}
