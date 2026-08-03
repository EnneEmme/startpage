/**
 * Rank Storage Engine
 * Manages link click counts and usage timestamps in localStorage to boost frequently & recently used links.
 */

import type { RankItem } from '../types/startpage';

const STORAGE_KEY = 'startpage_ranks';

class MemoryStorage implements Storage {
  private store: Record<string, string> = {};
  get length() {
    return Object.keys(this.store).length;
  }
  clear() {
    this.store = {};
  }
  getItem(key: string) {
    return this.store[key] ?? null;
  }
  key(index: number) {
    return Object.keys(this.store)[index] ?? null;
  }
  removeItem(key: string) {
    delete this.store[key];
  }
  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }
}

const getStorage = (): Storage => {
  // Accessing window.localStorage throws in sandboxed/file:// contexts
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch (err) {
    console.warn(
      '[RankStorage] window.localStorage unavailable, falling back to in-memory storage:',
      err,
    );
  }
  return new MemoryStorage();
};

/**
 * Hot-path persistence policy: recordUsage() runs on EVERY link click, so
 * writes are trailing-debounced (the in-memory map is always up to date; only
 * the localStorage write is deferred). flush() drains the pending write
 * synchronously and is wired to page hide/unload at module init.
 */
export const RANK_SAVE_DEBOUNCE_MS = 300;

export class RankStorage {
  private ranks: Record<string, RankItem> = {};
  private storage: Storage;
  private saveTimer: ReturnType<typeof setTimeout> | null = null;

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
    } catch (err) {
      console.warn('[RankStorage] Failed to parse stored ranks, starting empty:', err);
      this.ranks = {};
    }
  }

  /** Immediate synchronous persist; also drains any pending debounced write. */
  public save(): void {
    this.cancelScheduledSave();
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.ranks));
    } catch (err) {
      console.warn('Failed to save ranks to storage:', err);
    }
  }

  /**
   * Synchronously drains the pending debounced write, if any. Safe to call
   * from beforeunload / visibilitychange(hidden) handlers: it never defers.
   */
  public flush(): void {
    if (this.saveTimer !== null) {
      this.save();
    }
  }

  private cancelScheduledSave(): void {
    if (this.saveTimer !== null) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
  }

  /** Trailing-debounce the disk write; the in-memory map is already current. */
  private scheduleSave(): void {
    this.cancelScheduledSave();
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      this.save();
    }, RANK_SAVE_DEBOUNCE_MS);
  }

  public recordUsage(linkId: string): void {
    const current = this.ranks[linkId] || { linkId, clicks: 0, lastUsedTimestamp: 0 };
    this.ranks[linkId] = {
      linkId,
      clicks: current.clicks + 1,
      lastUsedTimestamp: Date.now(),
    };
    this.scheduleSave();
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
    this.scheduleSave();
  }

  public clear(): void {
    this.ranks = {};
    // Synchronous + cancels any pending debounced write, so a late timer can
    // never resurrect cleared ranks onto disk.
    this.cancelScheduledSave();
    try {
      this.storage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('[RankStorage] Failed to remove stored ranks:', err);
    }
  }
}

export const rankStorage = new RankStorage();

// Module init: never lose the trailing debounce window on page hide/close.
// Guarded so importing the module in node (tests without a DOM) is a no-op.
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => rankStorage.flush());
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        rankStorage.flush();
      }
    });
  }
}
