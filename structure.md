# Project Structure

This document tracks the directory layout, module dependencies, and file organization of the Startpage project.

> [!NOTE]
> This file MUST be updated whenever files or directories are added, deleted, or reorganized.

---

## Workspace Root (Branch: `dev`)

```
startpage/
├── .git/                      # Git repository data
├── gemini.md                  # AI agent guidelines & workflow rules
├── structure.md               # Project file & directory structure documentation
└── plan.md                    # Roadmap, task tracking, & implementation status
```

---

## Planned Directory Structure (To be initialized in Phase 1)

```
startpage/
├── .github/                   # GitHub Actions (optional static build automation)
│   └── workflows/
│       └── deploy.yml
├── data/                      # Sample and default data configuration
│   └── links.json             # Default link categories, aliases, & icons configuration
├── old_homepage/              # (Optional) User's legacy homepage files for migration
├── src/                       # Source code (TypeScript + Preact)
│   ├── assets/                # Local icons, images, & static assets
│   ├── components/            # UI Components (Preact)
│   │   ├── ColumnGrid/        # Multi-column links layout
│   │   ├── SearchModal/       # Fuzzy search overlay & rank list
│   │   ├── CheatsheetModal/   # Keyboard shortcuts overlay
│   │   ├── JumpBar/           # Quick section navigation bar
│   │   └── Common/            # Shared UI elements (badges, buttons, icons)
│   ├── engine/                # Core Data & Business Logic (Decoupled Data Layer)
│   │   ├── dataStore.ts       # Config loader & JSON schema validator
│   │   ├── dynamicEvaluator.ts# Dynamic URL parser (date interpolation, JS expressions)
│   │   ├── fuzzySearch.ts     # Fuse.js fuzzy search engine & rank booster
│   │   ├── rankStorage.ts     # LocalStorage frequency & recency tracker
│   │   └── iconResolver.ts    # Favicon auto-fetch + fallback icon resolver
│   ├── styles/                # Global CSS & Design Tokens
│   │   ├── variables.css      # Dark premium color palette & typography
│   │   └── global.css         # Utility classes & reset
│   ├── types/                 # TypeScript interfaces & types
│   │   └── startpage.ts       # Link, Category, Rank, & Search types
│   ├── app.tsx                # Main application component
│   └── main.tsx               # Application entry point
├── tests/                     # Vitest test suites
│   ├── dynamicEvaluator.test.ts
│   ├── fuzzySearch.test.ts
│   ├── rankStorage.test.ts
│   └── iconResolver.test.ts
├── dist/                      # Production build output (bundled static files)
├── package.json               # NPM package dependencies & scripts
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration (singlefile / static output)
├── vitest.config.ts           # Vitest configuration
├── gemini.md                  # AI agent guidelines
├── structure.md               # Project structure documentation
└── plan.md                    # Detailed project plan & progress tracker
```

---

## Module Responsibilities

- **`src/engine/`**: Pure TypeScript modules containing zero UI logic. Responsible for state, search, URL generation, and storage. Can be tested independently.
- **`src/components/`**: Preact UI components. Consumes `src/engine/` APIs for rendering.
- **`data/links.json`**: Plain JSON configuration file storing all link definitions. Editable directly by the user or imported/exported via local storage.
