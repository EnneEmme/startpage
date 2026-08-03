/**
 * Shared Engine Constants
 * Named homes for cross-module tunables (UI timings, scroll geometry, search
 * scoring). Pure values only: no functions, no side effects, no DOM access.
 */

/** How long (ms) a category column stays highlighted after a jump-to-category. */
export const HIGHLIGHT_DURATION_MS = 1400;

/** Vertical offset (px) accounting for the fixed header when aligning a category column to the viewport top. */
export const CATEGORY_SCROLL_OFFSET = -85;

/**
 * Floating page-chevron indicator (ColumnGrid): shown while the user is within
 * the first PAGE_CHEVRON_UNSCROLLED_PX of vertical scroll and the page extends
 * more than PAGE_CHEVRON_OVERFLOW_PX below the fold; clicking it scrolls one
 * viewport height minus PAGE_CHEVRON_SCROLL_OFFSET_PX.
 */
export const PAGE_CHEVRON_UNSCROLLED_PX = 120;
export const PAGE_CHEVRON_OVERFLOW_PX = 80;
export const PAGE_CHEVRON_SCROLL_OFFSET_PX = 100;

/** Fuse.js match-field weights. Aliases carry user intent, so they weigh the most; url the least. */
export const FUSE_WEIGHT_ALIASES = 0.45;
export const FUSE_WEIGHT_TITLE = 0.35;
export const FUSE_WEIGHT_CATEGORY = 0.12;
export const FUSE_WEIGHT_URL = 0.08;

/** How strongly the usage rank bonus pulls a search result up (subtracted from its base score; lower score = better). */
export const RANK_BOOST_FACTOR = 0.15;

/** Duration (ms) of the 'Copied!' feedback state after a clipboard copy in the import/export modal. */
export const IMPORT_COPIED_FEEDBACK_MS = 2000;
