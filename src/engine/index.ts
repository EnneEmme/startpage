// Explicit public API of the engine layer (no `export *` — collisions and
// accidental surface area are compile-time visible instead of silent).

export { categorySlug, categoryColumnId, scrollToCategory, scrollToTop, prefersReducedMotion, scrollBehavior } from './categoryScroll';
export { BASE_CHEATSHEET_SHORTCUTS, CHEATSHEET_SHORTCUTS, getDynamicCheatsheetShortcuts } from './cheatsheetData';
export type { ShortcutGroup } from './cheatsheetData';
export { copyTextToClipboard } from './clipboard';
export { CATEGORY_SCROLL_OFFSET, FUSE_WEIGHT_ALIASES, FUSE_WEIGHT_CATEGORY, FUSE_WEIGHT_TITLE, FUSE_WEIGHT_URL, HIGHLIGHT_DURATION_MS, IMPORT_COPIED_FEEDBACK_MS, PAGE_CHEVRON_OVERFLOW_PX, PAGE_CHEVRON_SCROLL_OFFSET_PX, PAGE_CHEVRON_UNSCROLLED_PX, RANK_BOOST_FACTOR } from './constants';
export { DEFAULT_CONFIG, UNIMIB_ESAMI_BASE_URL, UNIMIB_ORARI_BASE_URL, DataStore, dataStore, sanitizeLinkItem } from './dataStore';
export type { ImportResult } from './dataStore';
export { getAcademicYearStart, getUnimibEsamiUrl, getUnimibOrariUrl, parseDateFormatted, parseDateISO, resolveDynamicUrl } from './dynamicEvaluator';
export { DEFAULT_PREFIX_RULES, FuzzySearchEngine, fuzzySearchEngine, getEngineFallback } from './fuzzySearch';
export type { ParsedCommand } from './fuzzySearch';
export { BRAND_FAVICON_OVERRIDES, ICON_FALLBACK_URL, extractDomain, extractOrigin, formatSvgToDataUrl, getCachedFaviconIndex, getFaviconCandidates, getFaviconUrl, getGoogleFaviconUrl, isAllowedImageDataUrl, resolveIcon, setCachedFaviconIndex } from './iconResolver';
export type { ResolvedIcon } from './iconResolver';
export { KeyboardManager, keyboardManager } from './keyboardManager';
export type { KeyboardActionHandlers } from './keyboardManager';
export { executeLink, extractScriptCode, isBookmarkletOrScript, setScriptConfirmHandler } from './linkExecutor';
export type { ScriptConfirmHandler } from './linkExecutor';
export { RankStorage, rankStorage } from './rankStorage';
export { clearConsents, grantConsent, hasConsent, hashScriptIdentity } from './scriptConsent';
export { ACCENT_COLORS, ThemeEngine, themeEngine } from './themeEngine';
export type { AccentColorOption, ThemeConfig } from './themeEngine';
