# Project Structure

This document tracks the directory layout, module dependencies, and file organization of the Startpage project.

> [!NOTE]
> This file MUST be updated whenever files or directories are added, deleted, or reorganized.

---

## Workspace Root (Branch: `dev`)

```
startpage/
├── .git/                      # Git repository data
├── node_modules/              # Bun / NPM dependencies
├── old_homepage/              # Legacy Tilde homepage files for migration & reference
│   ├── ai.html                # Legacy AI dashboard
│   ├── index.html             # Legacy main dashboard
│   ├── css/
│   │   └── style.css          # Legacy CSS styles
│   └── js/
│       ├── ai-config.js       # Legacy AI commands config
│       ├── config.js          # Legacy commands config & Unimib dynamic functions
│       ├── queryParser.js     # Legacy query parser
│       └── suggester.js       # Legacy suggestion engine
├── src/                       # Source code (TypeScript + Preact)
│   ├── engine/                # Decoupled Data & Keyboard Engine
│   │   ├── cheatsheetData.ts  # Shortcuts definition data for interactive modal
│   │   ├── dataStore.ts       # Config loader, JSON validator, localStorage store
│   │   ├── dynamicEvaluator.ts# Dynamic URL evaluator (Unimib schedules, date interpolation)
│   │   ├── fuzzySearch.ts     # Fuse.js fuzzy search, command palette (g, yt, gh, w), rank sorting
│   │   ├── iconResolver.ts    # Multi-tiered icon resolver (Custom URL -> Lucide -> Favicon API)
│   │   ├── keyboardManager.ts # Global keystroke listener & shortcuts navigator
│   │   └── rankStorage.ts     # LocalStorage usage counter & rank score generator
│   └── types/                 # TypeScript interfaces & types
│       └── startpage.ts       # Link, Category, Rank, Search, & Prefix types
├── tests/                     # Vitest test suites (35/35 tests passing under Bun)
│   ├── cheatsheetData.test.ts
│   ├── dataStore.test.ts
│   ├── dynamicEvaluator.test.ts
│   ├── fuzzySearch.test.ts
│   ├── iconResolver.test.ts
│   ├── keyboardManager.test.ts
│   └── rankStorage.test.ts
├── bun.lock                   # Bun lockfile
├── gemini.md                  # AI agent guidelines & project standards (Bun mandate)
├── package.json               # Package dependencies & scripts
├── plan.md                    # Roadmap, task tracking, & implementation status
├── structure.md               # Project structure documentation
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build configuration (singlefile static HTML output)
└── vitest.config.ts           # Vitest runner configuration
```

---

## Tooling Mandate

- **Package & Test Execution**: Bun exclusively (`bun ./node_modules/vitest/vitest.mjs run`). `npm` and `npx` are strictly prohibited.
- **Module Responsibilities**: `src/engine/` is completely decoupled from UI presentation, tested to 100% reliability across 35 test cases.
