// Explicit public API of the engine layer (no `export *` — collisions and
// accidental surface area are compile-time visible instead of silent).

export { categorySlug, categoryColumnId, scrollToCategory, scrollToTop, prefersReducedMotion, scrollBehavior } from './categoryScroll';
export { BASE_CHEATSHEET_SHORTCUTS, CHEATSHEET_SHORTCUTS, getDynamicCheatsheetShortcuts } from './cheatsheetData';
export type { ShortcutGroup } from './cheatsheetData';
export { copyTextToClipboard } from './clipboard';
export { DEFAULT_CONFIG, UNIMIB_ESAMI_BASE_URL, UNIMIB_ORARI_BASE_URL, DataStore, dataStore, sanitizeLinkItem } from './dataStore';
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
