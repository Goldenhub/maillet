import { useState } from 'react';
import Editor from '@monaco-editor/react';

interface PreviewPanelProps {
  html: string;
  isCompiling: boolean;
}

export function PreviewPanel({ html, isCompiling }: PreviewPanelProps) {
  const [viewport, setViewport] = useState<'desktop' | 'mobile'>('desktop');
  const [viewMode, setViewMode] = useState<'preview' | 'code'>('preview');

  const width = viewport === 'mobile' ? '375px' : '100%';

  return (
    <div className="preview-panel">
      <div className="preview-toolbar">
        <div className="view-toggle">
          <button
            className={viewMode === 'preview' ? 'active' : ''}
            onClick={() => setViewMode('preview')}
            type="button"
          >
            Preview
          </button>
          <button
            className={viewMode === 'code' ? 'active' : ''}
            onClick={() => setViewMode('code')}
            type="button"
          >
            Code
          </button>
        </div>
        {viewMode === 'preview' && (
          <div className="viewport-toggle">
            <button
              className={viewport === 'desktop' ? 'active' : ''}
              onClick={() => setViewport('desktop')}
              type="button"
            >
              Desktop
            </button>
            <button
              className={viewport === 'mobile' ? 'active' : ''}
              onClick={() => setViewport('mobile')}
              type="button"
            >
              Mobile
            </button>
          </div>
        )}
      </div>
      <div className="preview-container">
        {isCompiling && <div className="compiling-indicator">Compiling...</div>}
        {html ? (
          viewMode === 'preview' ? (
            <iframe
              className="preview-iframe"
              style={{ width }}
              srcDoc={html}
              title="Email Preview"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
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
          )
        ) : (
          <div className="preview-placeholder">
            Start typing HTML to see the compiled output
          </div>
        )}
      </div>
    </div>
  );
}
