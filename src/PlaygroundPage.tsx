import { useCallback, useMemo, useState } from "react";
import { EditorPanel } from "./components/EditorPanel";
import { PreviewPanel, CodeView, JsonView } from "./components/PreviewPanel";
import { WarningsPanel } from "./components/WarningsPanel";
import { Toolbar } from "./components/Toolbar";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { BuilderSidebar } from "./components/BuilderSidebar";
import { BuilderCanvas } from "./components/BuilderCanvas";
import { BlockEditor } from "./components/BlockEditor";
import { useCompiler } from "./hooks/useCompiler";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { compileBuilderJson } from "./utils/builder";
import { compileEmail } from "./utils/compiler/compileEmail";
import { createBlock, createDefaultBuilderData, removeBlock, duplicateBlock, updateBlockInTreeData } from "./utils/builder";
import type { Block, BlockType, ColumnsBlock, EmailBuilderData } from "./types/builder";
import { STORAGE_KEY_INPUT, STORAGE_KEY_DISMISSED_WARNINGS, STORAGE_KEY_BUILDER_DATA, STORAGE_KEY_EDITOR_MODE } from "./utils/constants";
import "./styles/global.css";

function findBlockInTree(blocks: Block[], id: string | null): Block | null {
  if (!id) return null;
  for (const block of blocks) {
    if (block.id === id) return block;
    if (block.type === "columns") {
      for (const col of (block as ColumnsBlock).children) {
        const found = findBlockInTree(col, id);
        if (found) return found;
      }
    }
  }
  return null;
}

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

type EditorMode = "code" | "builder";
type BuilderView = "preview" | "code" | "json";

export function PlaygroundPage() {
  const [input, setInput] = useLocalStorage<string>(STORAGE_KEY_INPUT, DEFAULT_TEMPLATE);
  const [dismissedIds, setDismissedIds] = useLocalStorage<string[]>(STORAGE_KEY_DISMISSED_WARNINGS, []);
  const [mode, setMode] = useLocalStorage<EditorMode>(STORAGE_KEY_EDITOR_MODE, "code");
  const [builderData, setBuilderData] = useLocalStorage<EmailBuilderData>(STORAGE_KEY_BUILDER_DATA, createDefaultBuilderData());
  const [selectedBlockId, setSelectedBlockId] = useLocalStorage<string | null>("email-builder-selected", null);
  const [builderView, setBuilderView] = useState<BuilderView>("preview");
  const [builderViewport, setBuilderViewport] = useState<"desktop" | "mobile">("desktop");
  const [codeView, setCodeView] = useState<"preview" | "code">("preview");

  const { output: codeOutput, warnings: codeWarnings, isCompiling: codeIsCompiling, compile: codeCompile } = useCompiler(input);

  const builderHtml = useMemo(() => {
    if (mode !== "builder") return "";
    try {
      const rawHtml = compileBuilderJson(builderData);
      return compileEmail(rawHtml).html;
    } catch {
      return "";
    }
  }, [builderData, mode]);

  const builderJson = useMemo(() => {
    if (mode !== "builder") return "";
    try {
      return JSON.stringify(builderData, null, 2);
    } catch {
      return "";
    }
  }, [builderData, mode]);

  const builderWarnings = useMemo(() => {
    if (mode !== "builder") return [];
    return [];
  }, [mode]);

  const output = mode === "builder" ? builderHtml : codeOutput;
  const warnings = mode === "builder" ? builderWarnings : codeWarnings;
  const isCompiling = mode === "builder" ? false : codeIsCompiling;

  const handleCopy = useCallback(async () => {
    if (output) {
      await navigator.clipboard.writeText(output);
    }
  }, [output]);

  const handleClear = useCallback(() => {
    if (mode === "builder") {
      setBuilderData(createDefaultBuilderData());
      setSelectedBlockId(null);
    } else {
      setInput("");
    }
  }, [mode, setBuilderData, setSelectedBlockId, setInput]);

  const handleReset = useCallback(() => {
    if (mode === "builder") {
      setBuilderData(createDefaultBuilderData());
      setSelectedBlockId(null);
    } else {
      setInput(DEFAULT_TEMPLATE);
    }
  }, [mode, setBuilderData, setSelectedBlockId, setInput]);

  const handleDismiss = useCallback(
    (id: string) => {
      setDismissedIds((prev) => [...prev, id]);
    },
    [setDismissedIds],
  );

  const handleAddBlock = useCallback(
    (type: BlockType) => {
      const newBlock = createBlock(type);
      setBuilderData((prev) => ({
        ...prev,
        blocks: [...prev.blocks, newBlock],
      }));
    },
    [setBuilderData],
  );

  const handleDeleteBlock = useCallback(
    (id: string) => {
      setBuilderData((prev) => removeBlock(prev, id));
      setSelectedBlockId((prev) => (prev === id ? null : prev));
    },
    [setBuilderData, setSelectedBlockId],
  );

  const handleDuplicateBlock = useCallback(
    (id: string) => {
      setBuilderData((prev) => duplicateBlock(prev, id));
    },
    [setBuilderData],
  );

  const handleUpdateBlock = useCallback(
    (updatedBlock: Block) => {
      setBuilderData((prev) => updateBlockInTreeData(prev, updatedBlock.id, updatedBlock));
    },
    [setBuilderData],
  );

  const handleUpdateGlobalStyles = useCallback(
    (updatedData: EmailBuilderData) => {
      setBuilderData(updatedData);
    },
    [setBuilderData],
  );

  const handleSelectBlock = useCallback(
    (id: string | null) => {
      setSelectedBlockId(id);
    },
    [setSelectedBlockId],
  );

  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      setMode(newMode);
    },
    [setMode],
  );

  const dismissedSet = new Set(dismissedIds);

  const selectedBlock = useMemo(() => findBlockInTree(builderData.blocks, selectedBlockId), [builderData.blocks, selectedBlockId]);

  return (
    <ErrorBoundary>
      <div className="app">
        <Toolbar warningCount={warnings.filter((w) => !dismissedSet.has(w.id)).length} isCompiling={isCompiling} onCompile={mode === "builder" ? () => {} : codeCompile} onCopy={handleCopy} onClear={handleClear} onReset={handleReset} backLink="/" mode={mode} onModeChange={handleModeChange} />
        {mode === "builder" ? (
          <div className="builder-layout">
            <BuilderSidebar onAddBlock={handleAddBlock} />
            <div className="builder-main-content">
              <div className="builder-editor-area">
                <BuilderCanvas data={builderData} selectedBlockId={selectedBlockId} onSelectBlock={handleSelectBlock} onDataChange={setBuilderData} onDeleteBlock={handleDeleteBlock} onDuplicateBlock={handleDuplicateBlock} />
                <BlockEditor block={selectedBlock} data={builderData} onUpdateBlock={handleUpdateBlock} onUpdateGlobalStyles={handleUpdateGlobalStyles} />
              </div>
              <div className="builder-preview-area">
                <div className="builder-view-toolbar">
                  <div className="builder-view-toggle">
                    <button className={`builder-view-btn ${builderView === "preview" ? "active" : ""}`} onClick={() => setBuilderView("preview")} type="button">
                      Preview
                    </button>
                    <button className={`builder-view-btn ${builderView === "code" ? "active" : ""}`} onClick={() => setBuilderView("code")} type="button">
                      HTML
                    </button>
                    <button className={`builder-view-btn ${builderView === "json" ? "active" : ""}`} onClick={() => setBuilderView("json")} type="button">
                      JSON
                    </button>
                  </div>
                  {builderView === "preview" && (
                    <div className="viewport-toggle">
                      <button className={builderViewport === "desktop" ? "active" : ""} onClick={() => setBuilderViewport("desktop")} type="button">
                        Desktop
                      </button>
                      <button className={builderViewport === "mobile" ? "active" : ""} onClick={() => setBuilderViewport("mobile")} type="button">
                        Mobile
                      </button>
                    </div>
                  )}
                </div>
                {builderView === "preview" && <PreviewPanel html={builderHtml} isCompiling={false} viewport={builderViewport} />}
                {builderView === "code" && <CodeView html={builderHtml} />}
                {builderView === "json" && <JsonView json={builderJson} />}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="main-content">
              <EditorPanel value={input} onChange={setInput} />
              <div className="builder-preview-area">
                <div className="builder-view-toolbar">
                  <div className="builder-view-toggle">
                    <button className={`builder-view-btn ${codeView === "preview" ? "active" : ""}`} onClick={() => setCodeView("preview")} type="button">
                      Preview
                    </button>
                    <button className={`builder-view-btn ${codeView === "code" ? "active" : ""}`} onClick={() => setCodeView("code")} type="button">
                      HTML
                    </button>
                  </div>
                </div>
                {codeView === "preview" && <PreviewPanel html={output} isCompiling={isCompiling} viewport="desktop" />}
                {codeView === "code" && <CodeView html={output} />}
              </div>
            </div>
            <WarningsPanel warnings={warnings} onDismiss={handleDismiss} dismissedIds={dismissedSet} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}
