# EXECUTION_PLAN.md — Piano Esecuzione Audit

> Contesto: AUDIT.md = scaletta 99 problemi (P0-P7). Questo file = COME eseguirli.
> Progetto: startpage Preact+TS+Vite single-file. Branch dev. Tooling: SOLO bun (gemini.md §1.1).
> Stato iniziale: 92 test PASS, 100 errori tsc, bundle 774KB, 10 file WIP non committati.

## Regole globali

1. **Un branch per fase** su dev, mai diretto su dev/main.
2. **Commit atomico per item** — Conventional Commits, messaggio = cosa + perché (§2.4).
3. **Merge locale su dev a fine fase** + push. NO PR (repo personale).
4. **Spuntare checkbox in AUDIT.md** a ogni item completato, stesso commit o subito dopo.
5. **Aggiornare structure.md/TODO.md** quando cambiano file/cartelle (§2.5).
6. **Gate di fase obbligatorio:** `bun run typecheck` → `bun run test` → `bun run build` → check dimensione dist.
7. **Fix core (P0-P2): sequenziali, sessione unica** — stessi file toccati da più item, subagent paralleli = conflitti.
8. **Subagent solo per:** verifiche di copertura post-fix, fasi parallele su file disgiunti (P3/P4), docs (P7).
9. **Niente --force/amend su dev.** Squash riservato solo a main (gemini.md §2.2).
10. **Versione:** package.json riallineare a 0.x pre-release (§2.7). Bump a ogni release main.

## Test policy (mirata, non blanket)

- Sì test SUBITO per: dataStore sanitize/migrazione, keyboard guards, executeLink boolean, search-engine fallback.
- RISRIVERE test che cementificano bug: keyboardManager Ctrl+1-9 (keyboardManager.test.ts:49-57), reorderModal falso positivo, accessibility string-test → ruoli ARIA reali.
- Component test ColumnGrid/DnD SOLO dopo split P2 (ora god-component = test fragili).
- No caccia a coverage %. Coprire path mutazione dati + regressioni dei fix.

## Fasi

### Step 0 — Fondamenta (branch: chore/audit-foundation)
- Commit WIP 10 file su dev: `refactor: consolidate engine imports into barrel modules`
- Item P0-#1: `bun add @preact/signals` + commit lockfile
- Script `typecheck` (`tsc --noEmit`) + `src/vite-env.d.ts` (`/// <reference types="vite/client" />`)
- Fix script test: `"test": "bun run vitest run"`
- CI minima `.github/workflows/ci.yml`: install `--frozen-lockfile` → typecheck → test → build
- Merge dev + push.

### Fase P0 — Critici (branch: fix/audit-p0-critical)
Ordine interno (dipendenze):
1. `executeLink` ritorna boolean + ColumnGrid `preventDefault` + test click card
2. Rules of hooks: SettingsModal, CheatsheetModal, VisualEditModal (guard dopo hook) + test rerender `isOpen`
3. `dataStore.load()`: no reorder, no force-defaults, migrazione one-shot flag `migrated_v2` + test
4. Lucide bundle: registry statico icone curate (LinkIcon), catalogo lazy per picker → target dist <200KB
5. Keyboard: guard modificatori prima di numeri, `n` solo Shift, cifre → type-to-search, `preventDefault` + fix test cementificato

Gate: typecheck parziale ok, 92+ test pass, dist <200KB. Merge dev + push.

### Fase P1 — Bug core (branch: fix/audit-p1-core-bugs)
Gruppi logici per commit:
- keyboard: Enter/frecce solo in search, no shortcut con modale aperta (wire `modalActive`)
- search: engine default da `themeConfig`, `useMemo` + `slice(0,10)` + memo rows, ARIA combobox
- data: edit in-place (no push in coda), `sanitizeLinkItem` su load/import, backup include ranks
- scroll: util condiviso `scrollToCategory`/`categorySlug`, dedup JumpBar
- dom: fix duplicato `id="app"`
- mobile cruda: monta ReorderModal + long-press bottom-sheet azioni
- clipboard fallback + dialog conferma custom + toast/undo base
- context menu: misura ref, flip submenu, chiusura completa, `onClose` dentro if
- ColumnGrid: rimuovi `handleWheel` custom
- LinkIcon: retry `stopPropagation` + `<button>`

Gate intero. Merge + push.

### Fase P2 — Architettura (branch: refactor/audit-p2-architecture)
Ordine: stato → dead code → split componenti
1. Stato unificato signals: elimina `refreshData`/`onConfigChanged`, niente engine calls da componenti, azioni store per mutazioni
2. Dead code purge: ReorderModal (integrato P1 → resta), LazyWidget cancella, keyboardManager API morte, computed inutilizzati, campi schema morti
3. `useModals` → `activeModal` discriminato
4. ColumnGrid split: `CategoryColumn`, `LinkRow`/`DraggableLinkCard` memo, `useDragAndDrop`/`useContextMenu` adottati DAVVERO, `useColumnScrollMasks` con refs
5. `ActionToolbar` condiviso (HeaderClock/MobileBottomNav)
6. Modal portal + scroll-lock interno + focus trap (anticipo P3 critico)
7. Escape singolo punto (keyboardManager delega)
8. Barrel export nominati + `barrelExports.test` cancellato
9. `useKeyboardShortcuts` via ref (no detach/attach)
10. `structuredClone` + rankStorage detector

Gate: typecheck 0 errori target QUI. Merge + push.

### Fase P3+P4 — UX/a11y + Performance (2 subagent paralleli)
- **Branch A: feat/audit-p3-ux-a11y** — focus-visible, contrasto tokens, combobox completo, menu ARIA, label htmlFor, lang IT, reduced-motion JS, z-index tokens, toast stili, touch target, meta mobile/safe-area/theme-color, empty states, breakpoints unificati, dvh, `!important` purge
- **Branch B: perf/audit-p4-optimization** — favicon cache dominio→candidato + `sz=64` + `referrerPolicy` + catena 2-3, memos grid, dragover state fuori da re-render, JumpBar bail-out, fuzzy lowercase cache, icona bookmarklet neutra, font self-host/system stack, localStorage batching

File disgiunti (A = `*.module.css`/components UI, B = engine) — zero conflitti. Ognuno: gate + merge + push.

### Fase P5+P6 — Tooling + Sicurezza (branch: chore/audit-p5-p6)
- tsc a 0 errori definitivo, ESLint+Prettier+Husky (o de-flag TODO), coverage config
- `productionBuild.test` `skipIf` + budget 350KB, vite `base: './'`, visualizer `dist/gzip/open:false`, `stats.html` gitignore
- test fragili fix (`within`, asserzioni incondizionate, `setupFiles` reset)
- import schema validation + conferma primo run script, rimozione fallback `javascript:`, ramo `Buffer`, whitelist `data:image/`
- Single source Unimib URL (dynamicEvaluator → scriptContent)

Merge + push.

### Fase P7 — Docs + CSS morto (branch: docs/audit-p7-hygiene — subagent isolato)
- `structure.md` riscritto (stato reale), `gemini.md` chiavi storage, `TODO.md` de-flag falsi, version 0.x
- `refactor.js` delete, naming folder uniforme, CSS morto ~600 righe purge, tokens completi, magic numbers → `constants.ts`, catch con warn, ErrorBoundary, inline styles → CSS

Merge + push.

### Release finale
- Verifica: `bun install --frozen-lockfile` pulito → typecheck 0 → test verdi → build <350KB → test manuale `file://` + mobile
- Squash main (procedura gemini.md §2.2): orphan, commit `release: v0.4.0 — post-audit optimization`, push `--force` main
- Bump `package.json` a `0.4.0` su dev

## Checklist recovery (se chat persa/compressa)
1. Leggi `AUDIT.md` → vedi quali checkbox spuntate
2. `git log --oneline -15` + `git branch` → vedi fase corrente
3. `git status` → WIP da committare?
4. Riprendi dal primo item non spuntato della fase corrente, stesso branch
