# Startpage Project - Directory & File Structure

This document outlines the codebase organization and directory structure (dev branch, aligned to the real tree as of 2026-08-03).

---

## Root Level Directory Structure

```
startpage/
├── index.html                 # Vite dev template (entry HTML; production bundle lives in dist/ or on main)
├── package.json               # Package manifest (Bun, Vite, Preact, Vitest, Fuse.js, Lucide) — v0.4.0
├── bun.lock                   # Bun lockfile (single source for --frozen-lockfile installs)
├── tsconfig.json              # Strict TypeScript configuration
├── vite.config.ts             # Vite build configuration (vite-plugin-singlefile, base './', terser, visualizer)
├── vitest.config.ts           # Vitest runner configuration (jsdom, tests/setup.ts, v8 coverage)
├── eslint.config.mjs          # ESLint 9 flat config (typescript-eslint + prettier compat)
├── .prettierrc                # Prettier configuration
├── .prettierignore            # Prettier ignore rules (dist, lockfile)
├── .gitignore                 # node_modules, dist/, coverage/, .DS_Store, ...
├── gemini.md                  # Project operational & coding rules (incl. §5 trust model)
├── structure.md               # Codebase directory & file layout documentation (this file)
├── plan.md                    # Project roadmap & progress tracker
├── TODO.md                    # Detailed master task implementation blueprint
├── AUDIT.md                   # Optimization audit checklist (P0-P7, live checkboxes)
├── EXECUTION_PLAN.md          # Audit execution plan (phases, gates, recovery)
│
├── src/                       # Application Source Code
│   ├── main.tsx               # Application entry point (+ script-consent confirm handler wiring)
│   ├── app.tsx                # Main App component & state orchestration (signals-driven)
│   ├── vite-env.d.ts          # Vite client type references
│   │
│   ├── engine/                # Decoupled Data & Business Logic Engine
│   │   ├── index.ts           # Explicit barrel (named exports only)
│   │   ├── dataStore.ts       # Links, categories, dynamic ordering & LocalStorage persistence
│   │   ├── dynamicEvaluator.ts# Dynamic URL date/time interpolation (Unimib exam/lesson URLs)
│   │   ├── linkExecutor.ts    # Link execution engine (custom JS bookmarklets & dynamic rules)
│   │   ├── scriptConsent.ts   # Per-hash user consent gate for non-builtin scripts
│   │   ├── themeEngine.ts     # Dynamic theme colors, grid density, font scaling & Settings manager
│   │   ├── fuzzySearch.ts     # Fuse.js search & command palette query resolver (g, yt, gh, w)
│   │   ├── rankStorage.ts     # Usage counter & recency scoring engine (debounced persist)
│   │   ├── iconResolver.ts    # Multi-tier icon resolution (Lucide / Images / Favicon API)
│   │   ├── keyboardManager.ts # Global keystroke listener & shortcuts dispatcher
│   │   ├── categoryScroll.ts  # Category column DOM ids & smooth scroll helpers (shared)
│   │   ├── clipboard.ts       # Defensive clipboard write (legacy execCommand fallback)
│   │   └── cheatsheetData.ts  # Shortcuts cheatsheet data registry
│   │
│   ├── components/            # Preact Functional UI Components
│   │   ├── index.ts           # Explicit barrel (named exports only)
│   │   ├── ActionToolbar.tsx  # Shared action buttons (search/help/settings/edit), header|bottomNav variants
│   │   ├── ActionToolbar.module.css
│   │   ├── JumpBar.tsx        # Sticky category pills bar with smooth section scroll
│   │   ├── JumpBar.module.css
│   │   ├── ColumnGrid.tsx     # Grid orchestrator: columns, DnD/context hooks, page chevron, toast undo
│   │   ├── ColumnGrid.module.css  # Styles for ColumnGrid + CategoryColumn + DraggableLinkCard
│   │   ├── CategoryColumn.tsx # One category column: header (dblclick rename, drag) + masked link list
│   │   ├── DraggableLinkCard.tsx # Memoized draggable link row card (uses ColumnGrid.module.css)
│   │   ├── LinkIcon.tsx       # Favicon / Lucide icon renderer component
│   │   ├── LinkIcon.module.css
│   │   ├── ContextMenu.tsx    # Right-click / long-press context menu (Edit, Remove, Move category)
│   │   ├── ContextMenu.module.css
│   │   ├── SearchModal.tsx    # Fuzzy search overlay with ARIA combobox pattern & live region
│   │   ├── SearchModal.module.css
│   │   ├── CheatsheetModal.tsx# Keyboard shortcuts cheatsheet modal
│   │   ├── CheatsheetModal.module.css
│   │   ├── SettingsModal.tsx  # Theme palette, grid density, font scaling & search engine settings
│   │   ├── SettingsModal.module.css
│   │   ├── ImportExportModal.tsx # JSON backup/sync import & export modal
│   │   ├── ImportExportModal.module.css
│   │   ├── VisualEditModal/   # Link creator/editor modal folder (all use ../VisualEditModal.module.css)
│   │   │   ├── index.tsx      #   Modal shell: tabs, submit, dirty-form confirm
│   │   │   ├── FormFields.tsx #   Title/URL/alias/icon fields + icon picker
│   │   │   ├── CategoryPicker.tsx # Category select + new-category input
│   │   │   ├── PreviewPanel.tsx   # Live link card preview
│   │   │   └── ScriptEditor.tsx   # Custom JS / bookmarklet editor
│   │   ├── VisualEditModal.module.css
│   │   ├── ReorderModal.tsx   # Category column ordering modal
│   │   ├── ReorderModal.module.css
│   │   ├── Toast.tsx          # Global snackbar host (feedback + Undo actions)
│   │   ├── Toast.module.css
│   │   ├── ConfirmDialog.tsx  # Global themed confirm dialog host (replaces native confirm)
│   │   ├── ConfirmDialog.module.css
│   │   ├── iconRegistry.ts    # Curated Lucide icons registry (tree-shaken) + picker search helpers
│   │   └── modals/
│   │       ├── Modal.tsx      # Base dialog: body portal, scroll-lock, inert, focus trap, aria-label
│   │       └── Modal.module.css
│   │
│   ├── hooks/                 # Custom Hooks
│   │   ├── index.ts           # Explicit barrel (named exports only)
│   │   ├── useModals.ts       # Discriminated modal state (activeModal union; no stacked modals)
│   │   ├── useKeyboardShortcuts.ts # Global shortcuts wiring (handlers via current-ref, attach once)
│   │   ├── useDragAndDrop.ts  # Link/category HTML5 DnD lifecycle (drag state + drop mutations)
│   │   ├── useContextMenu.ts  # Card context menu state (right-click + touch long-press)
│   │   └── useColumnScrollMasks.ts # Gradient fade-mask measurement via registered refs
│   │
│   ├── stores/                # Preact Signals shared state layer (single state path)
│   │   ├── index.ts           # Explicit barrel (named exports only)
│   │   ├── appStore.ts        # links/categories signals synced with dataStore + appActions mutations
│   │   ├── settingsStore.ts   # theme config signal synced with themeEngine + settingsActions
│   │   ├── toastStore.ts      # Transient toast/snackbar queue signal
│   │   ├── confirmStore.ts    # Promise-based confirm dialog signal
│   │   └── dragStore.ts       # Drag hover signals (per-card computed; no grid-wide dragover re-render)
│   │
│   ├── types/                 # TypeScript Type Definitions
│   │   └── startpage.ts       # Interfaces for LinkItem, CategoryGroup, SearchResult, ThemeConfig, etc.
│   │
│   └── styles/                # CSS Design System
│       ├── variables.css      # Dynamic theme palette tokens, glassmorphism, typography
│       └── global.css         # Global reset, keyframes, scrollbar & layout resets
│
└── tests/                     # Automated Vitest Test Suites (29 suites + shared setup)
    ├── setup.ts               # Global per-test storage/isolation reset (loaded via setupFiles)
    ├── dataStore.test.ts
    ├── dynamicEvaluator.test.ts
    ├── linkExecutor.test.ts
    ├── scriptConsent.test.ts
    ├── rankStorage.test.ts
    ├── iconResolver.test.ts
    ├── fuzzySearch.test.ts
    ├── keyboardManager.test.ts
    ├── cheatsheetData.test.ts
    ├── themeEngine.test.ts
    ├── categoryScroll.test.ts
    ├── dynamicUrlCache.test.ts
    ├── signalsStore.test.ts
    ├── hooks.test.tsx
    ├── uiComponents.test.tsx
    ├── linkIcon.test.tsx
    ├── contextMenu.test.tsx
    ├── columnGrid.test.tsx
    ├── dragDrop.test.tsx
    ├── searchModal.test.tsx
    ├── settingsModal.test.tsx
    ├── visualEditModal.test.tsx
    ├── importExportModal.test.tsx
    ├── modalBase.test.tsx
    ├── modalHooksGuard.test.tsx
    ├── reorderModal.test.tsx
    ├── accessibility.test.tsx
    ├── integrationFlow.test.tsx
    └── productionBuild.test.ts
```
