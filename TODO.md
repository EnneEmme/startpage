# Startpage Project - Master TODO & Implementation Plan

This document serves as the comprehensive, step-by-step technical implementation plan and task tracker for the Startpage project.

---

## 🚀 Overview & Objectives

The goal is to transform the Startpage into an ultra-premium, highly customizable, and keyboard-centric web application with:
1. **Dynamic Hidden/Revealed Aliases** & **Category Number Badges (`1`..`9`)**.
2. **Settings Modal (`Impostazioni`)** for color themes, grid density, and search defaults.
3. **Advanced Custom Search Engine Creator** with auto-registration in Search & Cheatsheet (`?`).
4. **Full Viewport-Height Columns** with **Minimalist Down Indicator (`↓`)** for seamless UX.
5. **Ultra-Minimalist Search Palette**.
6. **Optimized Layout Geometry & Sticky Bar Horizontal Fade Mask**.
7. **Enhanced Mobile Phone Experience** (Bottom sheets & touch optimization).
8. **Dynamic Responsive Column Grid Geometry** with **Side Padding**.
9. **Custom JavaScript Script & Bookmarklet Link Support**.

---

## 📋 Detailed Task Breakdown

### 🔹 Task 1: Viewport-Height Columns & Minimalist Down Indicator (`↓`)
- [x] **Dynamic Viewport Height**:
  - Calculate column card height dynamically using `max-height: calc(100vh - 220px)` on desktop.
  - Ensures columns span exactly the available screen height so lower rows don't awkwardly peek out underneath.
- [x] **Minimalist Page-Wide Down Cue (`↓`)**:
  - Add a sleek, floating bottom chevron indicator `↓` fixed at bottom center of the page when un-scrolled content exists below.
  - Smoothly fades out when the user scrolls down the page.

---

### 🔹 Task 2: Hidden Aliases, Key-Hold Trigger & Category Number Shortcuts (`1`..`9`)
- [x] **Hide Aliases by Default**:
  - Keep link row alias badges hidden during normal browsing.
- [x] **Modifier Key Listener (`Alt` / `Space`)**:
  - Update `keyboardManager.ts` to emit key-down/key-up events when holding `Alt` (or `Space`).
- [x] **Category Quick-Select Badges (`1`..`9`)**:
  - When modifier key is held, render number badges (`1`, `2`, `3`...) inside category pills in `JumpBar.tsx`.
  - Pressing key `1`..`9` while holding the modifier key instantly scrolls and jumps to category 1..9.
  - Reveal alias badges on link rows while modifier key is held.

---

### 🔹 Task 3: Theme Customization & Settings Modal (`Impostazioni`)
- [x] **Settings Engine (`themeEngine.ts`)**:
  - Default theme: **Silver / Platinum Gray** (`#e2e8f0` / `#94a3b8`).
  - Manage CSS theme variables (`--accent-primary`, `--accent-highlight`, `--accent-glow`) dynamically.
  - Preset Theme Palettes:
    - 🤍 **Silver / Platinum Gray** (Default): `#e2e8f0`
    - 🌿 **Emerald Green**: `#10b981`
    - 💙 **Sapphire Blue**: `#3b82f6`
    - 💜 **Cyberpunk Violet**: `#8b5cf6`
    - 🧡 **Sunset Gold**: `#f59e0b`
    - 🌹 **Rose Coral**: `#f43f5e`
- [x] **Settings Modal Component (`SettingsModal.tsx`)**:
  - Triggered via gear icon `⚙️` in top-right floating toolbar.
  - Color palette picker, Grid density selector (Compact, Normal, Spaced), and Default Search Engine selector.
  - Persist choices to `localStorage` under `startpage_theme_settings`.

---

### 🔹 Task 4: Advanced Search Engine Link Creator & Cheatsheet Integration
- [ ] **Advanced Tab in `VisualEditModal.tsx`**:
  - Add "Advanced Search Engine / Custom Query" toggle.
  - Fields: `Search Query Template` (e.g. `https://youtube.com/results?search_query={q}` or `https://duckduckgo.com/?q={q}`) and `Trigger Aliases` (e.g. `yt`, `ddg`, `g`).
- [ ] **Engine Auto-Registration**:
  - Update `fuzzySearch.ts` command palette engine to recognize custom search engine query templates automatically.
  - Update `CheatsheetModal.tsx` so user-created search commands automatically appear in the Keyboard Shortcuts Cheatsheet (`?`).

---

### 🔹 Task 5: Ultra-Minimalist Search Overlay
- [ ] **Streamlined Command Palette (`SearchModal.tsx`)**:
  - Position floating dark search bar centered at top 15% of screen.
  - Enhanced glassmorphic backdrop blur (`backdrop-filter: blur(16px)`).
  - Minimalist matching list with clear command badges (`Tab to complete, Enter to open`).

---

### 🔹 Task 6: Top Spacing Optimization & Sticky JumpBar Horizontal Mask
- [ ] **Tighter Header Padding**:
  - Reduce `#app` top padding to `0.75rem` to eliminate wasted white/dark space.
- [ ] **JumpBar Horizontal Fade Mask**:
  - Apply `-webkit-mask-image: linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)` on `.jumpBar` when category tabs overflow horizontally.

---

### 🔹 Task 7: Smartphone Mobile UX Refinements
- [ ] **Mobile Touch Optimization**:
  - Enable bottom-sheet modal layouts on mobile screens (`< 600px`).
  - Ensure all touch targets meet 44px minimum height.
  - Enable smooth touch scroll momentum (`-webkit-overflow-scrolling: touch`).

---

### 🔹 Task 8: Dynamic Responsive Column Grid & Balanced Side Padding
- [ ] **Dynamic Window-Based Column Columns**:
  - Configure `grid-template-columns: repeat(auto-fit, minmax(210px, 1fr))` in `ColumnGrid.module.css` so the number of columns per row adapts fluidly and dynamically to window resizing.
- [ ] **Balanced Lateral Side Padding**:
  - Apply clean horizontal outer padding (`padding: 0.5rem 1.75rem 3.5rem`) to ensure columns never touch screen edges and maintain a polished margin on all monitors.

---

### 🔹 Task 9: Custom JavaScript Script & Bookmarklet Links Support
- [ ] **Custom JS Script & Bookmarklet Execution**:
  - Add native support for `javascript:` URLs and custom JS script snippets (e.g. `javascript:(function(){ alert('Hello World'); })();`).
  - Support execution of custom script functions directly when clicking the link item.
- [ ] **Script Editor in Visual Edit Modal (`VisualEditModal.tsx`)**:
  - Add a dedicated "Custom Script / Bookmarklet Code" field in the link creation/editing modal with guide and syntax hints.
  - Handle safe execution without breaking page navigation.

---

## 🛠️ Execution & Testing Strategy

1. **Automated Unit Testing**:
   - Run `bun ./node_modules/vitest/vitest.mjs run` after each task to maintain 100% passing tests (54/54+).
2. **Production Build Compilation**:
   - Run `bun ./node_modules/vite/bin/vite.js build` to build singlefile bundle `dist/index.html`.
3. **Deployment**:
   - Commit feature code to `dev` branch.
