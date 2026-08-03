import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DataStore, DEFAULT_CONFIG, sanitizeLinkItem, UNIMIB_ESAMI_BASE_URL, UNIMIB_ORARI_BASE_URL } from '../src/engine/dataStore';
import { rankStorage } from '../src/engine/rankStorage';
import type { LinkItem } from '../src/types/startpage';

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
    expect(reloadedIds[reloadedIds.length - 1]!).toBe('mail');
    expect(DEFAULT_CONFIG.commands[0]!.id).toBe('mail'); // sanity: it used to be first
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
    expect(migrated.getLinks()[0]!.category).toBe('AI & LLMs');
    expect(localStorage.getItem('startpage_migrations')).toContain('v2_legacy_normalization');

    // Second load: user data untouched even if it looks legacy-shaped again
    const links = migrated.getLinks().map(l => ({ ...l, category: 'LLMs 2' }));
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: links }));
    const secondLoad = new DataStore();
    expect(secondLoad.getLinks()[0]!.category).toBe('LLMs 2');
  });

  it('ships a default config with no script machinery at all (D3)', () => {
    for (const link of DEFAULT_CONFIG.commands) {
      expect(link.isScript).toBeUndefined();
      expect(link.scriptContent).toBeUndefined();
      expect(link.url.toLowerCase().startsWith('javascript:')).toBe(false);
    }
    const orari = DEFAULT_CONFIG.commands.find(l => l.id === 'unimib_orari')!;
    expect(orari.url).toBe(UNIMIB_ORARI_BASE_URL);
    expect(orari.dynamicUrlRule).toBe('unimib_orari');
  });

  it('migration v3 converts stored Unimib script links to dynamic-only (D3, idempotent)', () => {
    // Pre-v3 profile: v2 done, Unimib links still in script form
    localStorage.clear();
    localStorage.setItem('startpage_migrations', JSON.stringify({ v2_legacy_normalization: true }));
    const legacyCommands = [
      {
        // user-renamed + customized: only the machinery must go
        id: 'unimib_orari', title: 'Lezioni mie', url: 'javascript:updateOrari()',
        aliases: ['orari'], category: 'ScuolaCustom', icon: 'https://example.com/icon.png',
        dynamicUrlRule: 'unimib_orari', isScript: true, scriptContent: 'globalThis.__v3Old = 1'
      },
      {
        // legacy shape without dynamicUrlRule: matched by id/title, rule ensured
        id: 'esami', title: 'Esami', url: 'javascript:updateEsami()',
        aliases: ['esami'], category: 'School', isScript: true, scriptContent: 'alert(1)'
      },
      {
        // untouched: an unrelated custom bookmarklet stays as-is (user data)
        id: 'mybm', title: 'My Bookmarklet', url: 'javascript:alert(1)',
        aliases: [], category: 'Tools', isScript: true, scriptContent: 'alert(1)'
      }
    ];
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: legacyCommands }));

    const migrated = new DataStore();
    const links = migrated.getLinks();

    const orari = links.find(l => l.id === 'unimib_orari')!;
    expect(orari.isScript).toBeUndefined();
    expect(orari.scriptContent).toBeUndefined();
    expect(orari.url).toBe(UNIMIB_ORARI_BASE_URL);
    expect(orari.dynamicUrlRule).toBe('unimib_orari');
    // rename/custom icons/category survive
    expect(orari.title).toBe('Lezioni mie');
    expect(orari.icon).toBe('https://example.com/icon.png');
    expect(orari.category).toBe('ScuolaCustom');

    const esami = links.find(l => l.id === 'esami')!;
    expect(esami.isScript).toBeUndefined();
    expect(esami.scriptContent).toBeUndefined();
    expect(esami.url).toBe(UNIMIB_ESAMI_BASE_URL);
    expect(esami.dynamicUrlRule).toBe('unimib_esami');

    // unrelated user scripts are NOT touched by the Unimib migration
    const bm = links.find(l => l.id === 'mybm')!;
    expect(bm.isScript).toBe(true);

    // flag persisted + migrated items persisted script-free (the unrelated
    // user bookmarklet legitimately keeps its own scriptContent)
    expect(localStorage.getItem('startpage_migrations')).toContain('migrated_v3_unimib_dynamic');
    const persisted = JSON.parse(localStorage.getItem('startpage_custom_links')!) as { commands: LinkItem[] };
    const persistedUnimib = persisted.commands.filter(l => l.id === 'unimib_orari' || l.id === 'esami');
    for (const item of persistedUnimib) {
      expect(item.scriptContent).toBeUndefined();
      expect(item.isScript).toBeUndefined();
    }

    // idempotent: a reload leaves everything identical
    const second = new DataStore();
    expect(second.getLinks()).toEqual(links);
  });

  it('edits a link in place preserving its position in the category column', () => {
    const social = dataStore.getCategories().find(c => c.name === 'Social')!;
    const firstId = social.links[0]!.id;
    const edited = { ...social.links[0]!, title: 'Renamed First' };

    dataStore.updateLink(edited);

    const after = dataStore.getCategories().find(c => c.name === 'Social')!;
    expect(after.links[0]!.id).toBe(firstId);
    expect(after.links[0]!.title).toBe('Renamed First');
  });

  it('sanitizeLinkItem drops unrecoverable entries and fills defaults', () => {
    expect(sanitizeLinkItem(null)).toBeNull();
    expect(sanitizeLinkItem(42)).toBeNull();
    expect(sanitizeLinkItem({ title: 'No Id', url: 'https://x.com' })).toBeNull();
    expect(sanitizeLinkItem({ id: 'x', url: 'https://x.com' })).toBeNull();

    const clean = sanitizeLinkItem({ id: 'x', title: 'X', url: 'https://x.com', aliases: 'not-an-array' });
    expect(clean).not.toBeNull();
    expect(clean!.aliases).toEqual([]);
    expect(clean!.category).toBe('General');
  });

  it('sanitizes malformed items coming from localStorage instead of crashing', () => {
    const malformed = [
      { id: 'ok', title: 'Ok', url: 'https://ok.com' }, // missing aliases -> []
      { id: 'broken-no-url', title: 'Broken' },          // dropped
      'not-an-object',                                    // dropped
      { id: 'ok2', title: 'Ok2', url: 'https://ok2.com', aliases: ['a', 7, 'b'] } // aliases filtered
    ];
    localStorage.setItem('startpage_custom_links', JSON.stringify({ commands: malformed }));

    const store = new DataStore();
    const links = store.getLinks();
    expect(links.map(l => l.id)).toEqual(['ok', 'ok2']);
    expect(links[0]!.aliases).toEqual([]);
    expect(links[1]!.aliases).toEqual(['a', 'b']);
  });

  it('export includes rank data and import restores it', () => {
    rankStorage.clear();
    rankStorage.recordUsage('mail');
    rankStorage.recordUsage('mail');

    const exported = dataStore.exportJson();
    expect(exported).toContain('"ranks"');
    expect(exported).toContain('"mail"');

    rankStorage.clear();
    expect(rankStorage.getRankBonus('mail')).toBe(0);

    const success = dataStore.importJson(exported);
    expect(success).toBe(true);
    expect(rankStorage.getRankData()['mail']!.clicks).toBe(2);

    rankStorage.clear();
  });

  describe('import hardening against stored-XSS scripts (D2)', () => {
    it('strips isScript/scriptContent from imported items but keeps the web url', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      (globalThis as Record<string, unknown>).__d2Pwned = undefined;
      const hostile = JSON.stringify({
        commands: [{
          id: 'evil1', title: 'Evil Blog', url: 'https://evil.example.com',
          aliases: ['evil'], category: 'Dev',
          isScript: true, scriptContent: 'globalThis.__d2Pwned = 1'
        }]
      });

      expect(dataStore.importJson(hostile)).toBe(true);
      const imported = dataStore.getLinks().find(l => l.id === 'evil1');
      expect(imported).toBeDefined();
      expect(imported!.url).toBe('https://evil.example.com');
      expect(imported!.isScript).toBeUndefined();
      expect(imported!.scriptContent).toBeUndefined();
      // No script machinery survived → nothing to execute (stored-XSS disarmed)
      expect((globalThis as Record<string, unknown>).__d2Pwned).toBeUndefined();
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('Evil Blog'));
      warnSpy.mockRestore();
    });

    it('discards imported items whose url is a javascript: bookmarklet', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const hostile = JSON.stringify({
        commands: [
          { id: 'evil2', title: 'AlertBomb', url: 'javascript:alert(1)', aliases: [], category: 'Tools' },
          { id: 'good1', title: 'Good', url: 'https://good.example.com', aliases: [], category: 'Tools' }
        ]
      });

      expect(dataStore.importJson(hostile)).toBe(true);
      const ids = dataStore.getLinks().map(l => l.id);
      expect(ids).toContain('good1');
      expect(ids).not.toContain('evil2');
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('AlertBomb'));
      warnSpy.mockRestore();
    });

    it('handles mixed good/neutralizable/discardable payloads per-item', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const hostile = JSON.stringify({
        commands: [
          { id: 'good1', title: 'Good One', url: 'https://good.example.com', aliases: [], category: 'Tools' },
          { id: 'good2', title: 'Good Two', url: 'https://good2.example.com', aliases: [], category: 'Tools' },
          { id: 'strip1', title: 'StripMe', url: 'https://strip.example.com', aliases: [], category: 'Tools', scriptContent: 'alert(1)' },
          { id: 'drop1', title: 'DropMe', url: 'javascript:alert(document.cookie)', aliases: [], category: 'Tools', isScript: true }
        ]
      });

      expect(dataStore.importJson(hostile)).toBe(true);
      const links = dataStore.getLinks();
      expect(links.map(l => l.id)).toEqual(['good1', 'good2', 'strip1']);
      const stripped = links.find(l => l.id === 'strip1')!;
      expect(stripped.scriptContent).toBeUndefined();
      expect(stripped.url).toBe('https://strip.example.com');
      warnSpy.mockRestore();
    });

    it('discards scripted items whose remaining url is not web-navigable', () => {
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const hostile = JSON.stringify({
        commands: [{
          id: 'evil3', title: 'FtpScript', url: 'ftp://files.example.com/x',
          aliases: [], category: 'Tools', isScript: true, scriptContent: 'alert(1)'
        }]
      });

      expect(dataStore.importJson(hostile)).toBe(true);
      expect(dataStore.getLinks().some(l => l.id === 'evil3')).toBe(false);
      expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('FtpScript'));
      warnSpy.mockRestore();
    });

    it('load() from own localStorage stays permissive (trusted profile data)', () => {
      localStorage.clear();
      localStorage.setItem('startpage_custom_links', JSON.stringify({
        commands: [{
          id: 'my_bookmarklet', title: 'My Bookmarklet', url: 'javascript:alert(1)',
          aliases: [], category: 'Tools', isScript: true, scriptContent: 'alert(1)'
        }]
      }));
      localStorage.setItem('startpage_migrations', JSON.stringify({ v2_legacy_normalization: true }));

      const store = new DataStore();
      const kept = store.getLinks().find(l => l.id === 'my_bookmarklet');
      expect(kept).toBeDefined();
      expect(kept!.isScript).toBe(true);
      expect(kept!.scriptContent).toBe('alert(1)');
    });

    it('export→import round-trip of the default profile keeps the Unimib links', () => {
      const exported = dataStore.exportJson();
      expect(dataStore.importJson(exported)).toBe(true);
      const links = dataStore.getLinks();
      expect(links.some(l => l.id === 'unimib_orari')).toBe(true);
      expect(links.some(l => l.id === 'unimib_esami')).toBe(true);
    });

    it('a tampered Unimib-shaped item is re-canonicalized on import', () => {
      const hostile = JSON.stringify({
        commands: [{
          id: 'unimib_orari', title: 'Orari', url: 'javascript:evil()',
          aliases: ['orari'], category: 'School',
          dynamicUrlRule: 'unimib_orari', isScript: true,
          scriptContent: 'globalThis.__d2Tampered = 1'
        }]
      });

      expect(dataStore.importJson(hostile)).toBe(true);
      const orari = dataStore.getLinks().find(l => l.id === 'unimib_orari')!;
      // Unimib links are dynamic-only: the normalizer drops machinery entirely
      expect(orari.scriptContent).toBeUndefined();
      expect(orari.isScript).toBeUndefined();
      expect(orari.url).toBe(UNIMIB_ORARI_BASE_URL);
      expect(orari.dynamicUrlRule).toBe('unimib_orari');
      expect((globalThis as Record<string, unknown>).__d2Tampered).toBeUndefined();
    });
  });
});
