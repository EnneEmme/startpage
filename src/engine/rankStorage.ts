/**
 * Rank Storage Engine
 * Manages link click counts and usage timestamps in localStorage to boost frequently & recently used links.
 */

import type { RankItem } from '../types/startpage';

const STORAGE_KEY = 'startpage_ranks';

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};
  get length() { return Object.keys(this.store).length; }
  clear() { this.store = {}; }
  getItem(key: string) { return this.store[key] ?? null; }
  key(index: number) { return Object.keys(this.store)[index] ?? null; }
  removeItem(key: string) { delete this.store[key]; }
  setItem(key: string, value: string) { this.store[key] = String(value); }
}

const getStorage = (): Storage => {
  // Accessing window.localStorage throws in sandboxed/file:// contexts
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {}
  return new MemoryStorage();
};

export class RankStorage {
  private ranks: Record<string, RankItem> = {};
  private storage: Storage;

  constructor(customStorage?: Storage) {
    this.storage = customStorage || getStorage();
    this.load();
  }

  private static isRankMap(value: unknown): value is Record<string, RankItem> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  public load(): void {
    try {
      const stored = this.storage.getItem(STORAGE_KEY);
      if (!stored) {
        this.ranks = {};
        return;
      }
      const parsed: unknown = JSON.parse(stored);
      // Accept only a plain object map; anything else (number, array, null,
      // string) would make recordUsage/getRankBonus throw on property access.
      this.ranks = RankStorage.isRankMap(parsed) ? parsed : {};
    } catch {
      this.ranks = {};
    }
  }

  public save(): void {
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.ranks));
    } catch (err) {
      console.warn('Failed to save ranks to storage:', err);
    }
  }

  public recordUsage(linkId: string): void {
    const current = this.ranks[linkId] || { linkId, clicks: 0, lastUsedTimestamp: 0 };
    this.ranks[linkId] = {
      linkId,
      clicks: current.clicks + 1,
      lastUsedTimestamp: Date.now()
    };
    this.save();
  }

  public getRankBonus(linkId: string): number {
    const item = this.ranks[linkId];
    if (!item) return 0;

    // Weight clicks and recency (within last 7 days)
    const clickBonus = Math.min(item.clicks * 0.1, 2.0); // max 2.0 bonus for clicks
    const now = Date.now();
    const ageInDays = (now - item.lastUsedTimestamp) / (1000 * 60 * 60 * 24);
    const recencyBonus = ageInDays <= 7 ? Math.max(0, 1.0 - ageInDays / 7) : 0;

    return clickBonus + recencyBonus;
  }

  public getRankData(): Record<string, RankItem> {
    return { ...this.ranks };
  }

  public importRankData(data: Record<string, RankItem>): void {
    this.ranks = { ...data };
    this.save();
  }

  public clear(): void {
    this.ranks = {};
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

export const rankStorage = new RankStorage();
