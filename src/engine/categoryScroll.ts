/**
 * Category Scroll Helpers
 * Single source of truth for category-column DOM ids and smooth scrolling
 * to a category column (shared by App, JumpBar and ColumnGrid).
 */

/** Deterministic slug for a category name (safe for DOM ids/anchors) */
export const categorySlug = (categoryName: string): string =>
  categoryName.toLowerCase().replace(/[^a-z0-9]/g, '_');

/** DOM id of a category column element */
export const categoryColumnId = (categoryName: string): string =>
  `column-${categorySlug(categoryName)}`;

/** Vertical offset (px) accounting for the fixed header when aligning a column */
const HEADER_SCROLL_OFFSET = -85;

/** Smooth-scroll the page so the category column sits below the fixed header */
export const scrollToCategory = (categoryName: string): void => {
  const targetEl = document.getElementById(categoryColumnId(categoryName));
  if (!targetEl) return;
  const y = targetEl.getBoundingClientRect().top + window.scrollY + HEADER_SCROLL_OFFSET;
  window.scrollTo({ top: y, behavior: 'smooth' });
};

/** Smooth-scroll the page back to the very top ("All" categories view) */
export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};
