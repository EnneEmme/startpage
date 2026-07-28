import { signal } from '@preact/signals';
import { dataStore } from '../engine';
import type { LinkItem, CategoryGroup } from '../types/startpage';

export const linksSignal = signal<LinkItem[]>(dataStore.getLinks());
export const categoriesSignal = signal<CategoryGroup[]>(dataStore.getCategories());

dataStore.subscribe(() => {
  linksSignal.value = dataStore.getLinks();
  categoriesSignal.value = dataStore.getCategories();
});
