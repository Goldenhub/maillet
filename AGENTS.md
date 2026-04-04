# AGENTS.md — Maillet

## Project Overview

Maillet — a web app that compiles HTML/CSS email templates into email-safe HTML with a live preview and warnings system.

**Stack:** React 18, TypeScript 5, Vite 5, Monaco Editor, Juice (CSS inlining), Vitest

---

## Commands

### Development
```bash
npm run dev          # Start dev server (Vite HMR)
npm run build        # Production build
npm run preview      # Preview production build locally
```

### Linting & Type Checking
```bash
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking (no emit)
```

### Testing
```bash
npm test             # Run all tests (Vitest)
npm test -- --run    # Run all tests (non-watch mode)
npm test -- <file>   # Run a single test file (e.g. npm test -- compileEmail)
npm test -- --coverage  # Run with coverage report
```

---

## Code Style

### Imports
- Use absolute imports from `@/` alias (e.g., `import { compileEmail } from '@/utils/compiler'`)
- Group imports: external libraries → internal modules → relative imports
- Use named imports over default imports where possible
- Barrel exports via `index.ts` in each directory

### Formatting
- 2-space indentation
- Semicolons required
- Single quotes for strings (JSX uses double quotes)
- Trailing commas (ES5)
- Max line length: 120 characters
- Prettier config enforced via pre-commit hook

### TypeScript
- Strict mode enabled (`strict: true` in tsconfig)
- No `any` — use `unknown` with type narrowing if needed
- Prefer `interface` for object shapes, `type` for unions/intersections
- All function parameters and return types must be explicitly typed
- Use `as const` for literal types where appropriate
- Avoid type assertions (`as Type`) unless unavoidable — prefer type guards

### Naming Conventions
- Components: `PascalCase` (e.g., `EditorPanel`, `WarningsPanel`)
- Hooks: `camelCase` with `use` prefix (e.g., `useCompiler`, `useDebounce`)
- Utilities: `camelCase` (e.g., `compileEmail`, `parseHtml`)
- Types/Interfaces: `PascalCase` (e.g., `CompileResult`, `Warning`)
- Constants: `UPPER_SNAKE_CASE` (e.g., `MAX_INPUT_SIZE`)
- Test files: `<source>.test.ts` (e.g., `compileEmail.test.ts`)

### Component Structure
```tsx
import { useState } from 'react';
import type { ComponentProps } from './types';
import styles from './Component.css';

interface ComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function Component({ value, onChange }: ComponentProps) {
  const [localState, setLocalState] = useState<string>('');

  return <div className={styles.container}>...</div>;
}
```

### Error Handling
- Use `try/catch` in compiler pipeline; never let errors bubble uncaught
- Return `{ success: false, warnings: [...], html: '' }` on failure — never throw
- Add error boundaries for React component failures
- User-facing errors should be descriptive; log technical details to console

### State Management
- Lift state to nearest common ancestor
- Use custom hooks (`useCompiler`, `useDebounce`, `useLocalStorage`) for reusable logic
- No global state library — React hooks are sufficient for this scope
- Derived state (output, warnings) computed from input, not stored independently

### CSS
- CSS Modules for component-scoped styles (`Component.module.css`)
- BEM-like naming for class names within modules
- CSS variables in `styles/variables.css` for shared values
- No inline styles except for dynamic values passed from props

### Testing
- Unit tests for all compiler utilities in `tests/compiler/`
- Test edge cases: empty input, malformed HTML, large inputs
- Use `describe`/`it` blocks with descriptive names
- Arrange-Act-Assert pattern in test bodies

---

## Architecture Notes

- All compilation is client-side — no server calls
- Compiler pipeline: input → parse → inline CSS → transform → validate → output
- Preview uses sandboxed iframe with `srcdoc` (no `src` or blob URLs)
- Debounced compilation at 500ms; manual "Compile Now" bypasses debounce
- Warnings persist dismissal state in localStorage
