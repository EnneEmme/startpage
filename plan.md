# Project Plan & Roadmap

This document outlines the detailed development roadmap for the Startpage project.

---

## Progress Overview

- [x] **Phase 0: Project Setup & Guidelines Documentation**
  - [x] Initialize Git repository (`dev` branch active).
  - [x] Create `gemini.md` (AI behavior & workflow rules with Bun mandate).
  - [x] Create `structure.md` (Project directory & module structure).
  - [x] Create `plan.md` (Detailed roadmap & status tracker).
  - [x] Create `TODO.md` (Detailed master task tracker & implementation blueprint).

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

- [x] **Phase 4: UI Development (Dark Premium Aesthetic & Features)**
  - [x] Setup CSS design system (`variables.css`: dark theme palette, glassmorphism, typography, responsive grid).
  - [x] Build `ColumnGrid` component with section headers and lazy-loaded icons.
  - [x] Build `JumpBar` / Column Section Switcher for instant section navigation.
  - [x] Build `SearchModal` component with instant fuzzy query results, command palette badges & shortcut badges.
  - [x] Build `CheatsheetModal` component.
  - [x] Build **Import / Export Config Modal** (backup/sync `links.json` & ranking history).
  - [x] Build **Visual Edit Mode** (Add/Edit link modal directly in UI saving to LocalStorage).
  - [x] Connect Preact UI to Data Engine APIs in `src/app.tsx`.
  - [x] Write Vitest UI component tests (57/57 total tests passing).
  - [x] Verify standalone single-file production build (`dist/index.html`).

- [x] **Phase 5: Legacy Homepage Migration & Production Release (v1.0.0)**
  - [x] Import legacy links and dynamic functions into `dataStore.ts` and `dynamicEvaluator.ts`.
  - [x] Run full automated test suite under Bun (`57/57 tests passed`).
  - [x] Deploy production build bundle to `main` branch.

- [ ] **Phase 6: Master TODO Roadmap Execution (Refer to `TODO.md`)**
  - [x] **Task 1**: Full Viewport-Height Columns with Minimalist Down Indicator (`↓`).
  - [x] **Task 2**: Hidden Aliases by default, Key-Hold Trigger (`Alt`/`Space`), and Category Number Shortcuts (`1`..`9`).
  - [x] **Task 3**: Settings Modal (`Impostazioni`) with Theme Color customization (Silver Platinum default).
  - [x] **Task 4**: Custom Search Engine Creator with Cheatsheet Auto-Registration.
  - [x] **Task 6**: Top Spacing Reduction & JumpBar Horizontal Mask.
  - [x] **Task 7**: Mobile Touch & Smartphone UX Refinements (Unified Non-Overlapping Header & Bottom Sheets).
  - [x] **Task 8**: Dynamic Responsive Column Grid Geometry, Extended Link Capacity (+1-2 links), & Balanced Side Padding.
  - [x] **Task 9**: Custom JavaScript Script & Bookmarklet Links Support.
  - [x] **Task 12**: Alias Badge Theme Accent Color Sync & Dynamic UI Refinement.
  - [x] **Task 14**: Grid Density Fix & Font Size Selector (Small, Medium, Large) in Settings.
  - [ ] **Task 10**: Enhanced Fuzzy Search Engine & Smart Multi-Criteria Matching.
  - [ ] **Task 11**: Refined Drag & Drop Link Relocation & Context Menu Category Move.
  - [ ] **Task 5**: Ultra-Minimalist Search Overlay.
  - [ ] **Task 13**: Advanced Dynamic Link & Date Rule Visual Editor (Unimib Orari & Esami).
