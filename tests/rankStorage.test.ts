import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { RankStorage, RANK_SAVE_DEBOUNCE_MS } from '../src/engine/rankStorage';

describe('RankStorage Engine & Edge Cases', () => {
  let rankStorage: RankStorage;

  beforeEach(() => {
    localStorage.clear();
    rankStorage = new RankStorage();
    rankStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts empty and gives 0 rank bonus for unused link', () => {
    expect(rankStorage.getRankBonus('github')).toBe(0);
  });

  it('increments click count and increases rank bonus on usage', () => {
    rankStorage.recordUsage('github');
    const bonus1 = rankStorage.getRankBonus('github');
    expect(bonus1).toBeGreaterThan(0);

    rankStorage.recordUsage('github');
    const bonus2 = rankStorage.getRankBonus('github');
    expect(bonus2).toBeGreaterThan(bonus1);
  });

  it('decays recency bonus for links used more than 7 days ago', () => {
    const mockNow = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(mockNow);

    rankStorage.recordUsage('oldLink');
    const freshBonus = rankStorage.getRankBonus('oldLink');

    // Fast-forward 10 days
    vi.spyOn(Date, 'now').mockReturnValue(mockNow + 10 * 24 * 60 * 60 * 1000);
    const agedBonus = rankStorage.getRankBonus('oldLink');

    expect(agedBonus).toBeLessThan(freshBonus);
    vi.restoreAllMocks();
  });

  it('exports and imports rank data correctly', () => {
    rankStorage.recordUsage('youtube');
    const exported = rankStorage.getRankData();
    expect(exported['youtube']!.clicks).toBe(1);

    const newStorage = new RankStorage();
    newStorage.importRankData(exported);
    expect(newStorage.getRankBonus('youtube')).toBeGreaterThan(0);
  });

  it('recovers gracefully when localStorage has invalid JSON', () => {
    localStorage.setItem('startpage_ranks', 'CORRUPTED_{{JSON');
    const corruptedStore = new RankStorage();
    expect(corruptedStore.getRankBonus('anyId')).toBe(0);
  });

  it('clears ranks successfully', () => {
    rankStorage.recordUsage('mail');
    rankStorage.clear();
    expect(rankStorage.getRankBonus('mail')).toBe(0);
  });

  it('debounces disk persistence: in-memory state is immediate, storage write is trailing', () => {
    vi.useFakeTimers();

    rankStorage.recordUsage('github');

    // In-memory state updates synchronously on the hot path...
    expect(rankStorage.getRankBonus('github')).toBeGreaterThan(0);
    // ...but nothing hits localStorage within the debounce window
    expect(localStorage.getItem('startpage_ranks')).toBe(null);

    vi.advanceTimersByTime(RANK_SAVE_DEBOUNCE_MS - 1);
    expect(localStorage.getItem('startpage_ranks')).toBe(null);

    vi.advanceTimersByTime(1);
    expect(localStorage.getItem('startpage_ranks')).toContain('github');
  });

  it('coalesces rapid clicks into a single trailing write', () => {
    vi.useFakeTimers();
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');

    rankStorage.recordUsage('a');
    rankStorage.recordUsage('b');
    rankStorage.recordUsage('a');

    vi.advanceTimersByTime(RANK_SAVE_DEBOUNCE_MS);

    const rankWrites = setSpy.mock.calls.filter(([key]) => key === 'startpage_ranks');
    expect(rankWrites).toHaveLength(1);
    expect(rankWrites[0]![1]).toBe(JSON.stringify(rankStorage.getRankData()));
    setSpy.mockRestore();
  });

  it('flush() writes synchronously without waiting for the debounce window', () => {
    vi.useFakeTimers();

    rankStorage.recordUsage('youtube');
    expect(localStorage.getItem('startpage_ranks')).toBe(null);

    rankStorage.flush();
    expect(localStorage.getItem('startpage_ranks')).toContain('youtube');

    // No double write when the (now canceled) timer would have fired
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    vi.advanceTimersByTime(RANK_SAVE_DEBOUNCE_MS * 2);
    expect(setSpy.mock.calls.filter(([key]) => key === 'startpage_ranks')).toHaveLength(0);
    setSpy.mockRestore();
  });

  it('flush() with nothing pending is a no-op', () => {
    const setSpy = vi.spyOn(Storage.prototype, 'setItem');
    rankStorage.flush();
    expect(setSpy.mock.calls.filter(([key]) => key === 'startpage_ranks')).toHaveLength(0);
    setSpy.mockRestore();
  });

  it('clear() cancels a pending debounced write (cleared ranks never resurrect)', () => {
    vi.useFakeTimers();

    rankStorage.recordUsage('mail');
    rankStorage.clear();

    vi.advanceTimersByTime(RANK_SAVE_DEBOUNCE_MS * 2);
    expect(localStorage.getItem('startpage_ranks')).toBe(null);
  });

  it('importRankData persists after the debounce window', () => {
    vi.useFakeTimers();

    rankStorage.importRankData({ mail: { linkId: 'mail', clicks: 3, lastUsedTimestamp: Date.now() } });
    expect(localStorage.getItem('startpage_ranks')).toBe(null);

    vi.advanceTimersByTime(RANK_SAVE_DEBOUNCE_MS);
    const stored = JSON.parse(localStorage.getItem('startpage_ranks')!) as Record<string, { clicks: number }>;
    expect(stored['mail']!.clicks).toBe(3);
  });
});
