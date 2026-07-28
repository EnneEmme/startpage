import { signal, computed } from '@preact/signals';
import {  dataStore  } from '../engine';
import { LinkItem, CategoryGroup } from '../types/startpage';

export const linksSignal = signal<LinkItem[]>(dataStore.getLinks());
export const categoriesSignal = signal<CategoryGroup[]>(dataStore.getCategories());

export const linksCount = computed(() => linksSignal.value.length);
export const categoriesCount = computed(() => categoriesSignal.value.length);

dataStore.subscribe(() => {
  linksSignal.value = dataStore.getLinks();
  categoriesSignal.value = dataStore.getCategories();
});
