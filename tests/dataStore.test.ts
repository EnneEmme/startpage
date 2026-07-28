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
    expect(categories.some(c => c.name === 'AI & LLMs')).toBe(true);
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
    expect(exportedJson).toContain('Mail');

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

  it('preserves user link reordering across reloads (no default-order re-sort)', () => {
    // Move 'mail' (first default) to the very end of the master list
    const links = dataStore.getLinks();
    const mail = links.find(l => l.id === 'mail')!;
    const reordered = [...links.filter(l => l.id !== 'mail'), mail];
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: reordered }));

    const reloadedStore = new DataStore();
    const reloadedIds = reloadedStore.getLinks().map(l => l.id);
    expect(reloadedIds[reloadedIds.length - 1]).toBe('mail');
    expect(DEFAULT_CONFIG.commands[0].id).toBe('mail'); // sanity: it used to be first
    expect(reloadedIds[0]).not.toBe('mail');
  });

  it('preserves user renames of default links across reloads (no force-sync)', () => {
    const links = dataStore.getLinks();
    const renamed = links.map(l =>
      l.id === 'youtube' ? { ...l, title: 'YT Video', aliases: ['myvideo'] } : l
    );
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: renamed }));

    const reloadedStore = new DataStore();
    const yt = reloadedStore.getLinks().find(l => l.id === 'youtube');
    expect(yt?.title).toBe('YT Video');
    expect(yt?.aliases).toEqual(['myvideo']);
  });

  it('runs the legacy migration exactly once (flag in localStorage)', () => {
    // Simulate a pre-migration profile: flag absent (beforeEach already ran it on fresh defaults)
    localStorage.removeItem('startpage_migrations');
    const legacy = [{
      id: 'old_llm',
      title: 'Old LLM',
      url: 'https://example.com',
      aliases: [],
      category: 'LLMs 2'
    }];
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: legacy }));

    const migrated = new DataStore();
    expect(migrated.getLinks()[0].category).toBe('AI & LLMs');
    expect(localStorage.getItem('startpage_migrations')).toContain('v2_legacy_normalization');

    // Second load: user data untouched even if it looks legacy-shaped again
    const links = migrated.getLinks().map(l => ({ ...l, category: 'LLMs 2' }));
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: links }));
    const secondLoad = new DataStore();
    expect(secondLoad.getLinks()[0].category).toBe('LLMs 2');
  });
});
