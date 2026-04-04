# Maillet

**Email Compiler Playground** — compile HTML/CSS email templates into email-safe HTML with a live preview and warnings system.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- **Live Preview** — real-time compiled output with desktop/mobile viewport toggle
- **Flex & Grid to Tables** — automatically converts modern layouts into email-safe table structures
- **CSS Inlining** — all CSS inlined into `style` attributes via Juice
- **Smart Warnings** — real-time detection of unsupported CSS, missing alt text, unsafe links, and more
- **Auto-Fixes** — strips scripts, converts semantic HTML5 elements, sanitizes links, replaces unsafe fonts
- **Code Formatting** — one-click formatting with Monaco Editor
- **Auto-Save** — work persists in localStorage across sessions
- **Link Sanitization** — strips `javascript:` and `data:` URLs, adds security attributes
- **Font Safety** — replaces unsupported fonts with safe system fallbacks
- **Media Query Support** — preserves `@media` queries for progressive enhancement
- **100% Client-Side** — no server, no uploads, no tracking

## Tech Stack

- **React 18** + **TypeScript 5**
- **Vite 5** for fast HMR and builds
- **Monaco Editor** for the code editor
- **Juice** for CSS inlining
- **Vitest** for testing

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript type checking |
| `npm test` | Run tests in watch mode |
| `npm test -- --run` | Run all tests once |
| `npm test -- --coverage` | Run tests with coverage report |

## Project Structure

```
email-normalizer/
├── src/
│   ├── components/          # React components
│   │   ├── EditorPanel/     # Monaco editor wrapper
│   │   ├── PreviewPanel/    # iframe preview + code view
│   │   ├── WarningsPanel/   # Warning display & filtering
│   │   ├── Toolbar/         # Action buttons
│   │   ├── LandingPage/     # Landing page
│   │   └── ErrorBoundary.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useCompiler.ts   # Compilation with debounce
│   │   ├── useDebounce.ts   # Debounce utility
│   │   ├── useLocalStorage.ts # localStorage persistence
│   │   └── useTheme.ts      # Light/dark/system theme
│   ├── utils/compiler/      # Compilation pipeline
│   │   ├── compileEmail.ts  # Pipeline orchestrator
│   │   ├── parseHtml.ts     # HTML parsing
│   │   ├── inlineStyles.ts  # CSS inlining (Juice)
│   │   ├── transformDom.ts  # DOM transformations
│   │   ├── transformCss.ts  # CSS transformations
│   │   ├── validateEmailHtml.ts # Validation checks
│   │   ├── ensureEmailMetaTags.ts # Email meta tags
│   │   └── formatHtml.ts    # Output formatting
│   ├── types/               # TypeScript type definitions
│   ├── styles/              # Global CSS
│   ├── App.tsx              # Router & page layout
│   ├── PlaygroundPage.tsx   # Compiler playground
│   └── main.tsx             # Entry point
├── tests/
│   └── compiler/            # Compiler unit tests
├── docs/
│   └── DESIGN.md            # System design document
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

## Compiler Pipeline

```
Input → Parse → Inline CSS → Transform DOM → Add Meta Tags → Validate → Format → Output
```

### Transformations

| Input | Output |
|-------|--------|
| `display: flex` | `<table>` with columns from flex children |
| `display: grid` | `<table>` with `colgroup`, `colspan`, `rowspan` |
| `<section>`, `<article>`, etc. | `<table role="presentation">` |
| `<script>`, `<iframe>`, `<form>` | Removed |
| `javascript:` / `data:` URLs | Stripped |
| Unsafe fonts | Replaced with system fallbacks |
| Missing `alt` on images | Added with warning |
| Missing `target` on links | `target="_blank" rel="noopener noreferrer"` added |

### Supported Email Meta Tags

The compiler automatically adds essential meta tags for all major email clients:

- `<meta charset="utf-8">`
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<meta http-equiv="X-UA-Compatible" content="IE=edge">` (Outlook)
- `<meta name="x-apple-disable-message-reformatting">` (Apple Mail)
- `<meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">`

## Theme

Toggle between **Light**, **Dark**, and **System** themes using the button in the toolbar. Theme preference is persisted in localStorage.

## License

MIT
