# Startpage Project - Directory & File Structure

This document outlines the codebase organization and directory structure.

---

## Root Level Directory Structure

```
startpage/
├── index.html                 # Production compiled single-file bundle (main branch)
├── package.json               # Package manifests (Bun, Vite, Preact, Vitest, Fuse.js, Lucide)
├── tsconfig.json              # Strict TypeScript configuration
├── vite.config.ts             # Vite build configuration (vite-plugin-singlefile)
├── vitest.config.ts           # Vitest test runner configuration
├── GEMINI.md                  # Project operational & coding rules for Gemini AI
├── structure.md               # Codebase directory & file layout documentation
├── plan.md                    # Project roadmap & progress tracker
├── TODO.md                    # Detailed master task implementation blueprint
│
├── old_homepage/              # Legacy startpage files reference (config.js, ai-config.js)
│   ├── config.js
│   ├── ai-config.js
│   └── script.js
│
├── src/                       # Application Source Code
│   ├── main.tsx               # Application entry point
│   ├── app.tsx                # Main App component & state orchestration
│   │
│   ├── engine/                # Decoupled Data & Business Logic Engine
│   │   ├── dataStore.ts       # Links, categories, dynamic ordering & LocalStorage persistence
│   │   ├── dynamicEvaluator.ts# Dynamic URL date/time interpolation (Unimib exam/lesson URLs)
│   │   ├── linkExecutor.ts    # Link execution engine (Custom JS bookmarklets & dynamic rules)
│   │   ├── themeEngine.ts     # Dynamic theme colors, grid density, font scaling & Settings manager
│   │   ├── fuzzySearch.ts     # Fuse.js search & command palette query resolver (g, yt, gh, w)
│   │   ├── rankStorage.ts     # Usage counter & recency scoring engine
      │   ├── iconResolver.ts    # Multi-tier icon resolution (Lucide / Images / Favicon API)
│   │   ├── keyboardManager.ts # Global keystroke listener & shortcuts dispatcher
│   │   ├── categoryScroll.ts  # Category column DOM ids & smooth scroll helpers (shared)
│   │   ├── clipboard.ts       # Defensive clipboard write (legacy execCommand fallback)
│   │   └── cheatsheetData.ts  # Shortcuts cheatsheet data registry
│   │
│   ├── components/            # Preact Functional UI Components
│   │   ├── HeaderClock.tsx    # Floating top-right tools toolbar (Search, Help, Settings, Edit)
│   │   ├── HeaderClock.module.css
│   │   ├── MobileBottomNav.tsx# Standalone floating mobile bottom navigation bar (< 1024px)
│   │   ├── MobileBottomNav.module.css
│   │   ├── JumpBar.tsx        # Sticky category pills bar with smooth section scroll
│   │   ├── JumpBar.module.css
│   │   ├── ColumnGrid.tsx     # 100% full grid display, scroll containment, drag & drop, inline rename
│   │   ├── ColumnGrid.module.css
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
│   │   ├── VisualEditModal.tsx# Custom dark link creator modal with category picker & JS script mode
│   │   ├── VisualEditModal.module.css
│   │   ├── Toast.tsx          # Global snackbar host (feedback + Undo actions)
│   │   ├── Toast.module.css
│   │   ├── ConfirmDialog.tsx  # Global themed confirm dialog host (replaces native confirm)
│   │   └── ConfirmDialog.module.css
│   │
│   ├── stores/                # Preact Signals shared state layer
│   │   ├── appStore.ts        # links/categories signals synced with dataStore
│   │   ├── settingsStore.ts   # theme config signal synced with themeEngine
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
    ├── uiComponents.test.tsx
    ├── contextMenu.test.tsx
    ├── searchModal.test.tsx
    ├── dragDrop.test.ts
    ├── reorderModal.test.tsx
    ├── categoryScroll.test.ts
    └── integrationFlow.test.tsx
```
