// Explicit public API of the engine layer (no `export *` — collisions and
// accidental surface area are compile-time visible instead of silent).

export { categorySlug, categoryColumnId, scrollToCategory, scrollToTop } from './categoryScroll';
export { BASE_CHEATSHEET_SHORTCUTS, CHEATSHEET_SHORTCUTS, getDynamicCheatsheetShortcuts } from './cheatsheetData';
export type { ShortcutGroup } from './cheatsheetData';
export { copyTextToClipboard } from './clipboard';
export { DEFAULT_CONFIG, ESAMI_SCRIPT, ORARI_SCRIPT, DataStore, dataStore, sanitizeLinkItem } from './dataStore';
export { getUnimibEsamiUrl, getUnimibOrariUrl, parseDateFormatted, parseDateISO, resolveDynamicUrl } from './dynamicEvaluator';
export { DEFAULT_PREFIX_RULES, FuzzySearchEngine, fuzzySearchEngine, getEngineFallback } from './fuzzySearch';
export type { ParsedCommand } from './fuzzySearch';
export { BRAND_FAVICON_OVERRIDES, ICON_FALLBACK_URL, extractDomain, extractOrigin, formatSvgToDataUrl, getFaviconCandidates, getFaviconUrl, getGoogleFaviconUrl, resolveIcon } from './iconResolver';
export type { ResolvedIcon } from './iconResolver';
export { KeyboardManager, keyboardManager } from './keyboardManager';
export type { KeyboardActionHandlers } from './keyboardManager';
export { executeLink, extractScriptCode, isBookmarkletOrScript } from './linkExecutor';
export { RankStorage, rankStorage } from './rankStorage';
export { ACCENT_COLORS, ThemeEngine, themeEngine } from './themeEngine';
export type { AccentColorOption, ThemeConfig } from './themeEngine';
