import { useCallback } from 'preact/hooks';
import { linksSignal, categoriesSignal } from '../stores/appStore';
import { themeConfigSignal } from '../stores/settingsStore';
import { themeEngine } from '../engine/themeEngine';

export function useSettings() {
  const refreshData = useCallback(() => {
    themeEngine.applyTheme(themeConfigSignal.value);
  }, []);

  return {
    links: linksSignal.value,
    categories: categoriesSignal.value,
    refreshData,
  };
}
