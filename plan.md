# Project Plan & Roadmap

This document outlines the detailed development roadmap for the Startpage project.

---

## Progress Overview

- [x] **Phase 0: Project Setup & Guidelines Documentation**
  - [x] Initialize Git repository (`dev` branch active).
  - [x] Create `gemini.md` (AI behavior & workflow rules).
  - [x] Create `structure.md` (Project directory & module structure).
  - [x] Create `plan.md` (Detailed roadmap & status tracker).

- [x] **Phase 1: Environment & Tooling Setup (Bun + Vite + Vitest)**
  - [x] Initialize `package.json` with Bun, Vite, Preact, TypeScript, Vitest, Fuse.js, Lucide Preact.
  - [x] Configure TypeScript (`tsconfig.json`) & Vite (`vite.config.ts`) with `vite-plugin-singlefile`.
  - [x] Configure Vitest runner (`vitest.config.ts`) and setup test environment.
  - [x] Run `bun install` successfully.

- [x] **Phase 2: Decoupled Data Engine & Unit Tests**
  - [x] Define TypeScript schemas (`types/startpage.ts`) for Categories, Links, Aliases, Icons, Dynamic Params, Rank storage.
  - [x] Implement `dataStore.ts` (Loader & JSON validator for default links).
  - [x] Implement `dynamicEvaluator.ts` (Dynamic URL date/time interpolation & Unimib course/exam rules).
  - [x] Implement `rankStorage.ts` (LocalStorage click counter, recency scoring, export/import backup).
  - [x] Implement `iconResolver.ts` (Multi-tiered favicon engine: Custom Image -> Lucide Icons -> Favicon API).
  - [x] Write Vitest unit tests for all engine modules.

- [x] **Phase 3: Fuzzy Search, Command Palette & Keyboard Manager Engine**
  - [x] Implement `fuzzySearch.ts` using Fuse.js (searching across titles, URLs, tags, and aliases).
  - [x] Implement **Command Palette** prefix engine (`g <query>` Google, `yt <query>` YouTube, `gh <query>` GitHub, `w <query>` Wikipedia, custom fallback search).
  - [x] Integrate usage ranking boost into fuzzy search results.
  - [x] Implement global Keystroke Listener & Shortcuts Manager (`keyboardManager.ts`).
  - [x] Implement numerical quick-select shortcuts parser (`Ctrl+1`..`9`).
  - [x] Implement Interactive Shortcuts Cheatsheet data provider (`cheatsheetData.ts`).
  - [x] Write Vitest unit tests for Phase 3 engine modules (23/23 tests passing).

- [ ] **Phase 4: UI Development (Dark Premium Aesthetic & Features)**
  - [ ] Setup CSS design system (`variables.css`: dark theme palette, glassmorphism, typography, responsive grid).
  - [ ] Build `ColumnGrid` component with section headers and lazy-loaded icons.
  - [ ] Build `JumpBar` / Column Section Switcher for instant section navigation.
  - [ ] Build `SearchModal` component with instant fuzzy query results, command palette badges & shortcut badges.
  - [ ] Build `CheatsheetModal` component.
  - [ ] Build **Import / Export Config Modal** (backup/sync `links.json` & ranking history).
  - [ ] Build **Visual Edit Mode** (Add/Edit link modal directly in UI saving to LocalStorage).
  - [ ] Connect Preact UI to Data Engine APIs.

- [ ] **Phase 5: Legacy Homepage Migration & Verification**
  - [x] Analyze user's legacy homepage files in `old_homepage/` (Tilde startpage with Unimib dynamic links & AI config).
  - [ ] Parse old links and convert to `data/links.json` schema.
  - [ ] Run full automated test suite (`vitest run`).
  - [ ] Validate static build execution (`npm run build`) locally via `file://`.
  - [ ] Deploy production bundle to `main` branch.

---

## Backlog / Future Improvements & Features (Optional Suggestions)

- [ ] **Custom Weather & Clock Widget** (Minimalist dark widget at top of startpage).
- [ ] **Quick Notes / Scratchpad**: Embedded offline scratchpad saved in `localStorage`.
