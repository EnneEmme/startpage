# Project Plan & Roadmap

This document outlines the detailed development roadmap for the Startpage project.

---

## Progress Overview

- [x] **Phase 0: Project Setup & Guidelines Documentation**
  - [x] Initialize Git repository (`dev` branch active).
  - [x] Create `gemini.md` (AI behavior & workflow rules).
  - [x] Create `structure.md` (Project directory & module structure).
  - [x] Create `plan.md` (Detailed roadmap & status tracker).

- [ ] **Phase 1: Environment & Tooling Setup**
  - [ ] Initialize `package.json` with Vite, Preact, TypeScript, Vitest, Fuse.js, Lucide Preact / Simple Icons.
  - [ ] Configure TypeScript (`tsconfig.json`) & Vite (`vite.config.ts`) with `vite-plugin-singlefile`.
  - [ ] Configure Vitest runner and setup JSDOM environment.
  - [ ] Create initial git commit on `dev`.

- [ ] **Phase 2: Decoupled Data Engine & Unit Tests**
  - [ ] Define TypeScript schemas (`types/startpage.ts`) for Categories, Links, Aliases, Icons, Dynamic Params, Rank storage.
  - [ ] Implement `dataStore.ts` (Loader & JSON validator for default links).
  - [ ] Implement `dynamicEvaluator.ts` (Dynamic URL date/time interpolation & JS template rules).
  - [ ] Implement `rankStorage.ts` (LocalStorage click counter, recency scoring, export/import backup).
  - [ ] Implement `iconResolver.ts` (Multi-tiered favicon engine: Custom Image -> Lucide/Simple Icons -> Favicon API).
  - [ ] Write Vitest unit tests for all engine modules (target 100% test coverage).

- [ ] **Phase 3: Fuzzy Search & Keyboard Shortcut System**
  - [ ] Implement `fuzzySearch.ts` using Fuse.js (searching across titles, URLs, tags, and aliases).
  - [ ] Integrate usage ranking boost into fuzzy search results.
  - [ ] Implement global Keystroke Listener & Shortcuts Manager.
  - [ ] Build search results indexer and numerical quick-select shortcuts (`Ctrl+1`..`9` or `1`..`9`).
  - [ ] Build Keyboard Shortcuts Cheatsheet modal (`?` / `F1` / `Cmd+/`).

- [ ] **Phase 4: UI Development (Dark Premium Minimal Aesthetic)**
  - [ ] Setup CSS design system (`variables.css`: dark theme palette, glassmorphism, typography, responsive grid).
  - [ ] Build `ColumnGrid` component with section headers and lazy-loaded icons.
  - [ ] Build `JumpBar` / Column Section Switcher for instant section navigation.
  - [ ] Build `SearchModal` component with instant fuzzy query results & shortcut badges.
  - [ ] Build `CheatsheetModal` component.
  - [ ] Connect Preact UI to Data Engine APIs.

- [ ] **Phase 5: Legacy Homepage Migration & Verification**
  - [ ] Create `old_homepage/` directory for user's old HTML/JS files.
  - [ ] Parse old links and convert to `data/links.json` schema.
  - [ ] Run full automated test suite (`vitest run`).
  - [ ] Validate static build execution (`npm run build`) locally via `file://`.
  - [ ] Deploy production bundle to `main` branch.

---

## Backlog / Future Improvements & Features (Suggestions)

- [ ] **Custom Weather & Clock Widget** (Minimalist dark widget at top of startpage).
- [ ] **Import / Export Config Modal**: Easily backup or sync `links.json` and ranking history.
- [ ] **Custom Link Modals / Direct Edit Mode**: Ability to add/edit links directly from the UI without manually editing JSON.
- [ ] **Quick Notes / Scratchpad**: Embedded offline scratchpad saved in `localStorage`.
- [ ] **Command Palette**: Type `g <query>` to search Google, `yt <query>` for YouTube, `gh <repo>` for GitHub directly from search bar.
