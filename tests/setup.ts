import { beforeEach } from 'vitest';

// Global storage isolation for the whole suite: every test starts from a
// pristine localStorage so persistence keys can never leak between tests
// (startpage_custom_links, startpage_category_order, startpage_ranks,
// startpage_theme_settings, startpage_migrations, ...).
// Suite-level resets of engine singletons (dataStore.resetToDefault(),
// rankStorage.clear(), ...) intentionally stay in their own files.
beforeEach(() => {
  localStorage.clear();
  // Belt and braces: script-execution consents must not leak across tests
  // even if a suite forgets to clear them explicitly.
  localStorage.removeItem('startpage_script_consents');
});
