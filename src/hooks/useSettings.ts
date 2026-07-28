import { useCallback } from 'preact/hooks';
import { linksSignal, categoriesSignal, themeConfigSignal } from '../stores';
import { themeEngine } from '../engine';

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
