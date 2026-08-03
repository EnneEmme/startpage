# AUDIT.md — Scaletta Ottimizzazione Startpage

> Audit completo del progetto (frontend, backend-logic, UI/UX, architettura, performance, build, test).
> Ogni voce è una checkbox: spuntala quando il fix è completato e verificato.
> **Regole (da gemini.md):** dopo ogni fix → `bun run test` verde, aggiorna `structure.md`/`TODO.md` se cambiano file, commit Conventional Commits.
>
> **Stato attuale misurato (2026-08-03, post-merge Fase P3+P4+P5+P6 su dev):** 29 file test / **231 test PASS** · `tsc --noEmit` = **0 errori** · `bun run lint` = 0 · `dist/index.html` = **268.58 KB** (~79.85 KB gzip) · budget build 350 KB attivo in `productionBuild.test.ts` · P0-P4 completati · **P5 (build/tooling/test) e P6 (sicurezza) completati** (branch `chore/audit-p5-tooling` + `sec/audit-p6-security`, mergiati su dev): **spuntati P0-P6, aperti gli item P7 (igiene repo) + performance residuali in P4.**
> **Fase P3+P4 (2026-08-03):** Passo 0: `dataStore.addCategory()` + `appActions.addCategory()` (registrazione categoria in categoryOrder, seed ordine implicito se vuoto). Branch A (11 item a11y): combobox SearchModal, accessible-names, label htmlFor, ContextMenu ARIA+Shift+F10, autofocus unificato, VisualEditModal draft/tabs/dirty-form, modal landscape, touch hints, noscript/h1/skip-link/lang-EN/⌘/setTimeout, JumpBar focus-mask. Branch B (5 item perf): drag hover → signals `dragStore`, rankStorage debounce+flush, memo `resolveDynamicUrl`, font system stack (rimosso Google Fonts), empty states + timer cleanup + dispatch Shift+F10. Decisioni bloccate dall'utente: UI inglese, system fonts, debounce rank con flush.

**Legenda severità:** 🔴 critica · 🟠 alta · 🟡 media · ⚪ bassa

**Prerequisito prima di partire:**
- [x] 🟠 Committare o stasheare i 10 file modificati nel working tree (refactor a metà: Modal.tsx, dataStore.ts, fuzzySearch.ts, linkExecutor.ts, rankStorage.ts, hooks, stores) prima di qualsiasi altra modifica.

---

## P0 — CRITICI (build rotto / perdita dati / bundle)

- [x] 🔴 **Dipendenza fantasma `@preact/signals`** — importata in `src/stores/appStore.ts:1` e `src/stores/settingsStore.ts:1`, ma assente da `package.json` e `bun.lock` (presente solo in node_modules come residuo). `bun install --frozen-lockfile` su macchina pulita → build/test rotti.
  **Fix:** `bun add @preact/signals` + commit package.json e bun.lock.

- [x] 🔴 **`executeLink` ritorna `void` ma ColumnGrid lo testa come boolean** — `src/engine/linkExecutor.ts:43` vs `src/components/ColumnGrid.tsx:163-167`. `e.preventDefault()` non viene **mai** chiamato → per link normali doppia navigazione (location.href + href nativo); per bookmarklet l'href `javascript:updateOrari()` esegue una globale inesistente; cmd+click apre nuova tab **e** naviga la corrente (tsc: TS1345).
  **Fix:** `executeLink` ritorna `boolean`/`{handled}` oppure gestisce tutta la navigazione e ColumnGrid fa sempre `preventDefault()`. Aggiungere test click su card.

- [x] 🔴 **Rules of Hooks violate in 3 modali** — `if (!isOpen) return null;` **prima** di `useState`/`useEffect` in `SettingsModal.tsx:21-23`, `CheatsheetModal.tsx:14-16`, `VisualEditModal/index.tsx:41-48`. I modali sono montati in permanenza da `app.tsx:145-178` → numero di hook variabile → slot state che slittano, state sporco che sopravvive tra aperture.
  **Fix:** spostare i guard dopo tutti gli hook (Modal.tsx:33-45 fa già giusto) o render condizionale dal parent `{isOpen && <Modal.../>}`. Test `rerender(isOpen=false → true)`.

- [x] 🔴 **`dataStore.load()` distrugge personalizzazioni utente a ogni reload** — `src/engine/dataStore.ts:228-232`: riordina i link secondo DEFAULT_CONFIG → drag&drop e Move Up/Down annullati al refresh. `dataStore.ts:197-226`: forza `title/category/searchPath/aliases` dei link di default → rename utente perso. Gli hack di migrazione hardcoded per titolo ('Orari'/'Esami', righe 216-225) impediscono di editare quei link dal VisualEditModal e violano la Decoupled Data Architecture (gemini.md §1.3).
  **Fix:** non riordinare/forzare in `load()`; default solo come template per item mancanti; migrazioni one-shot con flag `migrated_v2` in localStorage.

- [x] 🔴 **Bundle 774 KB: lucide-preact non tree-shaken (81%)** — `LinkIcon.tsx:3` e `VisualEditModal/index.tsx:8-22` usano `import * as Icons` + lookup dinamico → tutte le ~1767 icone nel single-file. Inoltre `ALL_LUCIDE_ICONS` (~1767 voci) costruito eager a module-import e scan lineare a ogni keystroke dell'icon-search. Incompatibile con requisito gemini.md §4 (<100ms load). Da `stats.html`: lucide 914,2 KiB, src 132,6, fuse.js 49,1, preact 14,4, signals 7,1.
  **Fix:** registry statico di icone curate con named import; icon picker con catalogo on-demand (`import()` lazy). Target: single-file < ~150-200 KB. Verifica con visualizer dopo build.

- [x] 🔴 **Type-to-search rotto: `n`, cifre, `,` intercettati; `/` senza preventDefault** — `src/engine/keyboardManager.ts:80-93,126-128`: digitare "netflix" apre Add-Link; impossibile query che iniziano con numero; su Firefox `/`/`'` aprono anche il quick-find nativo. Inoltre **Ctrl/Cmd+1-9** dirottati (ramo numerico prima del guard modificatori, riga 87 vs 123) → blocca lo switch tab del browser; `keyboardManager.test.ts:49-57` cementifica il bug.
  **Fix:** guard `if (e.ctrlKey||e.metaKey||e.altKey) return;` prima del ramo numerico; `n` solo con Shift (o altro tasto); auto-search anche per cifre (jump categoria es. Alt+1-9); preventDefault su caratteri intercettati; correggere il test.

---

## P1 — BUG FUNZIONALI & UX CORE

- [x] 🟠 **Enter/frecce preventDefault in TUTTI gli input/textarea** — `keyboardManager.ts:107-119`: impossibile submit con Enter in VisualEditModal, impossibile a-capo in `jsonTextarea` (ImportExportModal.tsx:112) e ScriptEditor, caret bloccato. I handler `onNavigateSearch` non sono mai registrati → pura perdita.
  **Fix:** intercettare solo con search aperta, escludere TEXTAREA, frecce/Enter solo in SearchModal.

- [x] 🟠 **Shortcut globali attive con modale aperta → modali impilati** — `modalActive`/`setModalActive` (keyboardManager.ts:37-43) mai usati: con Settings aperto, `n` apre VisualEdit sopra, `?` apre Cheatsheet sopra → doppio overlay, doppio `id="modal-title"` (HTML invalido), Esc chiude tutto insieme. Tasti 1-9 scrollano dietro il modale.
  **Fix:** filtrare tutti gli handler quando `isAnyModalOpen` (tranne Esc/toggle corrente).

- [x] 🟠 **Setting "Motore di Ricerca Predefinito" completamente finto** — `SettingsModal.tsx:220-250` permette la scelta, ma il fallback search è Google hardcoded in `SearchModal.tsx:146,270`. Il tipo include `'b'` (Bing) senza regola in `fuzzySearch.ts:11-17` né bottone UI. Doppio campo concorrente mai letto: `StartpageConfig.defaultSearchEngine` (types:29).
  **Fix:** leggere `themeConfig.defaultSearchEngine` nel fallback (mappato su DEFAULT_PREFIX_RULES), implementare o rimuovere Bing, eliminare campo duplicato.

- [x] 🟠 **Edit di un link lo sposta in fondo alla colonna** — `dataStore.ts:338-342` (`addLink` = filter+push) usato per l'edit da `VisualEditModal/index.tsx:156`.
  **Fix:** update in-place per id, preservando l'indice.

- [x] 🟠 **`fuzzySearch` crasha su item malformati (import/corruzione)** — `fuzzySearch.ts:132,148-149` accede a `item.aliases.find` senza guard; né `load()` né `importJson()` normalizzano i singoli item. `load()` ha `catch {}` unico che ingoia tutto (dataStore.ts:241).
  **Fix:** `sanitizeLinkItem()` (default `aliases: []`, url/category validati) applicata a load e import; warning su entry scartate.

- [x] 🟠 **Triplicata logica scroll-to-category con doppio scroll a ogni click** — `app.tsx:37-54` + `JumpBar.tsx:39-55` + slug in `ColumnGrid.tsx:321`. Offset `-85` e formula slug duplicati in 3 file; JumpBar fa lo scroll identico dopo che `onSelectCategory` l'ha già fatto.
  **Fix:** util condiviso `scrollToCategory()`/`categorySlug()`; JumpBar notifica soltanto.

- [x] 🟠 **Duplicato `id="app"` → doppio padding, HTML invalido** — `index.html:11` + `app.tsx:96`. La regola `#app` (global.css:70-79) si applica due volte: doppio padding laterale e bottom.
  **Fix:** rimuovere l'id/div interno.

- [x] 🟠 **Mobile: nessun percorso per edit/remove/reorder/rename** — D&D HTML5 non funziona su touch (ColumnGrid.tsx:192-316), context menu solo right-click, rename solo dblclick, ReorderModal esiste ma **mai renderizzato**. Su mobile si può solo aggiungere.
  **Fix:** bottom-sheet azioni su long-press (`@media (hover:none)`), montare ReorderModal, edit via tap.

- [x] 🟠 **`navigator.clipboard` non protetto** — `ImportExportModal.tsx:31-35`: su `file://` o http LAN (scenario tipico single-file) è `undefined` → TypeError al click "Copy". `confirm()` nativi (ImportExportModal.tsx:64, ContextMenu.tsx:53) bloccanti e non temabili.
  **Fix:** feature-detect + fallback `execCommand`; dialog custom di conferma.

- [x] 🟠 **ContextMenu: posizionamento e chiusura** — `ContextMenu.tsx:80-81`: clamp magic 190/220, submenu apre sempre a destra (fuori schermo al bordo), non si chiude su scroll/resize/right-click altrove, il click di chiusura attiva anche l'elemento sottostante; `onClose()` fuori dall'if del confirm (riga 53-56: chiude anche se annulli).
  **Fix:** misura con ref post-mount, flip submenu, chiusura su contextmenu/scroll/resize in capture phase.

- [x] 🟠 **SearchModal: ricerca eseguita a ogni render + lista senza cap** — `SearchModal.tsx:57-60,223-261`: `search()` a ogni render (hover incluso), nessun `slice`, nessun `memo` sulle row, `resolveDynamicUrl` ricalcolato per riga → rischio typing lag (viola gemini.md §4).
  **Fix:** `useMemo` su query/links, `slice(0,10)`, `SearchResultRow` con `memo()`.

- [x] 🟠 **`handleWheel` custom dannoso in ColumnGrid** — `ColumnGrid.tsx:108-120`: scroll-trap a fine colonna (la pagina non scrolla più), jank su trackpad; `overscroll-behavior: contain` (CSS:158) già sufficiente.
  **Fix:** rimuovere l'handler JS.

- [x] 🟠 **Nessun feedback sulle azioni (no toast/undo)** — Remove link istantaneo e irreversibile; rename/move/import/reset senza conferma visiva.
  **Fix:** snackbar/toast con Undo dopo le mutazioni.

- [x] 🟠 **Backup/restore asimmetrico** — `dataStore.exportJson` (349-354) non include i rank, ma `ImportExportModal.handleResetDefaults` (63-70) li cancella.
  **Fix:** includere `rankStorage.getRankData()` in export/import.

- [x] 🟠 **LinkIcon: retry propaga il click al link padre** — `LinkIcon.tsx:70-77`: span-retry dentro `<a>` senza `preventDefault`/`stopPropagation` → cliccando "ricarica icona" si naviga.
  **Fix:** bloccare propagazione; rendere lo span un `<button>` (a11y).

---

## P2 — ARCHITETTURA & STATE MANAGEMENT

- [x] 🟠 **Gestione stato incoerente: 3 vie parallele** — signals (`linksSignal`) + useState locali + chiamate engine dirette (`dataStore.getCategories()` in app.tsx:77). `useSettings.refreshData` (useSettings.ts:7-9) **non rilegge i dati**: riapplica solo il tema → tutta la catena `onConfigChanged` (app.tsx:126,160,170,176) è no-op mascherato. Effect mount app.tsx:84-86 → doppia applyTheme.
  **Fix:** unica via (signals); rinominare/eliminare `refreshData` e `onConfigChanged`; niente engine calls dai componenti.

- [x] 🟠 **Dead code diffuso** — `hooks/useDragAndDrop.ts`, `hooks/useContextMenu.ts` (mai importati; ColumnGrid re-implementa inline), `ReorderModal.tsx` + css (mai montato), `Widgets/LazyWidget.tsx` (mai usato), API keyboardManager morte (`onSelectQuickResult`, `setSearchActive/setModalActive`), computed inutilizzati (`linksCount/categoriesCount` appStore.ts:8-9, `currentAccentColor` settingsStore.ts:7), campi schema morti (`quickLaunch` types:16, `defaultSearchEngine` types:29). I test testano codice morto (illusione di copertura).
  **Fix:** integrare davvero (ColumnGrid usa i due hook + ReorderModal) oppure cancellare moduli, export barrel e test associati.

- [x] 🟠 **`ColumnGrid.tsx` god-component (470 righe)** — 11 state slice, ~20 handler: griglia, DnD con ghost DOM manuale (199-226), auto-scroll, rename inline, context menu, scroll-mask via `document.querySelectorAll` con chiave `textContent` (63-81, fragile). Effect 83-105 riattacca listener window a ogni cambio `categories` + `setTimeout(60)` (timing race).
  **Fix:** estrarre `CategoryColumn`, `DraggableLinkCard` (memo), hook `useColumnScrollMasks` con refs; misurazioni chiaveate per `cat.name`; dep su `categories.length`/version counter.

- [x] 🟠 **Separazione engine/componenti violata** — chiamate dirette `dataStore` in `ContextMenu.tsx:43,61,74`, `ColumnGrid.tsx:177,285,304,460`, `VisualEditModal/index.tsx:5-6` (path profondi `../../engine/...` con doppi apici, stile incoerente), `ImportExportModal.tsx:4-5`. Artefatti `{  x  }` da refactor.js in appStore.ts:2, useSettings.ts:2-4, LinkIcon.tsx:4.
  **Fix:** mutazioni solo via azioni store; import uniformi al barrel; ripulire formattazione (Prettier una volta configurato).

- [x] 🟠 **HeaderClock vs MobileBottomNav: 4 bottoni duplicati verbatim** — stessi title/icone/callback in due file; app.tsx passa due volte le stesse closure (106-117, 131-142). Bonus: nome "HeaderClock" ingannevole (nessun orologio).
  **Fix:** unico `ActionToolbar` con variante CSS; valutare rename.

- [x] 🟡 **Modal non è un portal; scroll-lock triplicato** — lock in `useModals.ts:22-35` + `pointerEvents:none` su `<main>` (app.tsx:120) + Modal nel flow normale.
  **Fix:** portal su `document.body`, scroll-lock dentro Modal (con compensazione scrollbar-gutter), rimuovere workaround.

- [x] 🟡 **`useModals`: 6 boolean → stati impossibili** — `useModals.ts`: 2 modali possono aprirsi insieme; `isAnyModalOpen` mantenuto a mano.
  **Fix:** singolo stato discriminato `activeModal: 'search'|'settings'|...|null`.

- [x] 🟡 **`useKeyboardShortcuts` API fragile** — `dependencies: any[]` (buco di tipo), deps manuali dimenticabili, detach/attach del listener globale a ogni toggle modale, commento eslint morto (ESLint non esiste).
  **Fix:** handlers via ref corrente, effect senza deps, tipizzare, rimuovere commento.

- [x] 🟡 **Escape gestito 3 volte** — keyboardManager globale (59-63) + Modal per-modale (33-43) + input search (74-80).
  **Fix:** un solo punto di verità (delegare a Modal/portal).

- [x] 🟡 **Barrel `export *` ovunque** — engine/components/hooks/stores index: collisioni silenti, API pubblica indeterminata; `barrelExports.test.ts` congela la forma.
  **Fix:** export nominati espliciti; cancellare il test.

- [x] ⚪ **Mutabilità esposta dallo store** — `dataStore.getLinks()` copia solo l'array (oggetti condivisi mutabili); `importJson` assegna senza clonare; `JSON.parse(JSON.stringify())` in dataStore.ts:162-164 e cheatsheetData.ts:44 (TODO dichiara structuredClone "✅", falso).
  **Fix:** `structuredClone` in uscita o deep-freeze in dev; update immutabili.

- [x] ⚪ **`rankStorage`: detector storage confuso + parsed non validato** — `rankStorage.ts:10-30`: `getStorage()` testa due volte la stessa cosa (ramo else irraggiungibile); `load()` (41-52) accetta qualsiasi JSON (es. `5`) → `recordUsage` può lanciare su shape non-oggetto in strict mode.
  **Fix:** semplificare detector; validare che parsed sia plain object.

---

## P3 — UI/UX & ACCESSIBILITÀ

- [x] 🔴→🟠 **Modali senza focus trap, background non inert, focus non ripristinato** — `Modal.tsx`: `role="dialog"`/`aria-modal` ci sono, ma Tab esce dal dialogo, link dietro attivabili da tastiera (pointerEvents blocca solo mouse), nessun restore al trigger.
  **Fix:** focus trap + `inert` sul resto dell'albero + focus restore.

- [x] 🟠 **Nessun indicatore `:focus-visible` in tutta l'app** — `outline:none` globale (global.css:117-122) e zero focus ring su bottoni/tab/link/menu. JumpBar con mask-image può nascondere il focus ai bordi.
  **Fix:** token `--focus-ring` + regola `:focus-visible` globale. ✅ Fatto (element+pseudo selector; mask JumpBar chiusa in A11: `:focus-within` disattiva la mask-image).

- [x] 🟠 **Contrasto `--text-muted` #64748b su #08080a ≈ 4.2:1 < 4.5:1 (WCAG AA)** — variables.css:33; usato per sottotitoli/hint/footer dei modali.
  **Fix:** ~#8b9bb0 o equivalente ≥4.5:1. ✅ Fatto: #8b9bb0 ≈ 7.2:1.

- [x] 🟠 **SearchModal senza pattern ARIA combobox** — mancano `role="combobox"`, `aria-expanded/controls/activedescendant`, `role="listbox"/"option"`, live region risultati; selezione con frecce fuori viewport senza `scrollIntoView` (lista max-height 420px); Tab dirottato → clear button irraggiungibile da tastiera; Modal con `hideHeader` senza `aria-label`. ⏳ Parziale: `aria-label` su Modal hideHeader **fatto** (`Modal.tsx` prop `ariaLabel`, SearchModal la passa). ✅ Completato (A1): combobox+listbox/option, `aria-activedescendant` id stabili, live region conteggio, `scrollIntoView('nearest')`, Tab intercettato solo con completamento reale; 6 test ARIA su ruoli reali.
  **Fix:** pattern completo + `results[selectedIndex].scrollIntoView({block:'nearest'})` + prop `aria-label` su Modal.

- [x] 🟠 **Z-index: MobileBottomNav (99999) sopra i modali (1000)** — `MobileBottomNav.module.css:7-26` resta visibile e cliccabile sopra ogni overlay.
  **Fix:** scala z-index centralizzata come token (nav 900 < overlay 1000 < menu 2000). ✅ Fatto: token `--z-*` in variables.css (ActionToolbar 99999!important → --z-nav; toast 3000).

- [x] 🟠 **Icon-button senza accessible name** — 8 bottoni HeaderClock/MobileBottomNav con solo `title`; toggle icon picker (FormFields.tsx:124-130); span-retry LinkIcon non focusabile. ⏳ Parziale (2026-08): `ActionToolbar` (ex HeaderClock/MobileBottomNav) ha aria-label sui 4 bottoni; LinkIcon retry → `<button aria-label>`; toggle icon-picker ha nome visibile. **Residui chiusi (A2):** ReorderModal move up/down, colorChipBtn SettingsModal, clearSearchBtn CheatsheetModal etichettati; `aria-expanded/aria-haspopup` sul toggle picker. ✅
  **Fix:** `aria-label` ovunque; span → button.

- [x] 🟠 **Label non associate ai controlli** — FormFields.tsx:35,49,65,77,94,106 e SettingsModal.tsx:73,102,141,183,213,255 senza `htmlFor`/`id`; placeholder-as-label in Search/Cheatsheet.
  **Fix:** `htmlFor`/`id` o `aria-label`. ✅ Fatto (A3): 6 coppie for/id su FormFields, ScriptEditor/CategoryPicker associati, trigger custom-select → `<button>` con aria-expanded, gruppi Settings con role=group+aria-labelledby, aria-label sui search placeholder-only.

- [x] 🟡 **Context menu inaccessibile da tastiera** — no `role="menu"/"menuitem"`, no roving tabindex, no tasto Menu/Shift+F10, focus non entra nel menu.
  **Fix:** pattern ARIA menu completo. ✅ Fatto (A4+B5): role=menu/menuitem, roving tabindex, frecce/Home/End, focus prima voce, Esc + restore focus invoker, submenu aria-haspopup/expanded, trigger Shift+F10/Menu key via CustomEvent `startpage:open-context-menu` su card.

- [x] 🟡 **`lang="en"` (index.html:2) con UI in gran parte italiana** — screen reader legge IT con fonetica EN; copy misto IT/EN ovunque (Settings IT, Search EN, Modal close "Close"/"Chiudi (Esc)").
  **Fix:** scegliere una lingua o dizionario stringhe centralizzato; `lang` coerente.

- [x] 🟡 **Reduced motion solo CSS** — scroll JS `behavior:'smooth'` (app.tsx:48,52, JumpBar, ColumnGrid:147) ignora `prefers-reduced-motion`.
  **Fix:** gate JS con `matchMedia`. ✅ Fatto: `scrollBehavior()`/`prefersReducedMotion()` in categoryScroll (window.scrollTo gateato; scrollIntoView resta istantaneo).

- [x] 🟡 **AutoFocus sparsi e orchestrazione focus assente** — 5 autoFocus (SearchInput, Cheatsheet, rename, icon picker, new-category) + focus manuali duplicati (SearchModal:39-51).
  **Fix:** strategia unica gestita da Modal. ✅ Fatto (A5): rimossi focus manuali duplicati (SearchModal), un solo `autofocus` dichiarativo per modale, Modal orchestra il focus iniziale.

- [x] 🟡 **VisualEditModal: draft sporco persiste tra aperture; tab senza ARIA; nuova categoria non ordinata** — state sopravvive al Cancel (effetto del bug hooks + `useEffect` deps `[targetLink]`); CategoryPicker non aggiunge a `categoryOrder`; segmented senza `role="tablist"`; overlay-click perde il form senza conferma.
  **Fix:** reset state su close (o `key`), `dataStore.addCategory` completa, ARIA tabs, conferma dirty-form. ✅ Fatto (A6+Passo0): `key={editTargetLink?.id ?? 'new'}` + reset stati accessori (deps `[isOpen, targetLink]`), tablist ARIA con arrow-nav, `addCategory` al submit, confirmDialog 'Discard changes?' su close dirty.

- [x] 🟡 **SettingsModal: bottone "Salva e Chiudi" ingannevole + state stale** — applica live, "Salva" è no-op; state locale copia di `getConfig()` non risincronizzata (esiste già `themeConfigSignal`); `currentAccent` mai usato.
  **Fix:** label "Chiudi"; leggere direttamente `themeConfigSignal.value`; cancellare state locale. ✅ Fatto (signal diretto già da P2; label → "Close"; `currentAccent` già purged).

- [x] 🟡 **Empty/error states assenti** — categoria vuota, griglia vuota post-import/reset senza CTA; LazyWidget errore → `null` silenzioso; nessun skeleton favicon.
  **Fix:** empty states con CTA "Aggiungi il primo link". ✅ Fatto (B5+wiring): empty state colonna e griglia vuota con CTA 'Add the first link' (prop opzionale `onAddLink`, wired in app.tsx → add-link modal). LazyWidget già purged (dead code); skeleton favicon non implementato (nice-to-have, non bloccante).

- [x] 🟡 **JumpBar: no `aria-current`, tab attiva non portata in vista, re-render a ogni frame di scroll** — `JumpBar.tsx:21-37`: `setScrollState` con oggetto nuovo a ogni evento scroll.
  **Fix:** bail-out su valori identici + `aria-current` + scrollIntoView della pill attiva (feature-detect per jsdom). ✅ Fatto.

- [x] 🟡 **Touch target sotto soglia** — LinkRow ~31px, context item ~32px, top tools 34px, clear 24px (consigliati ≥44px touch / WCAG min 24px).
  **Fix:** padding minimo su `@media (pointer: coarse)`. ✅ Fatto: ≥24px su linkRow/clearBtn/clearSearchBtn (44px ideali ancora no).

- [x] 🟡 **Tooltip desktop-only: feature invisibili su touch** — `title` ovunque con istruzioni tastiera/drag su dispositivi senza hover.
  **Fix:** hint contestuali per `(hover:none)` + azioni alternative touch. ✅ Fatto (A9): sezione 'Touch tip' su `@media (hover:none)` in Settings; long-press context menu già presente come alternativa touch.

- [x] ⚪ **User-select:none troppo aggressivo** — global.css:26-38: non si può copiare un URL/titolo.
  **Fix:** limitare ai controlli interattivi. ✅ Fatto: globale solo su button/nav/img/svg; `.linkTitle` user-select:text.

- [x] ⚪ **Modale su tablet/landscape phone soffocato** — Modal.module.css:16-24 (`max-height:90vh`) + bottom-nav visibile su 601-1023px: header+footer comprimono il contenuto scrollabile; in landscape phone resta poco spazio utile.
  **Fix:** media query landscape (`max-height`) con layout compatto / full-screen sotto certa altezza. ✅ Fatto (A8): `@media (max-height:480px)` layout full-screen 100dvh, header/footer compatti; z su token.

- [x] ⚪ **Nessun `<noscript>`, nessun h1/skip-link, setTimeout non puliti, `pageYOffset` deprecato, shortcut hints con ⌘ non cross-platform.** ✅ Completato (A10+B5): noscript EN, h1 sr-only + skip-link `#main-grid`, ⌘→platform-detect, tutti i setTimeout trackati con cleanup (app highlight, search selection, import copied, DnD ghost/justDropped).

---

## P4 — PERFORMANCE

- [x] 🟠 **Waterfall favicon all'avvio: fino a ~720 richieste** — iconResolver.ts:54-82 (6 candidati/dominio) × ~120 link, retry con cache-bust su tutta la catena, nessuna persistenza dominio→candidato, `sz=128` per icone 18px, nessun `referrerpolicy`. Privacy: telemetria implicita a Google/icon.horse/DDG.
  **Fix:** cache localStorage `domain→candidateIndex`, catena ridotta a 2-3, `sz=64`, referrerPolicy, IntersectionObserver. ✅ Fatto (cache+3 tier+sz=64+no-referrer); IntersectionObserver non necessario (img già loading=lazy).

- [x] 🟠 **ColumnGrid: re-render intera griglia a 60fps durante dragover** — `ColumnGrid.tsx:228-260`: setState per pointermove → re-render ~120 card + LinkIcon non memoized. ⏳ Parziale: split P2 fatto (`DraggableLinkCard` con memo + comparatore, setState guardati in `useDragAndDrop`), scritture DOM minime, ma costo vdom per frame ancora intero + comparatore ignora identità callback (closure stale). ✅ Completato (B1): `stores/dragStore.ts` signals + setter guardati; snapshot hook via `.peek()`; card con computed per-link → per frame si ri-renderizzano max 2 card (+2 colonne highlight).
  **Fix:** `LinkRow`/`ColumnCard` memoized o stato drag in signals/ref + classi DOM imperative.

- [x] 🟡 **FuzzySearch: doppio matching per keystroke + lowercase non precomputati** — `fuzzySearch.ts:114-207`: fuse.search + sweep lineare con `toLowerCase()` allocati per item.
  **Fix:** cache lowercase in `setLinks` (Map id→{title,category,aliases}) + lazy fallback in `search`. ✅ Fatto. (Re-indexing per keystroke assente ✓)

- [x] 🟡 **Icona bookmarklet = favicon Unimib hardcoded** — LinkIcon.tsx:56-59: qualunque URL `javascript:` → favicon Unimib. Reset a icona neutra (Globe). ✅ Fatto.

- [x] 🟡 **localStorage serialize-complete a ogni mutazione** — dataStore.ts:244-252, rankStorage.ts:54-60, themeEngine saveAndApply: JSON.stringify completo a ogni drop/click. Priorità bassa, ma valutare batching. ⏳ Confermato: nessun debounce; `save()` doppia scrittura (links+order) a ogni mutazione; `rankStorage.save()` a ogni click link; undo-restore = 2 save. ✅ Completato (B2): debounce 300ms + `flush()` su `beforeunload`/`visibilitychange` su **rankStorage** (hot path per-click) con test fake-timers. dataStore/themeEngine: debounce valutato e **scartato** (mutazioni discrete low-frequency; persistente sincrono per non rischiare regressioni) — decisione documentata in `dataStore.save()`.

- [x] ⚪ **`resolveDynamicUrl` ricalcolato ad ogni render per ogni link** (+placeholder `'https://example.com'` ripetuto 4 volte: ColumnGrid:411, SearchModal:237, FormFields:111, PreviewPanel:23).
  **Fix:** costante `ICON_FALLBACK_URL`; memo per-link. ✅ Completato (B3): cache Map `giorno|rule|url` (cap 500, `clearDynamicUrlCache()`, `dynamicUrlCacheStats`) dentro `dynamicEvaluator` — zero cambi ai chiamanti.

- [x] ⚪ **Font Google via `@import` render-blocking** — variables.css:5: fallisce offline (viola spirito standalone §1.2), FOIT, privacy.
  **Fix:** self-host woff2 inline o system stack dichiarato. ✅ Fatto (B4): `@import` Google Fonts rimosso → system stack dichiarato su `--font-body`/`--font-heading`; zero request render-blocking esterne.

- [ ] 🟠 **Bundle: lucide-preact ancora dominante (123 KB raw / 75.4 KB gz)** — dal visualizer `dist/stats.html` (misurato 2026-08-03 su dev post-P6): `src` 190 KB raw / 54.9 KB gz, **lucide 123 KB raw / 75.4 KB gz**, node_modules(altri) 57.2 KB raw / 15.7 KB gz, preact 21 KB raw / 8.8 KB gz. Il primo fix P0 (registry statico con named import) ha abbassato il bundle a ~268 KB, ma lucide resta il peso maggiore dopo `src` — segnale di codice duplicato nei componenti importati e/o import non tree-shaken. Dist totale 268.58 KB (79.85 KB gz) vs budget 350 KB: margine ~82 KB.
  **Fix (DA FARE, non ancora implementato):** rivedere il registry icone → import named per singola icona (niente `import *` residuo), verificare `sideEffects:false`/`exports` di lucide-preact nel bundler, valutare sostituzione con componenti SVG inline generati o `unplugin-icons`. Verifica: rebuild → `dist/stats.html` → atteso lucide ≪ 75 KB gz. Target complessivo: ~200-250 KB raw. (*Registrato come item di follow-up — NON implementato in questa fase, come richiesto dall'utente.*)

---

## P5 — BUILD, TOOLING & TEST

- [x] 🔴 **100 errori `tsc --noEmit`, nessuno script li esegue** — tsconfig strict (verbatimModuleSyntax, exactOptionalPropertyTypes, noUncheckedIndexedAccess, noUnusedLocals) non enforced. Include: TS6133 `h`/import morti ovunque, TS2307 tutti i `*.module.css` (manca `vite-env.d.ts` con `/// <reference types="vite/client" />`), `spellCheck` inesistente su input (SearchModal:171), void-truthiness ColumnGrid:164, possibly-undefined in dataStore:290/themeEngine:147-150/fuzzySearch:189, test non tipizzati (signalsStore.test.ts:16).
  **Fix:** aggiungere `"typecheck": "tsc --noEmit"` + `src/vite-env.d.ts`; azzerare errori o rilassare mirati `noUncheckedIndexedAccess`/`exactOptionalPropertyTypes`.

- [x] 🟠 **Script `test` fragile** — `package.json:10`: path hardcoded `./node_modules/vitest/vitest.mjs`. Mancano script `typecheck`, `coverage`, `lint`.
  **Fix:** `"test": "bun run vitest run"` + script mancanti.

- [x] 🟠 **Nessun ESLint/Prettier/Husky** — TODO.md lo dichiara "✅ Completato": falso.
  **Fix:** configurare (o de-flaggare TODO) + nello stesso passo cancellare i ~20 `import { h }` morti e uniformare stile import. ✅ Fatto (P5): ESLint 9 flat config (`eslint.config.mjs`, typescript-eslint) + Prettier (`.prettierrc`/`.prettierignore`), script `lint` in package.json; import `{ h }` morti rimossi. **Decisione utente:** niente Husky né CI (config-only).

- [x] 🟠 **Coverage test: buchi su feature che mutano dati** — zero test per: themeEngine, SettingsModal, ImportExportModal, LinkIcon (catena fallback), ColumnGrid (card/rename/context), HeaderClock/MobileBottomNav handler, DnD reale (dragDrop.test.ts testa solo dataStore!). I test istanziano modali solo con `isOpen=true` (bug hooks invisibile).
  **Fix:** suite dedicate in ordine: themeEngine → ImportExportModal → click card ColumnGrid → DnD con fireEvent → toggle modali. ✅ Fatto (P5): nuove suite `themeEngine`, `settingsModal`, `importExportModal`, `linkIcon` (catena fallback provider), decoupling selectors in UI/integrationFlow/searchModal/modalBase, setup globale `tests/setup.ts`; 231 test totali.

- [x] 🟡 **`productionBuild.test.ts` rompe checkout fresco** — legge `dist/index.html` (gitignored) → rosso finché non buildi; soglia 1MB inutile (13× il budget); check `console.log` tautologico con drop_console.
  **Fix:** `it.skipIf(!fs.existsSync(...))` o build nel test; budget realistico (~350 KB post-fix lucide). ✅ Fatto (P5): `skipIf` senza build+fs, budget 350 KB.

- [x] 🟡 **`vite.config.ts`: base non impostata + warning soppressi** — manca `base: './'` (contratto file://+GitHub Pages §1.2/§2.6 fragile per risorse future); `chunkSizeWarningLimit: 100000000` e `assetsInlineLimit: 100000000` hanno nascosto la regressione bundle.
  **Fix:** `base: './'`; rimuovere assetsInlineLimit; chunk warning a 300 KB. ✅ Fatto (P5): `base:'./'`, terser `drop_console:['log','debug','info']`, chunk warning rimosso.

- [x] 🟡 **`stats.html` (981 KB) tracciato in git, rigenerato a ogni build; visualizer apre browser; gzipSize assente nel report.**
  **Fix:** `visualizer({ filename:'dist/stats.html', gzipSize:true, open:false })` + `.gitignore`. ✅ Fatto (P5): visualizer gzipSize+open:false su `dist/stats.html`, aggiunto a `.gitignore`.

- [x] 🟡 **Confusione root `index.html` dev vs artifact produzione** — `structure.md:11` documenta la root `index.html` come "production bundle", ma su `dev` è il template Vite con `<script src="/src/main.tsx">`. L'artifact vero vive solo in `dist/` (gitignored) e su `main` squashed. Rischio deploy accidentale del file dev.
  **Fix:** chiarire in structure.md il doppio ruolo; artifact solo su main. ✅ Risolto: l'artifact vive solo in `dist/` da `base:'./'` (P5); structure.md:11 ora documenta la root `index.html` come "Vite dev template (production bundle lives in dist/ or on main)".

- [x] 🟡 **Test fragili/illusionistici** — `accessibility.test.tsx` legge stringhe CSS da disco (nessun comportamento); `reorderModal.test.tsx:39-44` con `if(length>1)` = falso positivo garantito; assert sul copy EN (`getByTitle(...)`) in uiComponents/integrationFlow; `confirm` mock con restore manuale (contextMenu.test.tsx:60); singleton engine non resettati uniformemente.
  **Fix:** test su ruoli/ARIA reali (ruolo dialog di Modal esiste), asserzioni incondizionate, `within()`, setupFiles con reset globale. ✅ Fatto (P5): riscrittura `accessibility.test.tsx` senza `fs.readFileSync`, `tests/setup.ts` globale, assert su ruoli reali.

- [x] 🟡 **Nessuna CI** — `.github/workflows/` assente: nessun gate su install/test/typecheck/build (viola spirito zero-regression §3).
  **Fix:** workflow minimo: `bun install --frozen-lockfile` → typecheck → test → build su PR/push dev. ✅ **Decisione utente:** niente CI (config-only). Item chiuso per scelta esplicita.

- [x] ⚪ **`package.json` version `1.0.0` vs policy SemVer pre-release 0.x (gemini.md §2.7) e ultima release v0.3.0.** — Riallineare. ✅ Fatto (P5): bump `0.4.0`.
- [ ] ⚪ **ActiveModal UX minore: doppio Escape (Modal + keyboardManager), terner drop_console rimuove i warn di produzione, README main con screenshot `assets/` non committato → immagine rotta** (viola §2.3).

---

## P6 — SICUREZZA

- [x] 🟠 **`new Function` su dati non fidati = stored XSS via import** — linkExecutor.ts:57-66 esegue scriptContent; `importJson` (dataStore.ts:356-373) valida solo `Array.isArray` → JSON di "backup" malevolo inietta bookmarklet persistenti. Fallback `window.location.href='javascript:...'` (riga 62) pericoloso e rotto.
  **Fix:** eliminare fallback `javascript:`; schema validation per-item su import (flaggare `isScript` non richiesti); conferma utente al primo run di script non builtin; documentare trust-model in gemini.md. ✅ Fatto (P6): `linkExecutor` senza fallback `javascript:`; `importJson` hardenato (antisiss); `scriptConsent.ts` (consenso per-hash script non builtin, conferma al primo run); trust-model in gemini.md §5.

- [x] 🟡 **Script Unimib duplicati e offuscati** — ORARI_SCRIPT/ESAMI_SCRIPT (dataStore.ts:11-37) duplicano dynamicEvaluator.ts:20-31 con anno `2025` hardcoded in entrambi → rottura silenziosa a settembre.
  **Fix:** single source of truth (generare scriptContent da dynamicEvaluator). ✅ Fatto (P6): Unimib single-source con anno accademico da dynamicEvaluator.

- [x] 🟡 **`Buffer` in bundle browser + `data:` non validato** — iconResolver.ts:98 (`Buffer.from` = ReferenceError se btoa mancasse); nessuna whitelist MIME su `data:` iconSpec.
  **Fix:** rimuovere ramo Buffer; accettare solo `data:image/`. ✅ Fatto (P6): whitelist `data:image/*`, ramo Buffer rimosso.

- [x] ⚪ **No-CSP by design (single-file)** — da documentare nel README come trust-model consapevole, insieme ai provider favicon remoti (privacy). ✅ Fatto (P6): trust-model documentato in gemini.md §5 (limiti no-CSP + provider favicon remoti).

---

## P7 — FILE, DOCS & IGIENE REPO

- [x] 🟠 **`structure.md` gravemente stantio** (viola gemini.md §2.5): cita `GEMINI.md` (file: `gemini.md`), documenta `old_homepage/` inesistente, VisualEditModal come file piatto (ora cartella con 4 sotto-file), mancano `stores/`, `hooks/`, `components/modals/`, `components/Widgets/`, 7 test su 21 non citati. ✅ Fatto (P7): riscritto dallo stato reale — root completa (eslint.config.mjs, .prettierrc, bun.lock…), `engine/scriptConsent.ts`, dettaglio `VisualEditModal/` (5 file), ownership CSS condivisi, tutte le 29 suite test + `setup.ts`.
  **Fix:** riscrivere dallo stato reale; rieleggere a ogni commit che muove file.

- [x] 🟠 **TODO.md/plan.md dichiarano completamenti falsi** — "ESLint+Prettier+Husky ✅" (inesistenti), "structuredClone ✅" (ancora JSON.parse/stringify), "union type ✅" (ancora collassato, types:15: `'unimib_orari'|'unimib_esami'|string` → fix `(string & {})`), "coverage ✅" (nessuna config), "100dvh ✅" (ancora `100vh` ovunque); plan.md:35 dice Ctrl+1-9 ma è tasto singolo; TODO Task 2 dice "hold Alt" ma è toggle.
  **Fix:** verificare prima di spuntare; riallineare. ✅ Fatto (P7, verifiche grep/codice): realmente veri e mantenuti → structuredClone (dataStore.ts:148,424,521), union type (types:15 ha `(string & {})`), ESLint+Prettier (P5; Husky scartato da decisione utente), coverage v8 + script, strict flags (tsc 0 errori). Corretti i falsi → "100dvh ✅" → 🔴 aperto (8× `100vh` + `!important`, tracciato in P7), plan.md Ctrl+1-9 → `Shift+1..9`, TODO Task 2 "hold Alt" → toggle Alt/Shift+Space, script obsoleti (`vitest.mjs`/`vite.js` diretti → `bun run test`/`bun run build`).

- [x] 🟡 **Chiavi localStorage doc ≠ codice** — gemini.md §1.3 cita `startpage_links/startpage_settings`; codice usa `startpage_custom_links`, `startpage_category_order`, `startpage_theme_settings` (+`startpage_ranks` corretta).
  **Fix:** aggiornare gemini.md (il codice è il contratto reale). ✅ Risolto in P6: gemini.md §1.3 ora elenca le chiavi reali (`startpage_custom_links`, `startpage_category_order`, `startpage_theme_settings`, `startpage_ranks`, `startpage_script_consents`).

- [x] 🟡 **`refactor.js` orfano in root** — codemod usa-e-getta, regex fragile, ha prodotto artefatti `{  x  }`, non documentato.
  **Fix:** cancellare (storia in git). ✅ Fatto (P7): `git rm refactor.js`, nessun riferimento residuo.

- [x] 🟡 **Naming folder incoerente** — `Widgets/` (Pascal) vs `modals/` (lower) vs `VisualEditModal/`; `VisualEditModal.module.css` fuori dalla cartella del componente.
  **Fix:** convenzione unica (cartella PascalCase + css co-locato). ✅ Fatto (P7): `Widgets/` già eliminato (dead code P2); `modals/` → `Modals/` (9 import aggiornati + test), `VisualEditModal.module.css` co-locato nella cartella del componente (5 import aggiornati).

- [ ] 🟡 **~600 righe CSS morto duplicato** — SearchModal/Cheatsheet/Settings/VisualEdit/Reorder/ImportExport module.css ridefiniscono `.overlay/.modalContainer/.modalHeader/...` mai applicate (i componenti usano `<Modal>`); classi fantasma: `fade-in-scale` (SearchModal.tsx:156) e `styles.searchContentOverrides` (:157 → stringa `"undefined"` nel DOM); `.preview*` in Settings mai usate.
  **Fix:** cancellare blocchi morti e classi inesistenti.

- [ ] 🟡 **Design tokens incompleti** — no spacing scale/elevation/semantic colors (success/danger hardcoded `#4ade80/#f87171`); token definiti e mai usati (`--bg-navbar`, `--accent-primary-hover`, `--accent-amber` — ambra hardcoded inline `#f59e0b` in ColumnGrid:421 e PreviewPanel:34); `--accent-gradient` statica slate non aggiornata da themeEngine → badge/bottoni restano indigo a prescindere dall'accento; radius hardcoded ovunque.
  **Fix:** completare tokenizzazione; themeEngine emette tutti i derivati.

- [ ] 🟡 **Breakpoint incoerenti** — 599/600/601 e 1023/1024/1025 in file diversi: a 600px e 1024px due regimi coesistono.
  **Fix:** scala unica condivisa.

- [ ] 🟡 **Densità griglia: 3 fonti di verità divergenti** — themeEngine ('normal' = `2.5rem 1.25rem`) vs ColumnGrid.module.css:4 (`5rem`) vs media query hardcoded → flash al primo paint.
  **Fix:** unica fonte (engine via CSS var).

- [ ] 🟡 **`100vh` mobile + colonne forzate a schermo pieno** — ColumnGrid.module.css:18-39 con `!important`; ignora barre dinamiche iOS; ogni colonna ≥ una schermata anche con 2 link.
  **Fix:** `100dvh` con fallback, rimuovere `!important`, min-height adattiva.

- [ ] 🟡 **Glassmorphism senza controllo costi** — 19 `backdrop-filter` in 13 file (overlay blur(16px) + header saturate + nav blur(20px)) = repaint continui; `-webkit-` prefix incoerente (manca in 7 file → effetto assente Safari <18); nessun fallback `@supports`.
  **Fix:** ridurre livelli, prefix uniformi, fallback opaco.

- [ ] 🟡 **Meta mobile mancanti** — index.html: no `viewport-fit=cover`, no safe-area (`bottom: 1.25rem` fisso sulla pill → fluttua su iPhone), no `theme-color`, no apple-touch-icon/manifest, no `color-scheme: dark` (scrollbar chiare Firefox).
  **Fix:** meta completo + `calc(... + env(safe-area-inset-bottom))`.

- [ ] ⚪ **Magic numbers diffusi** — 1400ms highlight, -85 offset, 120/80px scroll, 35/12px auto-scroll, 190/220 clamp, pesi Fuse 0.45/0.35, rank factor 0.15, tabelle rem tema hardcoded.
  **Fix:** costanti nominate in `engine/constants.ts`.

- [ ] ⚪ **Catch silenziosi ovunque** — dataStore.ts:241,371,381; rankStorage.ts:28,49,98; themeEngine.ts:222-233; `importJson` ritorna solo false.
  **Fix:** `console.warn` con contesto (restano in dev; drop_console li toglie in prod) + errori strutturati `{ok, error}` da importJson.

- [ ] ⚪ **Error boundary assente** — eccezione di render (dati corrotti) = pagina bianca. Aggiungere boundary con bottone "Reset defaults" in main.tsx.

- [ ] ⚪ **Inline styles sparsi** — app.tsx:120, ScriptEditor:14, FormFields:169-176, ghost drag (giustificato), ambra ×2. Spostare in CSS/token.

- [x] ⚪ **i18n misto IT/EN** — centralizzare stringhe se si vuole coerenza.

- [ ] ⚪ **Scrollbar solo `-webkit`** — global.css:51-67: Firefox mostra scrollbar nativa chiara; manca `scrollbar-color`.

- [ ] ⚪ **`.linkRow:hover translateX(2px)` jitter + `transition` su `display`** — ColumnGrid.module.css:328-331: traslazione hover può jitterare su colonne strette; :373-375 transition su proprietà non animabile.
  **Fix:** hover solo su background/shadow; rimuovere transition inutile.

- [x] ⚪ **LazyWidget: `requestIdleCallback`/timeout non cancellati nel cleanup** — LazyWidget.tsx:16-35: setState possibile su componente smontato. (Nota: componente attualmente dead code — se eliminato, item chiuso; se integrato, fixare.)

- [x] 🟡 **Tipi `any`/cast su tutto il perimetro icone Lucide** — `useDragAndDrop.ts:9` (`item: any`), `useKeyboardShortcuts.ts:14` (`any[]`), `VisualEditModal/index.tsx:16-22` (`icon: any`, `Record<string, any>`), `FormFields.tsx:21` (`filteredIcons: any[]`), `LinkIcon.tsx:27` (`Record<string, any>`), `LazyWidget.tsx:7-8`. Lo strict mode è vanificato in questi punti.
  **Fix:** tipare con `LucideIcon` / `ComponentType<{size?: number; class?: string}>` (si risolve naturalmente col registry statico del P0 lucide). ✅ Risolto col registry statico (P0 lucide): `iconRegistry.ts` tipa tutto con `LucideIcon`; verifica 2026-08-03: zero `: any`/`Record<string, any>` in `src/` (grep).

- [x] ⚪ **`app.tsx:79` `currentCats[index]` possibly undefined** — incluso nei 100 errori tsc, da risolvere col fix typecheck (guard indice su jump categoria). ✅ Risolto col typecheck 0 (P2).

---

## Ordine di esecuzione consigliato

1. **Settimana 0 (fondamenta):** commit WIP → P0 tutto (signals dep, executeLink, hooks, data loss, lucide, keyboard) → script `typecheck` + vite-env.d.ts → CI minima.
2. **Settimana 1 (bug core):** P1 (form Enter, modali impilati, search engine finto, edit in-place, sanitize, mobile actions, context menu, toast).
3. **Settimana 2 (architettura):** P2 (stato unificato su signals, dead code purge, split ColumnGrid, Modal portal, useModals discriminato).
4. **Settimana 3 (UI/UX):** P3 focus trap + focus-visible + ARIA + contrasto + z-index + mobile meta/touch + P4 performance (favicon cache, memo, slice risultati).
5. **Settimana 4 (igiene):** P5 test coverage + tooling, P6 sicurezza, P7 docs/CSS/token/magic numbers → rebuild → verifica budget bundle → release squash su main (procedura gemini.md §2.2).

**Verifica finale prima di ogni release:** `bun install --frozen-lockfile` pulito → `bun run typecheck` = 0 errori → `bun run test` verde → `bun run build` → dist/index.html < 350 KB → test manuale `file://` + mobile.
