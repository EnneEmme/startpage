/**
 * Core Data Models & Schemas for Startpage Engine
 */

export interface LinkItem {
  id: string;
  title: string;
  url: string;
  aliases: string[];
  category: string;
  icon?: string;
  color?: string;
  searchPath?: string; // Search pattern e.g. '/results?search_query={}'
  dynamicUrlRule?: 'unimib_orari' | 'unimib_esami' | string;
  quickLaunch?: boolean;
}

export interface CategoryGroup {
  name: string;
  order?: number;
  links: LinkItem[];
}

export interface StartpageConfig {
  commands: LinkItem[];
  defaultSearchEngine?: string; // Default key e.g. '*' -> duckduckgo
}

export interface RankItem {
  linkId: string;
  clicks: number;
  lastUsedTimestamp: number;
}

export interface SearchResult {
  item: LinkItem;
  score?: number;
  rankBonus: number;
  finalScore: number;
  matchedAlias?: string;
}

export interface CommandPrefixRule {
  key: string;
  name: string;
  searchUrlTemplate: string;
}
