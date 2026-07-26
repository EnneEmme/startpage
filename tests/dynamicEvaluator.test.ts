import { describe, it, expect } from 'vitest';
import {
  parseDateFormatted,
  parseDateISO,
  getUnimibOrariUrl,
  getUnimibEsamiUrl,
  resolveDynamicUrl
} from '../src/engine/dynamicEvaluator';

describe('dynamicEvaluator Engine', () => {
  const mockDate = new Date(2026, 6, 26); // 26 July 2026

  it('formats dates correctly (DD-MM-YYYY and YYYY-MM-DD)', () => {
    expect(parseDateFormatted(mockDate)).toBe('26-07-2026');
    expect(parseDateISO(mockDate)).toBe('2026-07-26');
  });

  it('resolves unimib_orari dynamic rule correctly', () => {
    const url = getUnimibOrariUrl(mockDate);
    expect(url).toContain('date=26-07-2026');
    expect(url).toContain('gestioneorari.didattica.unimib.it');
  });

  it('resolves unimib_esami dynamic rule correctly with 60 day offset', () => {
    const url = getUnimibEsamiUrl(mockDate);
    expect(url).toContain('datefrom=26-07-2026');
    // 60 days after July 26 is September 24
    expect(url).toContain('dateto=24-09-2026');
  });

  it('interpolates template placeholders in raw URLs', () => {
    const rawTemplate = 'https://example.com/logs?date={{YYYY-MM-DD}}&formatted={{DD-MM-YYYY}}';
    const result = resolveDynamicUrl(rawTemplate, undefined, mockDate);
    expect(result).toBe('https://example.com/logs?date=2026-07-26&formatted=26-07-2026');
  });
});
