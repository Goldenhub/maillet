import Editor, { type OnMount } from '@monaco-editor/react';
import { useState, useRef } from 'react';

interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
}

export function EditorPanel({ value, onChange }: EditorPanelProps) {
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleMount: OnMount = (editor) => {
    editorRef.current = editor;
    setIsEditorLoading(false);
  };

  const handleFormat = () => {
    if (editorRef.current) {
      editorRef.current.getAction('editor.action.formatDocument')?.run();
    }
  };

  return (
    <div className="editor-panel">
      <div className="editor-toolbar">
        <button className="editor-toolbar-btn" onClick={handleFormat} type="button" title="Format code (Shift+Alt+F)">
          Format
        </button>
      </div>
      {isEditorLoading && <div className="editor-loading">Loading editor...</div>}
      <Editor
        height="100%"
        defaultLanguage="html"
        theme="vs-dark"
        value={value}
        onChange={(val) => onChange(val || '')}
        onMount={handleMount}
        loading={null}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          wordWrap: 'on',
          tabSize: 2,
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16 },
        }}
      />
    </div>
  );
}
