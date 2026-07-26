import { describe, it, expect, beforeEach } from 'vitest';
import { RankStorage } from '../src/engine/rankStorage';

describe('RankStorage Engine', () => {
  let rankStorage: RankStorage;

  beforeEach(() => {
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

  it('exports and imports rank data correctly', () => {
    rankStorage.recordUsage('youtube');
    const exported = rankStorage.getRankData();
    expect(exported['youtube'].clicks).toBe(1);

    const newStorage = new RankStorage();
    newStorage.importRankData(exported);
    expect(newStorage.getRankBonus('youtube')).toBeGreaterThan(0);
  });

  it('clears ranks successfully', () => {
    rankStorage.recordUsage('mail');
    rankStorage.clear();
    expect(rankStorage.getRankBonus('mail')).toBe(0);
  });
});
