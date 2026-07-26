import { describe, it, expect, beforeEach } from 'vitest';
import { DataStore, DEFAULT_CONFIG } from '../src/engine/dataStore';
import { LinkItem } from '../src/types/startpage';

describe('DataStore Engine & Edge Cases', () => {
  let dataStore: DataStore;

  beforeEach(() => {
    localStorage.clear();
    dataStore = new DataStore();
    dataStore.resetToDefault();
  });

  it('loads default links and categories on initialization', () => {
    const links = dataStore.getLinks();
    expect(links.length).toBe(DEFAULT_CONFIG.commands.length);

    const categories = dataStore.getCategories();
    expect(categories.length).toBeGreaterThan(0);
    expect(categories.some(c => c.name === 'Social')).toBe(true);
    expect(categories.some(c => c.name === 'LLMs')).toBe(true);
  });

  it('adds a new link item and updates localStorage', () => {
    const newLink: LinkItem = {
      id: 'custom_blog',
      title: 'My Custom Blog',
      url: 'https://myblog.com',
      aliases: ['blog'],
      category: 'Dev'
    };

    dataStore.addLink(newLink);
    const updatedLinks = dataStore.getLinks();
    expect(updatedLinks.some(l => l.id === 'custom_blog')).toBe(true);

    const reloadedStore = new DataStore();
    expect(reloadedStore.getLinks().some(l => l.id === 'custom_blog')).toBe(true);
  });

  it('removes a link item successfully', () => {
    dataStore.removeLink('mail');
    expect(dataStore.getLinks().some(l => l.id === 'mail')).toBe(false);
  });

  it('exports and imports valid JSON configuration', () => {
    const exportedJson = dataStore.exportJson();
    expect(typeof exportedJson).toBe('string');
    expect(exportedJson).toContain('Gmail');

    const success = dataStore.importJson(exportedJson);
    expect(success).toBe(true);
  });

  it('handles invalid or corrupted JSON gracefully during import', () => {
    expect(dataStore.importJson('invalid json string {')).toBe(false);
    expect(dataStore.importJson('{"someKey": 123}')).toBe(false);
  });

  it('recovers gracefully from corrupted localStorage data', () => {
    localStorage.setItem('startpage_custom_links', 'CORRUPTED_{{{JSON');
    const corruptedStore = new DataStore();
    expect(corruptedStore.getLinks().length).toBe(DEFAULT_CONFIG.commands.length);
  });
});
