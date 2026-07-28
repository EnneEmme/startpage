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
  searchTemplate?: string; // Custom search query template e.g. 'https://youtube.com/results?search_query={q}'
  dynamicUrlRule?: 'unimib_orari' | 'unimib_esami' | string;
  quickLaunch?: boolean;
  isScript?: boolean; // True if this link is a custom JS script / bookmarklet
  scriptContent?: string; // JavaScript code snippet
}

export interface CategoryGroup {
  name: string;
  order?: number;
  links: LinkItem[];
}

export interface StartpageConfig {
  commands: LinkItem[];
}

export interface RankItem {
  linkId: string;
  clicks: number;
  lastUsedTimestamp: number;
}

export interface SearchResult {
  item: LinkItem;
  score?: number | undefined;
  rankBonus: number;
  finalScore: number;
  matchedAlias?: string | undefined;
}

export interface CommandPrefixRule {
  key: string;
  name: string;
  searchUrlTemplate: string;
}
