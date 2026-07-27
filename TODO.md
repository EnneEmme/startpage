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
10. **Enhanced Fuzzy Search Engine & Smart Multi-Criteria Matching**.
11. **Refined Drag & Drop Link Relocation & Context Menu Category Move**.
12. **Alias Badge Theme Accent Color Sync & Dynamic UI Refinement**.
13. **Advanced Dynamic Link & Date Rule Visual Editor (Unimib Orari & Esami)**.
14. **Grid Density Fix & Font Size Selector (Small, Medium, Large) in Settings**.
15. **In-Column Section Separators & Sub-Headers (Divider Lines / Titles)**.

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
- [x] **Advanced Tab in `VisualEditModal.tsx`**:
  - Add "Advanced Search Engine / Custom Query" toggle.
  - Fields: `Search Query Template` (e.g. `/results?search_query={q}` or `?q={q}`) and `Trigger Aliases` (e.g. `yt`, `ddg`, `g`).
- [x] **Engine Auto-Registration**:
  - Update `fuzzySearch.ts` command palette engine to recognize custom search engine query templates automatically.
  - Update `CheatsheetModal.tsx` so user-created search commands automatically appear in the Keyboard Shortcuts Cheatsheet (`?`).

---

### 🔹 Task 6: Top Spacing Optimization & Sticky JumpBar Horizontal Mask
- [x] **Tighter Header Padding**:
  - Reduce `#app` top padding to `0.75rem` to eliminate wasted white/dark space.
- [x] **JumpBar Horizontal Fade Mask**:
  - Apply dynamic left & right horizontal gradient masks (`fadeRight`, `fadeLeft`, `fadeBoth`) on `.jumpBar` when category tabs overflow horizontally.

---

### 🔹 Task 7: Smartphone Mobile UX Refinements & Unified Non-Overlapping Header
- [x] **Unified Sticky Navigation Header**:
  - Integrated `JumpBar` category tabs and toolbar tools into a single, non-overlapping flex header container at the exact same vertical level.
  - Eliminates toolbar collision/overlapping on smaller screen sizes.
- [x] **Mobile Touch & Bottom Sheets**:
  - Convert all modals into mobile bottom sheets on screens `< 600px`.
  - Ensure all touch targets meet min 42px-44px for effortless mobile thumb tapping.

---

### 🔹 Task 8: Dynamic Responsive Column Grid & Balanced Side Padding
- [x] **Dynamic Window-Based Column Columns**:
  - Configure `grid-template-columns: repeat(auto-fill, minmax(var(--grid-col-min-width, 210px), 1fr))` in `ColumnGrid.module.css` so the number of columns per row adapts fluidly and dynamically to window resizing.
- [x] **Balanced Lateral Side Padding**:
  - Apply clean horizontal outer padding (`padding: 0.5rem 0 3.5rem`) to ensure columns never touch screen edges and maintain a polished margin on all monitors.
- [x] **Viewport Min-Height Lock**:
  - Added `min-height: calc(100vh - 110px)` to `.columnCard`, forcing Row 1 columns to fill screen height so Row 2 never peeks out when unscrolled.

---

### 🔹 Task 9: Custom JavaScript Script & Bookmarklet Links Support
- [x] **Custom JS Script & Bookmarklet Execution**:
  - Add native support for `javascript:` URLs and custom JS script snippets (e.g. `javascript:(function(){ alert('Hello World'); })();`).
  - Implemented central `linkExecutor.ts` to execute custom script functions directly when clicking link items or searching in `SearchModal`.
  - Preserved 100% backward compatibility for dynamic URL rules (`unimib_orari`, `unimib_esami`, and date interpolations).
- [x] **Script Editor in Visual Edit Modal (`VisualEditModal.tsx`)**:
  - Added a dedicated "⚡ Enable Custom JavaScript / Bookmarklet Code Mode" toggle and code textarea field in `VisualEditModal.tsx`.
  - Rendered `⚡` script badge indicator next to script links in column cards.

---

### 🔹 Task 11: Refined Drag & Drop Link Relocation & Context Menu Category Move
- [x] **Ultra-Smooth Drag & Drop Experience**:
  - Created 1:1 replica clone drag ghost showing the entire exact link card (icon, title, alias badge, glass background, accent border, shadow).
  - Smooth spring gap animations during dragging and fluid drop release spring animation (`dropReleaseSpring`).
  - Added "Move to Category..." submenu option in right-click context menu (`ContextMenu.tsx`) for click-based relocation.

---

### 🔹 Task 12: Alias Badge Theme Accent Color Sync & Dynamic UI Refinement
- [x] **Theme Accent Color Sync for Alias Badges**:
  - Updated `.aliasBadge` styling in `ColumnGrid.module.css` so when aliases are toggled (`Alt` / `Shift+Space`), badge background/border/text dynamically inherits the active Theme Color (`var(--accent-highlight)`, `var(--accent-glow)`, `var(--border-color-hover)`) instead of hardcoded emerald green.

---

### 🔹 Task 14: Grid Density Fix & Font Size Selector in Settings Modal (`SettingsModal.tsx`)
- [x] **Grid Density Visibility & New Scale**:
  - Updated grid density scale: `normal` (185px) is now default, `spaced` (230px) is wide, and created a new ultra-compact `compact` (155px) density.
- [x] **Font Size Selector**:
  - Added a Font Size setting selector in `SettingsModal.tsx` allowing users to choose text size (*Small*, *Medium*, *Large* / *Piccolo*, *Medio*, *Grande*).

---

### 🔹 Task 10: Enhanced Fuzzy Search Engine & Smart Multi-Criteria Matching
- [ ] **Improved Fuzzy Algorithm & Relevance Scoring**:
  - Fine-tune Fuse.js weights, distance metrics, and prefix matching for instant pinpoint search.
  - Exact alias matches gain absolute priority score (top of list).
  - Add support for partial word searches, typo tolerance, and sub-string category matching.

---

### 🔹 Task 5: Ultra-Minimalist Search Overlay
- [ ] **Streamlined Command Palette (`SearchModal.tsx`)**:
  - Position floating dark search bar centered at top 15% of screen.
  - Enhanced glassmorphic backdrop blur (`backdrop-filter: blur(16px)`).
  - Minimalist matching list with clear command badges (`Tab to complete, Enter to open`).

---

### 🔹 Task 13: Advanced Dynamic Link & Date Rule Visual Editor (Unimib Orari & Esami)
- [ ] **Dedicated Dynamic URL Rule Selector in `VisualEditModal.tsx`**:
  - Add an intuitive dropdown editor for configuring dynamic course/exam schedule rules (`unimib_orari`, `unimib_esami`) and date tokens (`{{DD-MM-YYYY}}`).
  - Ensure seamless pre-filling, validation bypass, and rule editing for custom dynamic links.

---

### 🔹 Task 15: In-Column Section Separators & Sub-Headers (Divider Lines / Titles)
- [ ] **Visual Dividers & Sub-Section Headers**:
  - Support creating visual divider lines, sub-titles, or combined section headers within tall columns to organize related links into sub-groups (details to be defined subsequently).

---

## 🛠️ Execution & Testing Strategy

1. **Automated Unit Testing**:
   - Run `bun ./node_modules/vitest/vitest.mjs run` after each task to maintain 100% passing tests (57/57+).
2. **Production Build Compilation**:
   - Run `bun ./node_modules/vite/bin/vite.js build` to build singlefile bundle `dist/index.html`.
3. **Deployment**:
   - Commit feature code to `dev` branch.
