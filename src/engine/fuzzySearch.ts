/**
 * Fuzzy Search & Command Palette Engine
 * Combines Fuse.js fuzzy matching, usage rank weighting, and search engine command prefixes (g, yt, gh, w, ddg, custom).
 */

import Fuse from 'fuse.js';
import { LinkItem, SearchResult, CommandPrefixRule } from '../types/startpage';
import { rankStorage } from './rankStorage';

export const DEFAULT_PREFIX_RULES: CommandPrefixRule[] = [
  { key: 'g', name: 'Google Search', searchUrlTemplate: 'https://www.google.com/search?q={q}' },
  { key: 'yt', name: 'YouTube Search', searchUrlTemplate: 'https://www.youtube.com/results?search_query={q}' },
  { key: 'gh', name: 'GitHub Search', searchUrlTemplate: 'https://github.com/search?q={q}' },
  { key: 'w', name: 'Wikipedia Search', searchUrlTemplate: 'https://wikipedia.org/w/index.php?search={q}' },
  { key: 'ddg', name: 'DuckDuckGo Search', searchUrlTemplate: 'https://duckduckgo.com/?q={q}' }
];

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
        { name: 'aliases', weight: 0.4 },
        { name: 'title', weight: 0.35 },
        { name: 'category', weight: 0.15 },
        { name: 'url', weight: 0.1 }
      ],
      threshold: 0.4,
      includeScore: true,
      ignoreLocation: true
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
        const matchesAlias = link.aliases.some(a => a.toLowerCase() === prefix);
        return hasTemplate && matchesAlias;
      });

      if (matchedCustomLink) {
        const template = matchedCustomLink.searchTemplate || matchedCustomLink.searchPath || '';
        let fullTemplate = template;
        if (!template.startsWith('http')) {
          fullTemplate = matchedCustomLink.url.replace(/\/$/, '') + (template.startsWith('/') ? template : '/' + template);
        }
        const targetTemplate = fullTemplate.includes('{q}') ? fullTemplate : fullTemplate.replace('{}', '{q}');

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
    if (!trimmed || !this.fuse) {
      return [];
    }

    const fuseResults = this.fuse.search(trimmed);

    const scoredResults: SearchResult[] = fuseResults.map(res => {
      const item = res.item;
      const fuseScore = res.score ?? 1; // 0 is perfect match, 1 is worst
      const rankBonus = rankStorage.getRankBonus(item.id);

      // Final score formula: lower is better for sorting
      // fuseScore ranges 0..0.4, subtract rankBonus scaled down
      const finalScore = Math.max(0, fuseScore - rankBonus * 0.15);

      // Check if alias matched
      const matchedAlias = item.aliases.find(a => a.toLowerCase().includes(trimmed.toLowerCase()));

      return {
        item,
        score: fuseScore,
        rankBonus,
        finalScore,
        matchedAlias
      };
    });

    // Sort by finalScore ascending (best match first)
    scoredResults.sort((a, b) => a.finalScore - b.finalScore);

    return scoredResults;
  }
}

export const fuzzySearchEngine = new FuzzySearchEngine();
