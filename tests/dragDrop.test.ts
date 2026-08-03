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

  it('registers new categories via addCategory (trim + idempotent)', () => {
    dataStore.addCategory('  NewCat  ');
    expect(dataStore.getCategoryOrder()).toContain('NewCat');

    const orderAfter = dataStore.getCategoryOrder();
    dataStore.addCategory('NewCat'); // duplicate: no-op
    dataStore.addCategory('   ');    // blank: no-op
    expect(dataStore.getCategoryOrder()).toEqual(orderAfter);
  });

  it('places links of a registered new category in categoryOrder position', () => {
    dataStore.addCategory('NewCat');
    dataStore.addLink({
      id: 'tmp-new-cat-link',
      title: 'Tmp',
      url: 'https://example.com',
      aliases: [],
      category: 'NewCat'
    });

    const catNames = dataStore.getCategories().map(c => c.name);
    expect(catNames[catNames.length - 1]).toBe('NewCat');

    dataStore.removeLink('tmp-new-cat-link');
  });
});
