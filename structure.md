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
├── gemini.md                  # Project operational & coding rules for Gemini AI
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
│   │   ├── fuzzySearch.ts     # Fuse.js search & command palette query resolver (g, yt, gh, w)
│   │   ├── rankStorage.ts     # Usage counter & recency scoring engine
│   │   ├── iconResolver.ts    # Multi-tier icon resolution (Lucide / Images / Favicon API)
│   │   ├── keyboardManager.ts # Global keystroke listener & shortcuts dispatcher
│   │   └── cheatsheetData.ts  # Shortcuts cheatsheet data registry
│   │
│   ├── components/            # Preact Functional UI Components
│   │   ├── HeaderClock.tsx    # Floating top-right tools toolbar (Search, Help, Edit, Backup)
│   │   ├── HeaderClock.module.css
│   │   ├── JumpBar.tsx        # Sticky category pills bar with smooth section scroll
│   │   ├── JumpBar.module.css
│   │   ├── ColumnGrid.tsx     # 100% full grid display, scroll containment, drag & drop, inline rename
│   │   ├── ColumnGrid.module.css
│   │   ├── LinkIcon.tsx       # Favicon / Lucide icon renderer component
│   │   ├── ContextMenu.tsx    # Right-click context menu (Edit link, Remove link, English prompt)
│   │   ├── ContextMenu.module.css
│   │   ├── SearchModal.tsx    # Fuzzy search overlay with command palette badges
│   │   ├── SearchModal.module.css
│   │   ├── CheatsheetModal.tsx# Keyboard shortcuts cheatsheet modal
│   │   ├── CheatsheetModal.module.css
│   │   ├── ImportExportModal.tsx # JSON backup/sync import & export modal
│   │   ├── ImportExportModal.module.css
│   │   ├── VisualEditModal.tsx# Custom dark link creator modal with category picker & icon dropdown
│   │   └── VisualEditModal.module.css
│   │
│   ├── types/                 # TypeScript Type Definitions
│   │   └── startpage.ts       # Interfaces for LinkItem, CategoryGroup, SearchResult, etc.
│   │
│   └── styles/                # CSS Design System
│       ├── variables.css      # Dark theme palette tokens, glassmorphism, typography
│       └── global.css         # Global reset, keyframes, scrollbar & layout resets
│
└── tests/                     # Automated Vitest Test Suites
    ├── dataStore.test.ts
    ├── dynamicEvaluator.test.ts
    ├── rankStorage.test.ts
    ├── iconResolver.test.ts
    ├── fuzzySearch.test.ts
    ├── keyboardManager.test.ts
    ├── cheatsheetData.test.ts
    ├── uiComponents.test.tsx
    ├── contextMenu.test.tsx
    ├── dragDrop.test.ts
    ├── reorderModal.test.tsx
    └── integrationFlow.test.tsx
```
