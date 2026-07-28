/**
 * Fuzzy Search & Command Palette Engine
 * Combines Fuse.js fuzzy matching, exact alias scoring boost, category substring matching,
 * usage rank weighting, and search engine command prefixes (g, yt, gh, w, ddg, custom).
 */

import Fuse from 'fuse.js';
import type { LinkItem, SearchResult, CommandPrefixRule } from '../types/startpage';
import { rankStorage } from './rankStorage';

export const DEFAULT_PREFIX_RULES: CommandPrefixRule[] = [
  { key: 'g', name: 'Google Search', searchUrlTemplate: 'https://www.google.com/search?q={q}' },
  { key: 'yt', name: 'YouTube Search', searchUrlTemplate: 'https://www.youtube.com/results?search_query={q}' },
  { key: 'gh', name: 'GitHub Search', searchUrlTemplate: 'https://github.com/search?q={q}' },
  { key: 'w', name: 'Wikipedia Search', searchUrlTemplate: 'https://wikipedia.org/w/index.php?search={q}' },
  { key: 'ddg', name: 'DuckDuckGo Search', searchUrlTemplate: 'https://duckduckgo.com/?q={q}' },
  { key: 'b', name: 'Bing Search', searchUrlTemplate: 'https://www.bing.com/search?q={q}' }
];

const GOOGLE_FALLBACK_RULE: CommandPrefixRule = DEFAULT_PREFIX_RULES[0] ?? {
  key: 'g',
  name: 'Google Search',
  searchUrlTemplate: 'https://www.google.com/search?q={q}'
};

/**
 * Resolves a plain web search URL for the configured default engine.
 * Falls back to Google when the key is unknown (e.g. legacy stored values).
 */
export const getEngineFallback = (engineKey: string, query: string): { name: string; url: string } => {
  const rule = DEFAULT_PREFIX_RULES.find(r => r.key === engineKey) ?? GOOGLE_FALLBACK_RULE;
  return {
    name: rule.name.replace(/\s+Search$/, ''),
    url: rule.searchUrlTemplate.replace('{q}', encodeURIComponent(query))
  };
};

export interface ParsedCommand {
  isPrefixCommand: boolean;
  prefix?: string;
  query: string;
  redirectUrl?: string;
  engineName?: string;
}

export class FuzzySearchEngine {
  private fuse: Fuse<LinkItem> | null = null;
  private links: LinkItem[] = [];

  public setLinks(links: LinkItem[]): void {
    this.links = links;
    this.fuse = new Fuse(links, {
      keys: [
        { name: 'aliases', weight: 0.45 },
        { name: 'title', weight: 0.35 },
        { name: 'category', weight: 0.12 },
        { name: 'url', weight: 0.08 }
      ],
      threshold: 0.35, // Balanced typo tolerance without noise
      distance: 100,
      includeScore: true,
      ignoreLocation: true,
      minMatchCharLength: 1
    });
  }

  public parseCommandPrefix(rawQuery: string): ParsedCommand {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      return { isPrefixCommand: false, query: '' };
    }

    const firstSpaceIndex = trimmed.indexOf(' ');
    if (firstSpaceIndex !== -1) {
      const prefix = trimmed.substring(0, firstSpaceIndex).toLowerCase();
      const query = trimmed.substring(firstSpaceIndex + 1).trim();

      // Check default built-in prefix rules first
      const matchedDefault = DEFAULT_PREFIX_RULES.find(r => r.key === prefix);
      if (matchedDefault) {
        const template = matchedDefault.searchUrlTemplate.includes('{q}')
          ? matchedDefault.searchUrlTemplate
          : matchedDefault.searchUrlTemplate.replace('{}', '{q}');

        return {
          isPrefixCommand: true,
          prefix,
          query,
          engineName: matchedDefault.name,
          redirectUrl: template.replace('{q}', encodeURIComponent(query))
        };
      }

      // Check user-created dynamic search engine links
      const matchedCustomLink = this.links.find(link => {
        const hasTemplate = Boolean(link.searchTemplate || link.searchPath);
        const matchesAlias = link.aliases && link.aliases.some(a => a.toLowerCase() === prefix);
        return hasTemplate && matchesAlias;
      });

      if (matchedCustomLink) {
        const pathOrUrl = (matchedCustomLink.searchTemplate || matchedCustomLink.searchPath || '').trim();
        let fullTemplate = pathOrUrl;

        // If user provided relative path/param (e.g. "/results?search_query={q}" or "?q={q}")
        if (!pathOrUrl.startsWith('http://') && !pathOrUrl.startsWith('https://')) {
          const baseUrl = matchedCustomLink.url.replace(/\/$/, '');
          if (pathOrUrl.startsWith('?') || pathOrUrl.startsWith('&')) {
            fullTemplate = baseUrl + pathOrUrl;
          } else {
            const cleanPath = pathOrUrl.startsWith('/') ? pathOrUrl : '/' + pathOrUrl;
            fullTemplate = baseUrl + cleanPath;
          }
        }

        const targetTemplate = fullTemplate.includes('{q}')
          ? fullTemplate
          : fullTemplate.replace('{}', '{q}');

        return {
          isPrefixCommand: true,
          prefix,
          query,
          engineName: `${matchedCustomLink.title} Search`,
          redirectUrl: targetTemplate.replace('{q}', encodeURIComponent(query))
        };
      }
    }

    return { isPrefixCommand: false, query: trimmed };
  }

  public search(query: string): SearchResult[] {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const lowerQuery = trimmed.toLowerCase();

    // Map to collect and deduplicate search items
    const resultMap = new Map<string, SearchResult>();

    // 1. Check Fuse.js fuzzy search results
    if (this.fuse) {
      const fuseResults = this.fuse.search(trimmed);
      for (const res of fuseResults) {
        const item = res.item;
        const fuseScore = res.score ?? 1;
        const rankBonus = rankStorage.getRankBonus(item.id);
        const matchedAlias = item.aliases.find(a => a.toLowerCase().includes(lowerQuery));

        resultMap.set(item.id, {
          item,
          score: fuseScore,
          rankBonus,
          finalScore: fuseScore - rankBonus * 0.15,
          matchedAlias
        });
      }
    }

    // 2. Multi-Criteria Direct Boost Checks across ALL links
    for (const item of this.links) {
      const lowerTitle = item.title.toLowerCase();
      const lowerCategory = item.category ? item.category.toLowerCase() : '';
      const matchedExactAlias = item.aliases.find(a => a.toLowerCase() === lowerQuery);
      const matchedSubAlias = item.aliases.find(a => a.toLowerCase().includes(lowerQuery));
      const rankBonus = rankStorage.getRankBonus(item.id);

      let isMatch = false;
      let priorityScore = 1.0; // Default lower priority

      // Criteria A: Exact Alias Match -> Absolute #1 Top Priority
      if (matchedExactAlias) {
        isMatch = true;
        priorityScore = -100.0;
      }
      // Criteria B: Exact Title Match -> Priority #2
      else if (lowerTitle === lowerQuery) {
        isMatch = true;
        priorityScore = -50.0;
      }
      // Criteria C: Title Starts With Query -> Priority #3
      else if (lowerTitle.startsWith(lowerQuery)) {
        isMatch = true;
        priorityScore = -10.0;
      }
      // Criteria D: Alias Starts With Query -> Priority #4
      else if (matchedSubAlias && matchedSubAlias.toLowerCase().startsWith(lowerQuery)) {
        isMatch = true;
        priorityScore = -5.0;
      }
      // Criteria E: Category Match (Exact or Substring)
      else if (lowerCategory && lowerCategory.includes(lowerQuery)) {
        isMatch = true;
        priorityScore = 0.05;
      }
      // Criteria F: Substring Title Match
      else if (lowerTitle.includes(lowerQuery)) {
        isMatch = true;
        priorityScore = 0.1;
      }

      if (isMatch) {
        const existing = resultMap.get(item.id);
        const currentFuseScore = existing ? existing.score : 0.2;
        const computedScore = priorityScore + currentFuseScore - rankBonus * 0.15;

        resultMap.set(item.id, {
          item,
          score: currentFuseScore,
          rankBonus,
          finalScore: Math.min(existing ? existing.finalScore : computedScore, computedScore),
          matchedAlias: matchedExactAlias || matchedSubAlias || existing?.matchedAlias
        });
      }
    }

    const scoredResults = Array.from(resultMap.values());

    // Sort by finalScore ascending (lowest score = highest match priority)
    scoredResults.sort((a, b) => a.finalScore - b.finalScore);

    return scoredResults;
  }
}

export const fuzzySearchEngine = new FuzzySearchEngine();
