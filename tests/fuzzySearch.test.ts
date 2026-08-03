import { describe, it, expect, beforeEach } from 'vitest';
import { FuzzySearchEngine, getEngineFallback } from '../src/engine/fuzzySearch';
import type { LinkItem } from '../src/types/startpage';

describe('FuzzySearchEngine & Edge Cases', () => {
  let engine: FuzzySearchEngine;

  const mockLinks: LinkItem[] = [
    {
      id: 'mail',
      title: 'Gmail',
      url: 'https://mail.google.com',
      aliases: ['m', 'gmail', 'email'],
      category: 'Social',
    },
    {
      id: 'youtube',
      title: 'YouTube',
      url: 'https://youtube.com',
      aliases: ['y', 'yt', 'video'],
      category: 'Fun',
    },
    {
      id: 'github',
      title: 'GitHub',
      url: 'https://github.com',
      aliases: ['gh', 'code', 'git'],
      category: 'Dev',
    },
    {
      id: 'whatsapp',
      title: 'WhatsApp Web',
      url: 'https://web.whatsapp.com',
      aliases: ['w', 'wa', 'chat'],
      category: 'Social',
    },
  ];

  beforeEach(() => {
    engine = new FuzzySearchEngine();
    engine.setLinks(mockLinks);
  });

  it('parses command palette prefixes correctly', () => {
    const res1 = engine.parseCommandPrefix('g react tutorial');
    expect(res1.isPrefixCommand).toBe(true);
    expect(res1.prefix).toBe('g');
    expect(res1.redirectUrl).toBe('https://www.google.com/search?q=react%20tutorial');

    const res2 = engine.parseCommandPrefix('yt lofi hip hop');
    expect(res2.isPrefixCommand).toBe(true);
    expect(res2.redirectUrl).toBe('https://www.youtube.com/results?search_query=lofi%20hip%20hop');

    const res3 = engine.parseCommandPrefix('normal search');
    expect(res3.isPrefixCommand).toBe(false);
  });

  it('handles unknown prefix or query without space as normal fuzzy search', () => {
    const res = engine.parseCommandPrefix('unknownprefix query');
    expect(res.isPrefixCommand).toBe(false);
  });

  it('matches links by title, category, and alias', () => {
    const results = engine.search('gmail');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.item.id).toBe('mail');
  });

  it('matches links by alias (e.g. gh -> GitHub) with top priority', () => {
    const results = engine.search('gh');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]!.item.id).toBe('github');
  });

  it('prioritizes exact alias match over general fuzzy match', () => {
    const results = engine.search('yt');
    expect(results[0]!.item.id).toBe('youtube');
  });

  it('matches all links under a category query (e.g. "Social")', () => {
    const results = engine.search('Social');
    const categoryItemIds = results.map(r => r.item.id);
    expect(categoryItemIds).toContain('mail');
    expect(categoryItemIds).toContain('whatsapp');
  });

  it('returns empty array when search query is empty or whitespace', () => {
    expect(engine.search('')).toEqual([]);
    expect(engine.search('   ')).toEqual([]);
  });

  it('handles search with special characters cleanly', () => {
    const results = engine.search('!@#$%^&*()');
    expect(Array.isArray(results)).toBe(true);
  });

  it('handles empty links list without throwing errors', () => {
    const emptyEngine = new FuzzySearchEngine();
    emptyEngine.setLinks([]);
    expect(emptyEngine.search('test')).toEqual([]);
  });
});

describe('getEngineFallback (default web search engine)', () => {
  it('builds the URL from the configured engine key', () => {
    expect(getEngineFallback('ddg', 'meteo milano')).toEqual({
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/?q=meteo%20milano',
    });
    expect(getEngineFallback('b', 'test')).toEqual({
      name: 'Bing',
      url: 'https://www.bing.com/search?q=test',
    });
    expect(getEngineFallback('g', 'test')).toEqual({
      name: 'Google',
      url: 'https://www.google.com/search?q=test',
    });
  });

  it('falls back to Google for unknown or legacy keys', () => {
    expect(getEngineFallback('*', 'x').url).toContain('google.com');
    expect(getEngineFallback('', 'x').url).toContain('google.com');
  });

  it('encodes special characters in the query', () => {
    expect(getEngineFallback('g', 'c++ & co').url).toBe(
      `https://www.google.com/search?q=${encodeURIComponent('c++ & co')}`,
    );
  });
});
