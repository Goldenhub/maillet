# Email Compiler Playground — System Design Document

## 🎯 Objective

Build a web app where:
- **Left side:** User inputs HTML/CSS email template
- **Right side:** Compiled, email-safe HTML preview (iframe)
- **Includes:** Transformation pipeline + warnings system

---

## 1. System Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Email Compiler Playground             │
├──────────────────────┬──────────────────────────────────┤
│  EditorPanel         │  PreviewPanel                    │
│  (Monaco Editor)     │  (Sandboxed iframe)              │
│                      │                                  │
│  User inputs HTML    │  Renders compiled output         │
│  + CSS templates     │                                  │
├──────────────────────┴──────────────────────────────────┤
│                    Compiler Pipeline                     │
│  Input → Parse → Inline CSS → Transform → Validate → Output
├─────────────────────────────────────────────────────────┤
│                    WarningsPanel                         │
│  Displays compatibility issues, unsupported features     │
└─────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Types → Debounce (500ms) → compileEmail() → ─┬→ Preview (iframe srcdoc)
                                                   └→ Warnings (state)
```

### Key Modules & Responsibilities

| Module | Responsibility |
|--------|---------------|
| **Compiler Pipeline** | Core transformation engine: parse, inline, transform, validate |
| **Editor Integration** | Monaco editor setup, syntax highlighting, input capture |
| **Preview Renderer** | Safe iframe rendering with compiled output |
| **Warning System** | Detect and report email compatibility issues |
| **State Manager** | Coordinate input, output, warnings, loading states |

---

## 2. Component Architecture

### App (Container)

**Responsibilities:**
- Layout orchestration (split-pane)
- State coordination between all child components
- Compilation trigger orchestration

**Props:** None (root component)

**State:**
```typescript
interface AppState {
  input: string;           // Raw editor content
  output: string;          // Compiled HTML
  warnings: Warning[];     // Validation results
  isCompiling: boolean;    // Loading indicator
}
```

---

### EditorPanel

**Responsibilities:**
- Render Monaco editor with HTML/CSS syntax highlighting
- Capture content changes via onChange callback
- Display line/column info
- Support basic editor actions (format, clear)

**Props:**
```typescript
interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
  language?: 'html' | 'css';
}
```

**State:** Internal editor instance reference only; all content state lifted to App.

---

### PreviewPanel

**Responsibilities:**
- Render compiled HTML in sandboxed iframe
- Handle iframe resize/responsive preview
- Display loading state during compilation
- Support desktop/mobile viewport toggle

**Props:**
```typescript
interface PreviewPanelProps {
  html: string;
  isCompiling: boolean;
  viewport: 'desktop' | 'mobile';
}
```

**State:** Viewport mode only; iframe rendering is controlled via srcdoc prop.

---

### WarningsPanel

**Responsibilities:**
- Display categorized warnings (errors, warnings, info)
- Group warnings by type (CSS, HTML, compatibility)
- Allow filtering/dismissal
- Show line references where applicable

**Props:**
```typescript
interface WarningsPanelProps {
  warnings: Warning[];
  onDismiss?: (id: string) => void;
  filter?: WarningSeverity;
}

interface Warning {
  id: string;
  severity: 'error' | 'warning' | 'info';
  category: 'css' | 'html' | 'compatibility' | 'security';
  message: string;
  line?: number;
  suggestion?: string;
}
```

**State:** Filter selection, dismissed warning IDs (local storage persistence).

---

## 3. Compiler Pipeline Design

### Pipeline Stages

```
Raw Input
    │
    ▼
┌─────────────┐
│  1. Input   │  Normalize encoding, trim, detect encoding
│  Handling   │
└──────┬──────┘
       │ string
       ▼
┌─────────────┐
│  2. HTML    │  Parse into DOM tree, handle malformed HTML
│  Parsing    │
└──────┬──────┘
       │ Document/AST
       ▼
┌─────────────┐
│  3. CSS     │  Extract <style>, inline all CSS, handle @media
│  Inlining   │
└──────┬──────┘
       │ Document (inlined)
       ▼
┌─────────────┐
│  4. DOM     │  Remove unsupported tags, convert modern → legacy
│  Transform  │  <div> → <table>, strip JS, normalize attributes
└──────┬──────┘
       │ Document (transformed)
       ▼
┌─────────────┐
│  5.         │  Check for unsupported CSS, missing alt tags,
│  Validation │  broken links, accessibility issues
└──────┬──────┘
       │ Warning[]
       ▼
┌─────────────┐
│  6. Output  │  Serialize to string, wrap in email-safe structure
│  Generation │
└──────┬──────┘
       │ { html: string, warnings: Warning[] }
```

---

### Stage 1: Input Handling

- **Input:** Raw string from editor
- **Output:** Normalized string
- **Edge Cases:**
  - Empty input → return empty with warning
  - BOM characters → strip
  - Mixed encodings → normalize to UTF-8
  - Extremely large input (>500KB) → reject with warning

---

### Stage 2: HTML Parsing

- **Input:** Normalized HTML string
- **Output:** DOM Document or AST
- **Tool:** `DOMParser` (browser native) or `linkedom` for SSR support
- **Edge Cases:**
  - Malformed HTML → attempt recovery, warn
  - Missing `<html>` wrapper → auto-wrap
  - Unclosed tags → auto-close, warn
  - XML self-closing tags → normalize

---

### Stage 3: CSS Inlining

- **Input:** Parsed DOM with `<style>` blocks and inline styles
- **Output:** DOM with all CSS inlined as `style` attributes
- **Tool:** `juice` library (battle-tested for email)
- **Edge Cases:**
  - `!important` declarations → preserve, warn
  - `@media` queries → keep in `<style>` (some clients support)
  - CSS variables → unsupported, warn
  - `:hover`, `:focus` pseudo-classes → limited support, warn
  - Complex selectors → flatten where possible
  - External stylesheets (`<link>`) → unsupported, warn

---

### Stage 4: DOM Transformation

- **Input:** CSS-inlined DOM
- **Output:** Email-safe DOM
- **Edge Cases:**
  - `<script>` tags → strip entirely, warn
  - `<iframe>`, `<object>`, `<embed>` → strip, warn
  - `<form>` elements → strip, warn
  - `<video>`, `<audio>` → replace with fallback image, warn
  - `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>` → convert to `<div>` or `<table>`
  - `display: flex/grid` → warn (unsupported in many clients)
  - `position: fixed/absolute` → warn
  - `background-image` → warn (limited support)
  - Custom fonts → warn (limited support)

---

### Stage 5: Validation

- **Input:** Transformed DOM
- **Output:** `Warning[]` array
- **Checks:**
  - Missing `alt` attributes on images
  - Missing `<!DOCTYPE html>`
  - Missing `<meta charset="utf-8">`
  - Inline event handlers (`onclick`, etc.) → strip, warn
  - Broken relative URLs
  - Table structure integrity (missing `<td>` in `<tr>`)
  - Color contrast (basic check)

---

### Stage 6: Output Generation

- **Input:** Validated DOM + warnings
- **Output:** `{ html: string, warnings: Warning[] }`
- **Actions:**
  - Serialize DOM to HTML string
  - Ensure proper email structure
  - Minify output (optional, configurable)
  - Return with warnings

---

## 4. Utility Layer Design

### `compileEmail(input: string): CompileResult`

```typescript
interface CompileResult {
  html: string;
  warnings: Warning[];
  success: boolean;
}

function compileEmail(input: string): CompileResult;
```

**Responsibility:** Orchestrates the full pipeline. Entry point for compilation.

**Dependencies:** All pipeline stage utilities.

---

### `parseHtml(input: string): ParseResult`

```typescript
interface ParseResult {
  document: Document;
  warnings: Warning[];
}

function parseHtml(input: string): ParseResult;
```

**Responsibility:** Parse raw HTML into DOM, handle malformed input.

**Dependencies:** `DOMParser` (browser) or `linkedom`.

---

### `inlineStyles(document: Document): InlineResult`

```typescript
interface InlineResult {
  document: Document;
  warnings: Warning[];
}

function inlineStyles(document: Document): InlineResult;
```

**Responsibility:** Extract all CSS and inline into style attributes.

**Dependencies:** `juice` library.

---

### `transformDom(document: Document): TransformResult`

```typescript
interface TransformResult {
  document: Document;
  warnings: Warning[];
}

function transformDom(document: Document): TransformResult;
```

**Responsibility:** Remove/convert unsupported elements and attributes.

**Dependencies:** None (native DOM manipulation).

---

### `validateEmailHtml(document: Document): Warning[]`

```typescript
function validateEmailHtml(document: Document): Warning[];
```

**Responsibility:** Run all validation checks, return warnings.

**Dependencies:** None.

---

### `removeUnsupportedTags(document: Document): Document`

```typescript
function removeUnsupportedTags(document: Document): Document;
```

**Responsibility:** Strip or replace HTML elements unsupported by email clients.

**Dependencies:** None.

---

### `normalizeHtmlStructure(document: Document): Document`

```typescript
function normalizeHtmlStructure(document: Document): Document;
```

**Responsibility:** Ensure proper email HTML structure (DOCTYPE, head, body, meta tags).

**Dependencies:** None.

---

## 5. State Management Plan

### State Flow

```
App Component
    │
    ├── input (string) ←── EditorPanel.onChange
    │
    ├── isCompiling (boolean)
    │
    ├── output (string) ──→ PreviewPanel.html
    │
    └── warnings (Warning[]) ──→ WarningsPanel.warnings
```

### Compilation Trigger Strategy

- **Primary trigger:** Debounced `useEffect` on `input` state (500ms delay)
- **Manual trigger:** "Compile Now" button to bypass debounce
- **Compilation runs in:** Main thread initially (Web Worker as future optimization)

### State Storage

| State | Storage | Persistence |
|-------|---------|-------------|
| `input` | React state | localStorage (auto-save) |
| `output` | React state | None (derived) |
| `warnings` | React state | None (derived) |
| `isCompiling` | React state | None |
| `viewport` | React state | localStorage |
| `dismissedWarnings` | React state | localStorage |

### Custom Hook: `useCompiler`

```typescript
function useCompiler(input: string, debounceMs?: number) {
  return {
    output: string;
    warnings: Warning[];
    isCompiling: boolean;
    compile: () => void;  // Manual trigger
  };
}
```

This hook encapsulates:
- Debounce logic
- Compilation execution
- Error handling
- Loading state

---

## 6. Performance Strategy

### Debouncing

- **Strategy:** Trailing-edge debounce with 500ms delay
- **Implementation:** Custom `useDebounce` hook or `lodash/debounce`
- **Rationale:** Balances responsiveness with compilation cost

### Avoiding UI Blocking

| Technique | When | Why |
|-----------|------|-----|
| Debounced compilation | On every keystroke | Prevents compile on every character |
| `requestIdleCallback` | For warning panel updates | Runs when browser is idle |
| Web Worker (future) | For large templates (>100KB) | Moves compilation off main thread |
| Virtualized warning list | >50 warnings | Prevents DOM bloat |

### Handling Large Inputs

- **Input size limit:** 500KB (soft), 1MB (hard)
- **Strategy:**
  - Show warning when approaching limit
  - Reject input exceeding hard limit
  - Stream compilation for large inputs (future)
- **Memory:** Release old compilation results before new ones

### Iframe Performance

- Use `srcdoc` instead of `src` with blob URL (no network request)
- Sandbox iframe with minimal permissions: `sandbox="allow-same-origin"`
- No JavaScript execution in preview

---

## 7. Folder & File Structure

```
email-normalizer/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── App.tsx
│   │   ├── EditorPanel/
│   │   │   ├── EditorPanel.tsx
│   │   │   ├── EditorPanel.css
│   │   │   └── index.ts
│   │   ├── PreviewPanel/
│   │   │   ├── PreviewPanel.tsx
│   │   │   ├── PreviewPanel.css
│   │   │   └── index.ts
│   │   ├── WarningsPanel/
│   │   │   ├── WarningsPanel.tsx
│   │   │   ├── WarningsPanel.css
│   │   │   └── index.ts
│   │   └── Toolbar/
│   │       ├── Toolbar.tsx
│   │       ├── Toolbar.css
│   │       └── index.ts
│   ├── hooks/
│   │   ├── useCompiler.ts
│   │   ├── useDebounce.ts
│   │   └── useLocalStorage.ts
│   ├── utils/
│   │   ├── compiler/
│   │   │   ├── index.ts
│   │   │   ├── compileEmail.ts
│   │   │   ├── parseHtml.ts
│   │   │   ├── inlineStyles.ts
│   │   │   ├── transformDom.ts
│   │   │   ├── validateEmailHtml.ts
│   │   │   ├── removeUnsupportedTags.ts
│   │   │   └── normalizeHtmlStructure.ts
│   │   └── constants.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   ├── global.css
│   │   └── variables.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── tests/
│   ├── compiler/
│   │   ├── compileEmail.test.ts
│   │   ├── inlineStyles.test.ts
│   │   └── transformDom.test.ts
│   └── setup.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 8. UX Flow

### Step-by-Step User Interaction

```
1. User opens app
   └─→ Empty editor with placeholder text
   └─→ Preview shows "Start typing to see preview"
   └─→ Warnings panel is hidden

2. User starts typing HTML
   └─→ Editor provides syntax highlighting
   └─→ After 500ms of inactivity:
       └─→ "Compiling..." indicator appears
       └─→ Compilation pipeline runs
       └─→ Preview updates with compiled output
       └─→ Warnings panel appears (if any)

3. User reviews preview
   └─→ Sees email-safe rendered output
   └─→ Can toggle desktop/mobile viewport
   └─→ Can click "Copy HTML" to copy output

4. User reviews warnings
   └─→ Sees categorized issues
   └─→ Can dismiss individual warnings
   └─→ Can filter by severity

5. User iterates
   └─→ Makes changes → debounce → recompile → update
   └─→ Warnings update in real-time

6. User exports
   └─→ "Copy HTML" button copies compiled output
   └─→ "Download HTML" saves compiled file
```

---

## 9. Risk & Edge Case Analysis

### Broken HTML Input

| Risk | Mitigation |
|------|-----------|
| Malformed HTML crashes parser | Use tolerant parser (DOMParser/linkedom), auto-recover |
| Unclosed tags break layout | Auto-close tags, emit warning |
| Missing closing `</style>` | Detect and close, warn |
| Invalid nesting (e.g., `<p>` in `<p>`) | Fix structure, warn |

### Large Templates

| Risk | Mitigation |
|------|-----------|
| UI freezes during compilation | Debounce + Web Worker (future) |
| Memory exhaustion | Input size limits, cleanup old results |
| Slow iframe rendering | Use srcdoc, not blob URLs |

### Unsupported CSS

| Property | Email Client Support | Action |
|----------|---------------------|--------|
| `display: flex` | Poor (Gmail: no) | Warn, suggest table layout |
| `display: grid` | Very poor | Warn, suggest table layout |
| `position: fixed` | Poor | Warn |
| `background-image` | Mixed | Warn, suggest `<img>` fallback |
| `border-radius` | Mixed | Warn |
| CSS variables | Poor | Warn, suggest inline values |
| `@keyframes` / animations | Very poor | Warn, strip |
| `transform` | Poor | Warn |

### Rendering Inconsistencies

| Issue | Mitigation |
|-------|-----------|
| Different client rendering | Document limitations, test against major clients |
| Font rendering differences | Warn about custom fonts |
| Image blocking | Remind users about alt text |
| Dark mode inversion | Future: add dark mode preview |

### Security

| Risk | Mitigation |
|------|-----------|
| XSS via editor input | Iframe sandbox, strip all JS |
| Malicious external resources | Warn on external URLs, no fetch |
| Data leakage | All processing client-side, no server |

---

## 10. Implementation Plan (Step-by-Step)

### Step 1: Project Scaffolding & UI Shell

**Goal:** Basic layout with placeholder panels

- [ ] Initialize Vite + React + TypeScript project
- [ ] Install dependencies: `@monaco-editor/react`, `juice`, `linkedom`
- [ ] Create split-pane layout (CSS Grid or flexbox)
- [ ] Create placeholder components: `EditorPanel`, `PreviewPanel`, `WarningsPanel`
- [ ] Add basic styling and responsive layout
- [ ] Add Toolbar component with "Compile" and "Copy" buttons

**Deliverable:** Functional UI shell with empty panels

---

### Step 2: Editor Integration

**Goal:** Monaco editor with HTML syntax highlighting

- [ ] Integrate `@monaco-editor/react` in `EditorPanel`
- [ ] Configure HTML/CSS language mode
- [ ] Wire up `onChange` to lift state to `App`
- [ ] Add editor toolbar (format, clear, word wrap toggle)
- [ ] Implement `useLocalStorage` hook for auto-save
- [ ] Add placeholder text with sample email template

**Deliverable:** Working code editor with persistence

---

### Step 3: Compiler MVP

**Goal:** Basic compilation pipeline

- [ ] Implement `parseHtml()` with DOMParser
- [ ] Implement `inlineStyles()` with `juice`
- [ ] Implement `removeUnsupportedTags()` (basic: strip `<script>`)
- [ ] Implement `compileEmail()` orchestrator
- [ ] Implement `useCompiler` hook with debounce
- [ ] Add basic error handling (try/catch, error warnings)

**Deliverable:** Input → compile → output string

---

### Step 4: Preview Rendering

**Goal:** Safe iframe preview of compiled output

- [ ] Implement `PreviewPanel` with iframe `srcdoc`
- [ ] Add loading state during compilation
- [ ] Add viewport toggle (desktop/mobile)
- [ ] Handle empty state (placeholder message)
- [ ] Add "Copy HTML" and "Download HTML" buttons

**Deliverable:** Live preview updates as user types

---

### Step 5: Validation + Warnings

**Goal:** Comprehensive warning system

- [ ] Implement `validateEmailHtml()` with all checks
- [ ] Expand `transformDom()` with full unsupported element handling
- [ ] Implement `WarningsPanel` with filtering/dismissal
- [ ] Add warning categories and severity levels
- [ ] Persist dismissed warnings to localStorage
- [ ] Add warning count badge in toolbar

**Deliverable:** Full validation with actionable warnings

---

### Step 6: Polish & Edge Cases

**Goal:** Production-ready quality

- [ ] Add comprehensive error boundaries
- [ ] Handle all edge cases from Risk Analysis
- [ ] Add keyboard shortcuts (Ctrl/Cmd+Enter to compile)
- [ ] Add sample templates dropdown
- [ ] Performance testing with large inputs
- [ ] Cross-browser testing
- [ ] Accessibility audit (WCAG AA)
- [ ] Write unit tests for compiler utilities
- [ ] Write integration tests for full pipeline

**Deliverable:** Production-ready application

---

## Future Enhancements (Out of Scope for MVP)

- Web Worker for compilation off main thread
- Backend service for cross-client testing (Litmus/Email on Acid integration)
- Dark mode preview
- Template library/gallery
- Export as MJML
- Collaborative editing
- Version history / undo

---

## Key Technical Decisions & Rationale

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | React + Vite | Fast DX, large ecosystem, easy to extend |
| Editor | Monaco Editor | Industry standard, excellent HTML support |
| CSS Inlining | `juice` | Battle-tested, used by major email tools |
| HTML Parsing | `DOMParser` (browser) | No extra dependency, fast |
| State Management | React hooks | Sufficient for scope, easy to migrate later |
| Preview | iframe `srcdoc` | Sandboxed, no network requests |
| Build Tool | Vite | Fast HMR, small bundle |
| Language | TypeScript | Type safety, better DX |

---

## Dependencies Summary

| Package | Purpose | Version Constraint |
|---------|---------|-------------------|
| `react` | UI framework | ^18.x |
| `react-dom` | DOM rendering | ^18.x |
| `@monaco-editor/react` | Code editor | ^4.x |
| `juice` | CSS inlining | ^10.x |
| `vite` | Build tool | ^5.x |
| `typescript` | Type safety | ^5.x |
| `vitest` | Testing | ^1.x (dev) |
