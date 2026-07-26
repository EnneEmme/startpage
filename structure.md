# Project Structure

This document tracks the directory layout, module dependencies, and file organization of the Startpage project.

> [!NOTE]
> This file MUST be updated whenever files or directories are added, deleted, or reorganized.

---

## Workspace Root (Branch: `dev`)

```
startpage/
├── .git/                      # Git repository data
├── dist/                      # Production single-file static distribution build (dist/index.html)
├── node_modules/              # Bun dependencies
├── old_homepage/              # Legacy Tilde homepage files for reference
├── src/                       # Source code (TypeScript + Preact)
│   ├── assets/                # Static assets & icons
│   ├── components/            # Preact UI Components (Dark Premium Design)
│   │   ├── CheatsheetModal.tsx# Interactive Keyboard Shortcuts Modal
│   │   ├── ColumnGrid.tsx     # Categorized Multi-Column Links Grid
│   │   ├── HeaderClock.tsx    # Real-time Clock, Date, & Quick Tools Header
│   │   ├── ImportExportModal.tsx # JSON Backup / Sync Configuration Modal
│   │   ├── JumpBar.tsx        # Column Section Switcher & Category Filter
│   │   ├── LinkIcon.tsx       # Dynamic Multi-Tiered Icon Renderer
│   │   ├── SearchModal.tsx    # Fuzzy Search Overlay & Command Palette Redirect
│   │   └── VisualEditModal.tsx# Direct UI Add/Edit Link Modal
│   ├── engine/                # Decoupled Data & Keyboard Engine
│   │   ├── cheatsheetData.ts  # Shortcuts definition data
│   │   ├── dataStore.ts       # Config loader, JSON validator, localStorage store
│   │   ├── dynamicEvaluator.ts# Dynamic URL evaluator (Unimib schedules, date interpolation)
│   │   ├── fuzzySearch.ts     # Fuse.js fuzzy search, command palette, rank sorting
│   │   ├── iconResolver.ts    # Multi-tiered icon resolver (Custom -> Lucide -> Favicon API)
│   │   ├── keyboardManager.ts # Global keystroke listener & shortcuts navigator
│   │   └── rankStorage.ts     # LocalStorage usage counter & rank score generator
│   ├── styles/                # CSS Design System
│   │   ├── global.css         # Resets, animations, custom scrollbars, container
│   │   └── variables.css      # Dark Premium color palette, glassmorphism, typography
│   ├── types/                 # TypeScript interfaces & types
│   │   └── startpage.ts       # Link, Category, Rank, Search, & Prefix types
│   ├── app.tsx                # Main Application Component
│   └── main.tsx               # Application Entry Point
├── tests/                     # Vitest test suites (42/42 tests passing under Bun)
│   ├── cheatsheetData.test.ts
│   ├── dataStore.test.ts
│   ├── dynamicEvaluator.test.ts
│   ├── fuzzySearch.test.ts
│   ├── iconResolver.test.ts
│   ├── keyboardManager.test.ts
│   ├── rankStorage.test.ts
│   └── uiComponents.test.tsx
├── bun.lock                   # Bun lockfile
├── gemini.md                  # AI agent guidelines & project standards (Bun mandate)
├── index.html                 # Root HTML document for Vite bundler
├── package.json               # Package dependencies & scripts
├── plan.md                    # Roadmap, task tracking, & implementation status
├── structure.md               # Project structure documentation
├── tsconfig.json              # TypeScript compiler configuration
├── vite.config.ts             # Vite build configuration (singlefile static HTML output)
└── vitest.config.ts           # Vitest runner configuration
```

---

## Tooling & Architecture Mandate

- **Package & Test Execution**: Bun exclusively (`bun ./node_modules/vitest/vitest.mjs run`).
- **Production Build**: Standalone `index.html` static bundle generated via Vite (`bun ./node_modules/vite/bin/vite.js build`).
- **Decoupled Architecture**: Pure data engines in `src/engine/`, independent UI components in `src/components/`.
