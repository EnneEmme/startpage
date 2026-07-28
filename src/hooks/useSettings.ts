import { useState, useCallback } from 'preact/hooks';
import { LinkItem, CategoryGroup } from '../types/startpage';
import { dataStore } from '../engine/dataStore';
import { themeEngine } from '../engine/themeEngine';

export function useSettings() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [categories, setCategories] = useState<CategoryGroup[]>([]);

  const refreshData = useCallback(() => {
    setLinks(dataStore.getLinks());
    setCategories(dataStore.getCategories());
    themeEngine.applyTheme(themeEngine.getConfig());
  }, []);

  return {
    links,
    categories,
    refreshData,
  };
}
