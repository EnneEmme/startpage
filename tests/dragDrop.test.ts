import { describe, it, expect, beforeEach } from 'vitest';
import { dataStore } from '../src/engine/dataStore';

describe('Drag and Drop & Category Data Helpers', () => {
  beforeEach(() => {
    localStorage.clear();
    dataStore.resetToDefault();
  });

  it('moves a link to a different category', () => {
    const initialLinks = dataStore.getLinks();
    const mailLink = initialLinks.find(l => l.id === 'mail');
    expect(mailLink?.category).toBe('Social');

    dataStore.moveLink('mail', 'Fun', 0);

    const updatedLinks = dataStore.getLinks();
    const updatedMail = updatedLinks.find(l => l.id === 'mail');
    expect(updatedMail?.category).toBe('Fun');
  });

  it('reorders columns via setCategoryOrder', () => {
    const initialCategories = dataStore.getCategories().map(c => c.name);
    const newOrder = [...initialCategories].reverse();

    dataStore.setCategoryOrder(newOrder);

    const sortedCategories = dataStore.getCategories().map(c => c.name);
    expect(sortedCategories).toEqual(newOrder);
  });
});
