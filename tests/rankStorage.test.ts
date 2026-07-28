import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RankStorage } from '../src/engine/rankStorage';

describe('RankStorage Engine & Edge Cases', () => {
  let rankStorage: RankStorage;

  beforeEach(() => {
    localStorage.clear();
    rankStorage = new RankStorage();
    rankStorage.clear();
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
});
