# Startpage Project - Directory & File Structure

This document outlines the codebase organization and directory structure.

---

## Root Level Directory Structure

```
startpage/
├── index.html                 # Vite dev template (entry HTML; production bundle lives in dist/ or on main)
├── package.json               # Package manifests (Bun, Vite, Preact, Vitest, Fuse.js, Lucide)
├── tsconfig.json              # Strict TypeScript configuration
├── vite.config.ts             # Vite build configuration (vite-plugin-singlefile)
├── vitest.config.ts           # Vitest test runner configuration
├── gemini.md                  # Project operational & coding rules
├── structure.md               # Codebase directory & file layout documentation
├── plan.md                    # Project roadmap & progress tracker
├── TODO.md                    # Detailed master task implementation blueprint
├── AUDIT.md                   # Optimization audit checklist (P0-P7)
├── EXECUTION_PLAN.md          # Audit execution plan (phases, gates, recovery)
│
├── src/                       # Application Source Code
│   ├── main.tsx               # Application entry point
│   ├── app.tsx                # Main App component & state orchestration (signals-driven)
│   ├── vite-env.d.ts          # Vite client type references
│   │
│   ├── engine/                # Decoupled Data & Business Logic Engine
│   │   ├── index.ts           # Explicit barrel (named exports only)
│   │   ├── dataStore.ts       # Links, categories, dynamic ordering & LocalStorage persistence
│   │   ├── dynamicEvaluator.ts# Dynamic URL date/time interpolation (Unimib exam/lesson URLs)
│   │   ├── linkExecutor.ts    # Link execution engine (Custom JS bookmarklets & dynamic rules)
│   │   ├── themeEngine.ts     # Dynamic theme colors, grid density, font scaling & Settings manager
│   │   ├── fuzzySearch.ts     # Fuse.js search & command palette query resolver (g, yt, gh, w)
│   │   ├── rankStorage.ts     # Usage counter & recency scoring engine
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
│   │   ├── ColumnGrid.module.css
│   │   ├── CategoryColumn.tsx # One category column: header (dblclick rename, drag) + masked link list
│   │   ├── DraggableLinkCard.tsx # Memoized draggable link row card
│   │   ├── LinkIcon.tsx       # Favicon / Lucide icon renderer component
│   │   ├── ContextMenu.tsx    # Right-click context menu (Edit link, Remove link, Move category)
│   │   ├── ContextMenu.module.css
│   │   ├── SearchModal.tsx    # Fuzzy search overlay with instant virtual keyboard focus & commands
│   │   ├── SearchModal.module.css
│   │   ├── CheatsheetModal.tsx# Keyboard shortcuts cheatsheet modal
│   │   ├── CheatsheetModal.module.css
│   │   ├── SettingsModal.tsx  # Theme palette, grid density, font scaling & search engine settings
│   │   ├── SettingsModal.module.css
│   │   ├── ImportExportModal.tsx # JSON backup/sync import & export modal
│   │   ├── ImportExportModal.module.css
│   │   ├── VisualEditModal/   # Link creator/editor modal (folder: index + Preview/FormFields/CategoryPicker/ScriptEditor)
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
│   │   └── confirmStore.ts    # Promise-based confirm dialog signal
│   │
│   ├── types/                 # TypeScript Type Definitions
│   │   └── startpage.ts       # Interfaces for LinkItem, CategoryGroup, SearchResult, ThemeConfig, etc.
│   │
│   └── styles/                # CSS Design System
│       ├── variables.css      # Dynamic theme palette tokens, glassmorphism, typography
│       └── global.css         # Global reset, keyframes, scrollbar & layout resets
│
└── tests/                     # Automated Vitest Test Suites
    ├── dataStore.test.ts
    ├── dynamicEvaluator.test.ts
    ├── linkExecutor.test.ts
    ├── rankStorage.test.ts
    ├── iconResolver.test.ts
    ├── fuzzySearch.test.ts
    ├── keyboardManager.test.ts
    ├── cheatsheetData.test.ts
    ├── signalsStore.test.ts
    ├── hooks.test.tsx
    ├── uiComponents.test.tsx
    ├── contextMenu.test.tsx
    ├── columnGrid.test.tsx
    ├── searchModal.test.tsx
    ├── visualEditModal.test.tsx
    ├── modalBase.test.tsx
    ├── modalHooksGuard.test.tsx
    ├── accessibility.test.tsx
    ├── dragDrop.test.ts
    ├── reorderModal.test.tsx
    ├── categoryScroll.test.ts
    ├── productionBuild.test.ts
    └── integrationFlow.test.tsx
```
