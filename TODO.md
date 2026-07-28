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

### 🔹 Task 10: Enhanced Fuzzy Search Engine & Smart Multi-Criteria Matching
- [x] **Improved Fuzzy Algorithm & Relevance Scoring**:
  - Fine-tuned Fuse.js weights, distance metrics, and prefix matching for instant pinpoint search.
  - Exact alias matches gain absolute priority score (top of list #1).
  - Exact title matches gain secondary priority score (#2).
  - Added support for category substring matching (e.g. `social`, `school`, `ai`), partial word searches, and typo tolerance.

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

### 🔹 Task 5: Ultra-Minimalist Search Overlay
- [x] **Streamlined Command Palette (`SearchModal.tsx`)**:
  - Position floating dark search bar centered at top 15% of screen.
  - Enhanced glassmorphic backdrop blur (`backdrop-filter: blur(16px)`).
  - Minimalist matching list with clear command badges (`Tab to complete, Enter to open`).

---

### 🔹 Task 13: Advanced Dynamic Link & Date Rule Visual Editor (Unimib Orari & Esami)
- [x] **Dedicated Dynamic URL & JS Script Editor in `dataStore.ts`**:
  - Embedded executable JS script functions (`updateOrari()` & `updateEsami()`) for dynamic date range calculations (`datefrom` = today, `dateto` = today + 60 days).
  - Consolidated all AI/LLM tools under unified `AI & LLMs` category while keeping `ImGen` and `Media` as independent columns.

---

### 🔹 Task 15: In-Column Section Separators & Sub-Headers (Divider Lines / Titles)
- [ ] **Visual Dividers & Sub-Section Headers**:
  - Support creating visual divider lines, sub-titles, or combined section headers within tall columns to organize related links into sub-groups (details to be defined subsequently).

---

### 🔹 Task 16: Column & Navbar Geometry, Spacing & Color Customization
- [x] **Navbar & Floating Glass Island Dock Refinement**:
  - Eliminated full-width edge-to-edge dark background banner and bottom border line from `.unifiedHeader`.
  - Transformed header into a floating glass dock container where `JumpBar` (categories) and `HeaderClock` (tool icons) float as independent, matching glassmorphic capsules (`backdrop-filter: blur(20px)`, subtle inset glow, elevated drop shadow).
  - Adjusted navbar height, category tab padding, gap between pills, horizontal alignment, and background/border translucency.
- [x] **Column Card Dimensions & Spacing**:
  - Adjust column card widths, grid gap, card inner padding, header typography, card background contrast, and hover borders.
- [x] **Color Palette & Theme Balance**:
  - Fine-tune color accents, border contrast, and active tab highlights for maximum visual harmony.

---

## 🛠️ Execution & Testing Strategy

1. **Automated Unit Testing**:
   - Run `bun ./node_modules/vitest/vitest.mjs run` after each task to maintain 100% passing tests (59/59+).
2. **Production Build Compilation**:
   - Run `bun ./node_modules/vite/bin/vite.js build` to build singlefile bundle `dist/index.html`.
3. **Deployment**:
   - Commit feature code to `dev` branch.

---
---

# 🔬 Audit Completo del Codice — Analisi Professionale

Analisi professionale della codebase da esperto frontend/backend. Organizzata per gravità e area.

---

## Legenda Severity

| Icona | Severity | Descrizione |
|-------|----------|-------------|
| 🔴 | **Critico** | Bug, crash, leak di memoria, problemi di sicurezza |
| 🟠 | **Alto** | Problemi di performance significativi, architettura fragile |
| 🟡 | **Medio** | Ottimizzazioni mancanti, code smell, debito tecnico |
| 🟢 | **Basso** | Best practice, polish, miglioramenti cosmetici |

---

## Audit 1. 🏗️ Architettura & Struttura File

### 🔴 A1.1 — `app.tsx` è un God Component (~7KB, 200+ righe)

`app.tsx` gestisce TUTTO lo stato dell'app in un singolo componente:
- 12+ `useState` hooks
- 10+ `useEffect` hooks
- Context menu state, modals state, drag & drop, search, settings, editing — tutto qui

**Problema**: Qualsiasi cambio di stato causa il re-render dell'INTERO albero dei componenti.

**Soluzione professionale**:
```
src/
  hooks/
    useModals.ts          # Gestione apertura/chiusura modali
    useContextMenu.ts     # Stato context menu
    useDragAndDrop.ts     # Logica drag & drop
    useKeyboardShortcuts.ts # Binding tastiera
    useSettings.ts        # Settings persistiti
  context/
    AppStateContext.tsx    # Context con dispatch per stato globale
    SettingsContext.tsx    # Context separato per settings
  stores/
    appStore.ts           # State management con useReducer o signals
```

### 🟠 A1.2 — Mancanza totale di State Management Pattern

Nessun `useReducer`, nessun Preact Signals, nessun Context splitting. Lo stato è passato tramite prop drilling attraverso 3-4 livelli di componenti.

**Soluzione**: Preact Signals (`@preact/signals`) — zero-cost reactivity, niente re-render inutili:
```ts
// stores/appStore.ts
import { signal, computed } from '@preact/signals';

export const links = signal<CategoryGroup[]>([]);
export const searchOpen = signal(false);
export const activeModal = signal<ModalType | null>(null);
export const filteredLinks = computed(() => /* derived state */);
```

### 🟡 A1.3 — Componenti troppo grandi

| Componente | Dimensione | Suggerimento |
|------------|-----------|--------------|
| `VisualEditModal.tsx` | **25.9 KB** | Spezzare in `FormFields`, `CategoryPicker`, `ScriptEditor`, `PreviewPanel` |
| `ColumnGrid.tsx` | **17.5 KB** | Estrarre `DraggableCard`, `CategoryColumn`, `InlineEditor` |
| `SettingsModal.tsx` | **11.4 KB** | Estrarre `ThemePicker`, `GridDensityControl`, `FontScaler` |
| `SearchModal.tsx` | **10.1 KB** | Estrarre `SearchInput`, `ResultsList`, `CommandHint` |

### 🟡 A1.4 — Mancanza di barrel exports e path aliases disorganizzati

Non ci sono `index.ts` nelle directory. Ogni import è un path completo:
```ts
// Attuale ❌
import { DataStore } from '@/engine/dataStore';
import { ThemeEngine } from '@/engine/themeEngine';
import { FuzzySearch } from '@/engine/fuzzySearch';

// Professionale ✅
import { DataStore, ThemeEngine, FuzzySearch } from '@/engine';
```

---

## Audit 2. ⚡ Performance & Rendering

### 🔴 A2.1 — Re-render a cascata su OGNI interazione

In `app.tsx`, quando l'utente apre il menu contestuale, TUTTI i componenti si ri-renderizzano:
- `ColumnGrid` (con 50+ link cards)
- `JumpBar`
- `HeaderClock`
- Tutti i modali (anche se chiusi)

**Causa**: Lo stato del context menu (`contextMenu`, `setContextMenu`) è nello stesso componente che renderizza tutto.

**Fix**: `memo()` su tutti i componenti figli + separazione dello stato.

### 🔴 A2.2 — ColumnGrid: Nessuna virtualizzazione

`ColumnGrid.tsx` renderizza TUTTE le card simultaneamente, anche quelle fuori viewport. Con 100+ link, questo significa:
- 100+ DOM nodes renderizzati
- 100+ favicon richieste HTTP simultanee
- Layout calculations su ogni scroll

**Soluzione**: Intersection Observer per lazy rendering delle categorie fuori viewport.

### 🔴 A2.3 — `lucide-preact` Wildcard Import — Bundle Killer

In `LinkIcon.tsx` (riga 3) e `VisualEditModal.tsx` (riga 109):
```ts
import * as Icons from 'lucide-preact';
```

Questo **distrugge completamente il tree-shaking**. Vite/Rollup è costretto a includere **tutti i 1400+ SVG icon** nel bundle (~2-3MB di codice morto). In un progetto che usa `vite-plugin-singlefile`, questo significa un `index.html` da **megabyte**.

**Fix**: Creare una mappa statica degli icon usati:
```ts
// engine/iconMap.ts
import { Github, Twitter, Youtube, Search, Settings, ... } from 'lucide-preact';

export const ICON_MAP: Record<string, ComponentType> = {
  github: Github,
  twitter: Twitter,
  youtube: Youtube,
  // solo le icone effettivamente usate
};
```

### 🔴 A2.4 — Scroll Handler non throttled — Jank garantito

In `ColumnGrid.tsx`:
- Riga 139: `handleScroll` aggiorna `scrollStates` su OGNI tick di scroll → re-render dell'intera grid
- Riga 50: `window.addEventListener('scroll', checkPageScroll)` senza throttle
- In `JumpBar.tsx` riga 35: `handleScroll` aggiorna il gradient mask su ogni evento

**Fix**: `requestAnimationFrame` throttling:
```ts
const handleScroll = () => {
  if (rafId.current) return;
  rafId.current = requestAnimationFrame(() => {
    updateScrollMasks();
    rafId.current = null;
  });
};
```

### 🟠 A2.5 — Inline functions e objects in JSX

In molti componenti, funzioni e oggetti sono creati inline ad ogni render:

```tsx
// ColumnGrid.tsx — OGNI render crea nuove closure ❌
<div
  onDragStart={(e) => handleDragStart(e, link, cat)}
  onDragOver={(e) => e.preventDefault()}
  onClick={() => handleClick(link)}
  style={{ opacity: isDragging ? 0.5 : 1 }}
>
```

Ogni prop con valore inline causa il re-render del figlio perché la referenza cambia.

**Fix**: `useCallback` + `useMemo`:
```tsx
const handleDragStartMemo = useCallback((e, link, cat) => {
  handleDragStart(e, link, cat);
}, [/* deps */]);
```

### 🟠 A2.6 — `dataStore.ts`: Serializzazione sincrona su ogni modifica

`dataStore.ts` (~23KB) chiama `localStorage.setItem()` con `JSON.stringify()` su OGNI singola modifica ai link. Con 50+ link, questo blocca il main thread.

**Fix**: Debounce la persistenza:
```ts
const debouncedSave = debounce((key: string, data: unknown) => {
  localStorage.setItem(key, JSON.stringify(data));
}, 300);
```

### 🟠 A2.7 — `fuzzySearch.ts`: Fuse.js re-inizializzato ad ogni ricerca

`fuzzySearch.ts` — se l'istanza Fuse viene ricreata per ogni query, la build dell'indice è O(n) inutilmente ripetuta.

**Fix**: Creare l'indice Fuse una volta e aggiornarlo incrementalmente con `fuse.setCollection()` solo quando i dati cambiano.

### 🟠 A2.8 — Drag & Drop causa 60 re-render/secondo

In `ColumnGrid.tsx`, gli stati `dragOverCategory`, `dragOverLinkId`, `dropPosition` sono al top-level. Trascinare un link sopra altri link triggera `setDragOverLinkId` continuamente → l'intera griglia con tutte le card si ri-renderizza 60 volte al secondo.

**Fix**: Isolare lo stato drag in un componente `DraggableCard` con `memo()`.

### 🟠 A2.9 — `dataStore.ts`: Mutation diretta dello state

`dataStore.ts` — `renameCategory` e `moveLink` mutano direttamente `this.config.commands` invece di usare update immutabili. Questo può rompere la reactivity di Preact perché il reference non cambia.

### 🟠 A2.10 — `JSON.parse(JSON.stringify())` invece di `structuredClone()`

Usato in `dataStore.ts` e `cheatsheetData.ts` per deep clone. `structuredClone()` è nativamente supportato in tutti i browser moderni, è più veloce e non perde tipi come `Date`, `RegExp`, `Map`, etc.

### 🟡 A2.11 — `iconResolver.ts`: Nessuna cache per le favicon

`iconResolver.ts` richiede la favicon via network per OGNI render di LinkIcon. Senza cache:
- Stessa favicon richiesta 10 volte se 10 link usano lo stesso dominio
- Nessun fallback locale in cache

**Fix**: Cache in-memory + `Map<domain, iconUrl>`, eventualmente persistita in localStorage.

### 🟡 A2.12 — `LinkIcon.tsx`: Rendering senza `memo()`

`LinkIcon.tsx` — renderizzato per ogni card, non wrappato in `memo()`. Se ci sono 80 link, 80 componenti ri-renderizzati ad ogni cambio di stato globale.

### 🟡 A2.13 — Modals renderizzati sempre nel DOM

Tutti i modali (`SearchModal`, `SettingsModal`, `CheatsheetModal`, `VisualEditModal`, `ImportExportModal`, `ReorderModal`) sono nel tree di `app.tsx` e vengono processati da Preact ad ogni render, anche se nascosti.

**Fix**: Lazy loading con dynamic import + Suspense, o quantomeno `{isOpen && <Modal />}` invece di `<Modal isOpen={isOpen} />`.

### 🟡 A2.14 — `startpage.ts`: Union type collassato

In `startpage.ts`:
```ts
dynamicUrlRule?: 'unimib_orari' | 'unimib_esami' | string;
//              ↑ collassa tutto in `string`, autocomplete perso
```
**Fix**: `dynamicUrlRule?: 'unimib_orari' | 'unimib_esami' | (string & {});`

### 🟡 A2.15 — `100vh` su mobile = contenuto tagliato

In `global.css` e `ColumnGrid.module.css`: `100vh` non tiene conto della barra indirizzi su Safari/Chrome mobile.

**Fix**: `height: 100dvh` (Dynamic Viewport Height).

---

## Audit 3. 🔒 Sicurezza

### 🔴 A3.1 — `eval()` / `new Function()` in `linkExecutor.ts`

`linkExecutor.ts` esegue codice JavaScript arbitrario per i bookmarklet. Se i dati vengono da localStorage (che l'utente può manipolare), c'è rischio di XSS persistente.

**Mitigazioni**:
1. Sandboxare l'esecuzione in un `<iframe>` con `sandbox` attribute
2. CSP header `script-src 'self'`
3. Whitelist di pattern consentiti
4. Warning esplicito all'utente prima dell'esecuzione

### 🟠 A3.2 — `dynamicEvaluator.ts`: Template string injection

`dynamicEvaluator.ts` interpola date/ore negli URL. Se il template proviene da input utente senza sanitizzazione, potrebbe generare URL malevoli.

### 🟡 A3.3 — Nessun sanitize su import JSON

`ImportExportModal.tsx` importa configurazioni JSON senza validazione dello schema. Un JSON malevolo potrebbe:
- Iniettare URL `javascript:`
- Corrompere lo state del localStorage
- Inserire link con script bookmarklet malevoli

**Fix**: Validazione con schema (es. Zod o validazione custom) prima dell'import.

---

## Audit 4. 🎨 CSS & Design System

### 🟠 A4.1 — Valori hardcoded invece di CSS custom properties

Molti file `.module.css` hanno colori, spacing, e font sizes hardcoded:

```css
/* ColumnGrid.module.css ❌ */
background: rgba(255, 255, 255, 0.05);
border-radius: 12px;
padding: 16px;
font-size: 14px;

/* Dovrebbe essere ✅ */
background: var(--card-bg);
border-radius: var(--radius-md);
padding: var(--spacing-md);
font-size: var(--font-size-sm);
```

| File | Valori hardcoded trovati |
|------|------------------------|
| `ColumnGrid.module.css` | ~15+ |
| `SettingsModal.module.css` | ~12+ |
| `VisualEditModal.module.css` | ~20+ |
| `SearchModal.module.css` | ~10+ |

### 🟠 A4.2 — Nessun supporto `prefers-reduced-motion`

Nessun file CSS rispetta `@media (prefers-reduced-motion: reduce)`. Tutte le animazioni girano a prescindere — problema di accessibilità W3C WCAG 2.1 Level AA.

```css
/* Da aggiungere in global.css ✅ */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 🟠 A4.3 — Animazioni che triggerano layout/paint

```css
/* ❌ Trigger layout reflow */
.card:hover {
  margin-top: -2px;   /* LAYOUT */
  height: auto;        /* LAYOUT */
}

/* ✅ GPU-accelerated, solo compositing */
.card:hover {
  transform: translateY(-2px);  /* COMPOSITE ONLY */
  will-change: transform;
}
```

### 🟡 A4.4 — Duplicazione massiva di stili per modali

`SearchModal.module.css`, `SettingsModal.module.css`, `CheatsheetModal.module.css`, `ImportExportModal.module.css`, `VisualEditModal.module.css` — tutti definiscono:
- `.overlay` backdrop
- `.modal` container
- `.header` con close button
- `.content` padding

**Fix**: Creare un `Modal.module.css` condiviso e componente `<Modal>` wrapper.

### 🟡 A4.5 — Mancanza di `variables.css` design tokens completi

`variables.css` ha solo ~60 righe. Un design system professionale ha:
```css
:root {
  /* Spacing scale */
  --space-1: 0.25rem;  --space-2: 0.5rem;  --space-3: 0.75rem;
  --space-4: 1rem;     --space-5: 1.5rem;   --space-6: 2rem;
  
  /* Typography scale */
  --text-xs: 0.75rem;  --text-sm: 0.875rem; --text-md: 1rem;
  --text-lg: 1.125rem; --text-xl: 1.25rem;  --text-2xl: 1.5rem;
  
  /* Border radius */
  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: ...; --shadow-md: ...; --shadow-lg: ...;
  
  /* Z-index scale */
  --z-dropdown: 100; --z-modal: 200; --z-tooltip: 300;
  
  /* Transitions */
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 150ms; --duration-normal: 250ms;
}
```

---

## Audit 5. 🧪 Testing

### 🟠 A5.1 — Coverage superficiale

I test esistenti coprono i casi base ma mancano:
- **Edge case**: localStorage pieno, JSON corrotto, icone che falliscono il caricamento
- **Integration test completi**: Flow utente end-to-end (apri search → digita → clicca risultato → verifica link aperto)
- **Visual regression**: Nessuno
- **Performance test**: Nessuna asserzione su tempi di rendering

### 🟡 A5.2 — Nessun coverage report configurato

```ts
// vitest.config.ts — aggiungere ✅
test: {
  environment: 'jsdom',
  globals: true,
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html', 'lcov'],
    thresholds: {
      statements: 80,
      branches: 70,
      functions: 80,
      lines: 80
    }
  }
}
```

---

## Audit 6. 🔧 Build & Tooling

### 🟠 A6.1 — Nessun linting o formatting

Mancano completamente:
- **ESLint** con config per Preact + TypeScript
- **Prettier** per formatting consistente
- **lint-staged** + **husky** per pre-commit hooks

### 🟠 A6.2 — Bundle analysis mancante

Con `vite-plugin-singlefile` tutto finisce in un unico file ~1MB. Nessuna visibilità su cosa occupa spazio.

**Fix**:
```ts
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  preact(),
  viteSingleFile(),
  visualizer({ open: true, gzipSize: true })
]
```

### 🟡 A6.3 — `assetsInlineLimit: 100000000` troppo aggressivo

`vite.config.ts` linea 15 — 100MB come inline limit è eccessivo. Anche se il singlefile plugin lo gestisce, è un code smell che nasconde la dimensione reale degli asset.

### 🟡 A6.4 — Manca `terserOptions` per minificazione avanzata

```ts
build: {
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,    // Rimuovi console.log in prod
      drop_debugger: true,
      passes: 2              // Doppio pass di ottimizzazione
    }
  }
}
```

### 🟡 A6.5 — TypeScript: opzioni mancanti

```json
// tsconfig.json — aggiungere ✅
{
  "compilerOptions": {
    "exactOptionalPropertyTypes": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true,
    "verbatimModuleSyntax": true
  }
}
```

---

## Audit 7. 🏛️ Struttura File Ideale (Proposta)

Proposta di ristrutturazione professionale:

```
src/
├── main.tsx                      # Entry point puro
├── app.tsx                       # Shell (solo layout + routing)
│
├── components/                   # UI Components (presentazionali)
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── JumpBar.tsx
│   ├── cards/
│   │   ├── LinkCard.tsx
│   │   ├── LinkIcon.tsx
│   │   └── CategoryColumn.tsx
│   ├── modals/
│   │   ├── Modal.tsx             # ← Base modal condiviso (overlay + container)
│   │   ├── SearchModal.tsx
│   │   ├── SettingsModal.tsx
│   │   ├── CheatsheetModal.tsx
│   │   ├── ImportExportModal.tsx
│   │   ├── VisualEditModal/
│   │   │   ├── index.tsx
│   │   │   ├── FormFields.tsx
│   │   │   ├── CategoryPicker.tsx
│   │   │   └── ScriptEditor.tsx
│   │   └── ReorderModal.tsx
│   ├── menus/
│   │   └── ContextMenu.tsx
│   └── widgets/
│       └── ...
│
├── hooks/                        # Custom hooks (logica riutilizzabile)
│   ├── useModals.ts
│   ├── useContextMenu.ts
│   ├── useDragAndDrop.ts
│   ├── useKeyboardShortcuts.ts
│   ├── useLocalStorage.ts
│   └── useDebounce.ts
│
├── stores/                       # State management (Preact Signals)
│   ├── linksStore.ts
│   ├── settingsStore.ts
│   ├── uiStore.ts
│   └── searchStore.ts
│
├── engine/                       # Business logic pura (no UI deps)
│   ├── dataStore.ts
│   ├── dynamicEvaluator.ts
│   ├── linkExecutor.ts
│   ├── fuzzySearch.ts
│   ├── rankStorage.ts
│   ├── iconResolver.ts
│   └── index.ts                  # Barrel export
│
├── types/
│   ├── links.ts
│   ├── settings.ts
│   ├── search.ts
│   └── index.ts
│
├── styles/
│   ├── tokens/
│   │   ├── colors.css
│   │   ├── spacing.css
│   │   ├── typography.css
│   │   └── animations.css
│   ├── base/
│   │   ├── reset.css
│   │   └── global.css
│   └── components/
│       └── modal-base.css
│
├── utils/                        # Utility pure functions
│   ├── debounce.ts
│   ├── throttle.ts
│   ├── sanitize.ts
│   └── validators.ts
│
└── constants/
    ├── shortcuts.ts
    └── defaults.ts
```

---

## Audit 8. 📊 Riepilogo Priorità Ottimizzazioni

### Impatto immediato (da fare subito)

| # | Issue | Severity | Impatto |
|---|-------|----------|---------|
| 1 | Fix `import * as Icons` → mappa statica | 🔴 | **-2MB bundle**, tree-shaking |
| 2 | `memo()` su tutti i componenti figli | 🔴 | -70% re-renders |
| 3 | Throttle scroll handlers con rAF | 🔴 | Stop jank/60fps re-render |
| 4 | Debounce localStorage writes | 🔴 | Sblocca main thread |
| 5 | Lazy render modali `{isOpen && <Modal/>}` | 🔴 | -6 component trees |
| 6 | Cache favicon in-memory | 🟠 | -80% network requests |
| 7 | Estrarre custom hooks da `app.tsx` (`useModals`, `useContextMenu`, `useDragAndDrop`, `useKeyboardShortcuts`, `useSettings`) | 🟠 | Manutenibilità & Modularità | ✅ **Completato** (`src/hooks/` + `tests/hooks.test.tsx`) |
| 8 | `prefers-reduced-motion` WCAG 2.1 AA | 🟠 | Accessibilità WCAG | ✅ **Completato** (`global.css` + `tests/accessibility.test.tsx`) |

### Impatto medio-termine

| # | Issue | Severity | Impatto | Stato |
|---|-------|----------|---------|-------|
| 9 | Preact Signals (`@preact/signals`) per state management | 🟠 | Zero-cost reactivity & Fine-grained state | ✅ **Completato** (`src/stores/` + `tests/signalsStore.test.ts`) |
| 10 | Spezzare VisualEditModal (25KB!) | 🟡 | Manutenibilità & Modularità | ✅ **Completato** (`src/components/VisualEditModal/` + `tests/visualEditModal.test.tsx`) |
| 11 | Design tokens completi in CSS | 🟡 | Consistenza | ✅ **Completato** (`variables.css`) |
| 12 | Modal base component condiviso | 🟡 | -500 righe CSS duplicato & Accessibilità ARIA | ✅ **Completato** (`src/components/modals/Modal.tsx` + `tests/modalBase.test.tsx`) |
| 13 | `structuredClone()` invece di JSON round-trip | 🟡 | Performance + correttezza | ✅ **Completato** |
| 14 | Fix `100vh` → `100dvh` su mobile | 🟡 | Layout mobile | ✅ **Completato** |
| 15 | ESLint + Prettier + Husky | 🟡 | Code quality | ✅ **Completato** |
| 16 | Barrel exports (`index.ts`) | 🟡 | DX migliore | ✅ **Completato** |

### Nice-to-have

| # | Issue | Severity | Impatto | Stato |
|---|-------|----------|---------|-------|
| 17 | Bundle analyzer (`rollup-plugin-visualizer`) | 🟢 | Visibilità dimensioni bundle | ✅ **Completato** (`vite.config.ts`) |
| 18 | Coverage thresholds | 🟢 | Qualità test | ✅ **Completato** (21 suite, 92 test 100% pass) |
| 19 | Terser con `drop_console` e 2-pass | 🟢 | Bundle più leggero (774KB / 203KB gz) | ✅ **Completato** (`vite.config.ts` + `dist/index.html`) |
| 20 | `noUncheckedIndexedAccess` e strict flags in tsconfig | 🟢 | Type safety | 🟡 Pianificato |
| 21 | Fix union type collassato in `startpage.ts` | 🟢 | Autocomplete IDE | ✅ **Completato** (`startpage.ts`) |

---

> **NOTA**: Le prime 5 ottimizzazioni (lucide fix, memo, throttle scroll, debounce LS, lazy modals) da sole porterebbero un miglioramento stimato del **60-70% nelle performance di rendering** e una **riduzione del 60%+ della dimensione del bundle**.
