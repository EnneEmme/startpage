import { describe, it, expect, beforeEach } from 'vitest';
import {
  resolveDynamicUrl,
  clearDynamicUrlCache,
  dynamicUrlCacheStats,
} from '../src/engine/dynamicEvaluator';

describe('resolveDynamicUrl memoization (per-day cache)', () => {
  beforeEach(() => {
    clearDynamicUrlCache();
  });

  it('returns identical results on repeated calls without recomputing', () => {
    const date = new Date(2026, 7, 3); // 3 Aug 2026
    const template = 'https://example.com/logs?date={{YYYY-MM-DD}}';

    const first = resolveDynamicUrl(template, undefined, date);
    const countAfterFirst = dynamicUrlCacheStats.computeCount;

    const second = resolveDynamicUrl(template, undefined, date);
    const third = resolveDynamicUrl(template, undefined, date);

    expect(second).toBe(first);
    expect(third).toBe(first);
    expect(first).toBe('https://example.com/logs?date=2026-08-03');
    // Zero recomputes: only the first call did real work
    expect(countAfterFirst).toBe(1);
    expect(dynamicUrlCacheStats.computeCount).toBe(1);
  });

  it('caches rule-based URLs too (unimib_orari)', () => {
    const date = new Date(2026, 7, 3);

    const first = resolveDynamicUrl('javascript:updateOrari()', 'unimib_orari', date);
    resolveDynamicUrl('javascript:updateOrari()', 'unimib_orari', date);

    expect(dynamicUrlCacheStats.computeCount).toBe(1);
    expect(first).toContain('date=03-08-2026');
  });

  it('uses a different cache key per day (dynamic rules depend on "today")', () => {
    const dayA = new Date(2026, 7, 3);
    const dayB = new Date(2026, 7, 4);
    const template = 'https://example.com/logs?date={{DD-MM-YYYY}}';

    const resultA = resolveDynamicUrl(template, undefined, dayA);
    const resultB = resolveDynamicUrl(template, undefined, dayB);

    expect(resultA).toContain('03-08-2026');
    expect(resultB).toContain('04-08-2026');
    expect(resultB).not.toBe(resultA);
    expect(dynamicUrlCacheStats.computeCount).toBe(2); // distinct keys: both computed
  });

  it('distinguishes cache keys by rule for the same raw url', () => {
    const date = new Date(2026, 7, 3);
    const raw = 'https://example.com/x';

    const withRule = resolveDynamicUrl(raw, 'unimib_orari', date);
    const withoutRule = resolveDynamicUrl(raw, undefined, date);

    expect(withRule).not.toBe(withoutRule);
    expect(dynamicUrlCacheStats.computeCount).toBe(2);
  });

  it('resets wholesale when the cache grows past 500 entries', () => {
    const date = new Date(2026, 7, 3);

    // Fill past the cap: the 501st unique key triggers a full reset
    for (let i = 0; i < 501; i++) {
      resolveDynamicUrl(`https://example.com/${i}`, undefined, date);
    }
    expect(dynamicUrlCacheStats.computeCount).toBe(501);

    // The oldest entry was evicted by the reset: recomputing it costs again
    resolveDynamicUrl('https://example.com/0', undefined, date);
    expect(dynamicUrlCacheStats.computeCount).toBe(502);
  });

  it('clearDynamicUrlCache() empties the cache and resets the counter', () => {
    const date = new Date(2026, 7, 3);
    resolveDynamicUrl('https://example.com/a', undefined, date);
    expect(dynamicUrlCacheStats.computeCount).toBe(1);

    clearDynamicUrlCache();
    expect(dynamicUrlCacheStats.computeCount).toBe(0);

    resolveDynamicUrl('https://example.com/a', undefined, date);
    expect(dynamicUrlCacheStats.computeCount).toBe(1); // recomputed after clear
  });
});
