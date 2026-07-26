import { describe, it, expect, beforeEach } from 'vitest';
import { FuzzySearchEngine } from '../src/engine/fuzzySearch';
import { LinkItem } from '../src/types/startpage';

describe('FuzzySearchEngine & Edge Cases', () => {
  let engine: FuzzySearchEngine;

  const mockLinks: LinkItem[] = [
    { id: 'mail', title: 'Gmail', url: 'https://mail.google.com', aliases: ['m', 'gmail', 'email'], category: 'Social' },
    { id: 'youtube', title: 'YouTube', url: 'https://youtube.com', aliases: ['y', 'yt', 'video'], category: 'Fun' },
    { id: 'github', title: 'GitHub', url: 'https://github.com', aliases: ['gh', 'code', 'git'], category: 'Dev' },
    { id: 'whatsapp', title: 'WhatsApp Web', url: 'https://web.whatsapp.com', aliases: ['w', 'wa', 'chat'], category: 'Social' }
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
    expect(results[0].item.id).toBe('mail');
  });

  it('matches links by alias (e.g. gh -> GitHub)', () => {
    const results = engine.search('gh');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].item.id).toBe('github');
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
