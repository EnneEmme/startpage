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

---

## 📋 Detailed Task Breakdown

### 🔹 Task 1: Viewport-Height Columns & Minimalist Down Indicator (`↓`)
- [ ] **Dynamic Viewport Height**:
  - Calculate column card height dynamically using `max-height: calc(100vh - 140px)` on desktop.
  - Ensures columns span exactly the available screen height so lower rows don't awkwardly peek out underneath.
- [ ] **Minimalist Chevron Cue (`↓`)**:
  - Add a sleek, floating bottom chevron indicator `↓` at the base of tall columns when un-scrolled content exists below.
  - Smoothly fades out when the user scrolls to the bottom of the column.

---

### 🔹 Task 2: Hidden Aliases, Key-Hold Trigger & Category Number Shortcuts (`1`..`9`)
- [ ] **Hide Aliases by Default**:
  - Keep link row alias badges hidden during normal browsing.
- [ ] **Modifier Key Listener (`Alt` / `Space`)**:
  - Update `keyboardManager.ts` to emit key-down/key-up events when holding `Alt` (or `Space`).
- [ ] **Category Quick-Select Badges (`1`..`9`)**:
  - When modifier key is held, render number badges (`1`, `2`, `3`...) inside category pills in `JumpBar.tsx`.
  - Pressing key `1`..`9` while holding the modifier key instantly scrolls and jumps to category 1..9.
  - Reveal alias badges on link rows while modifier key is held.

---

### 🔹 Task 3: Theme Customization & Settings Modal (`Impostazioni`)
- [ ] **Settings Engine (`themeEngine.ts`)**:
  - Manage CSS theme variables (`--accent-primary`, `--accent-highlight`, `--accent-glow`) dynamically.
  - Preset Theme Palettes:
    - 🌿 **Emerald**: `#10b981` (Default Warm Obsidian)
    - 💙 **Sapphire**: `#3b82f6` (Deep Electric Blue)
    - 💜 **Violet**: `#8b5cf6` (Cyberpunk Purple)
    - 🧡 **Amber**: `#f59e0b` (Warm Sunset Gold)
    - 🤍 **Silver / Monochrome**: `#e2e8f0` (Minimal Platinum)
- [ ] **Settings Modal Component (`SettingsModal.tsx`)**:
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

## 🛠️ Execution & Testing Strategy

1. **Automated Unit Testing**:
   - Run `bun ./node_modules/vitest/vitest.mjs run` after each task to maintain 100% passing tests (54/54+).
2. **Production Build Compilation**:
   - Run `bun ./node_modules/vite/bin/vite.js build` to build singlefile bundle `dist/index.html`.
3. **Deployment**:
   - Commit feature code to `dev` branch and deploy release to `main` branch.
