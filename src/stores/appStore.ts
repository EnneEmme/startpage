import { signal } from '@preact/signals';
import { dataStore, rankStorage } from '../engine';
import type { LinkItem, CategoryGroup } from '../types/startpage';

export const linksSignal = signal<LinkItem[]>(dataStore.getLinks());
export const categoriesSignal = signal<CategoryGroup[]>(dataStore.getCategories());

// Signals stay in sync automatically: dataStore notifies on every mutation.
dataStore.subscribe(() => {
  linksSignal.value = dataStore.getLinks();
  categoriesSignal.value = dataStore.getCategories();
});

/**
 * Single mutation path for link/category data. Components must never import
 * the engine directly: every mutation goes through these actions.
 */
export const appActions = {
  moveLink: (linkId: string, targetCategory: string, targetIndex?: number): void =>
    dataStore.moveLink(linkId, targetCategory, targetIndex),

  removeLink: (linkId: string): void => dataStore.removeLink(linkId),

  updateLink: (link: LinkItem): void => dataStore.updateLink(link),

  addLink: (link: LinkItem): void => dataStore.addLink(link),

  renameCategory: (oldName: string, newName: string): void =>
    dataStore.renameCategory(oldName, newName),

  setCategoryOrder: (order: string[]): void => dataStore.setCategoryOrder(order),

  /** Re-insert a previously removed link at its original position (undo). */
  restoreLink: (link: LinkItem, categoryIndex: number): void => {
    dataStore.addLink(link);
    dataStore.moveLink(link.id, link.category, categoryIndex);
  },

  exportJson: (): string => dataStore.exportJson(),

  importJson: (json: string): boolean => dataStore.importJson(json),

  /** Full reset: default links + clears usage ranks (kept symmetric). */
  resetToDefaults: (): void => {
    dataStore.resetToDefault();
    rankStorage.clear();
  }
};
