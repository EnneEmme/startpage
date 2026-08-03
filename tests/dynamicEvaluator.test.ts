import { describe, it, expect } from 'vitest';
import {
  parseDateFormatted,
  parseDateISO,
  getAcademicYearStart,
  getUnimibOrariUrl,
  getUnimibEsamiUrl,
  resolveDynamicUrl,
} from '../src/engine/dynamicEvaluator';

describe('dynamicEvaluator Engine & Edge Cases', () => {
  const mockDate = new Date(2026, 6, 26); // 26 July 2026

  it('formats dates correctly (DD-MM-YYYY and YYYY-MM-DD)', () => {
    expect(parseDateFormatted(mockDate)).toBe('26-07-2026');
    expect(parseDateISO(mockDate)).toBe('2026-07-26');
  });

  it('handles year turnover dates (Dec 31 to Jan 1)', () => {
    const newYearsEve = new Date(2025, 11, 31);
    expect(parseDateFormatted(newYearsEve)).toBe('31-12-2025');
    expect(parseDateISO(newYearsEve)).toBe('2025-12-31');
  });

  it('resolves unimib_orari dynamic rule correctly', () => {
    const url = getUnimibOrariUrl(mockDate);
    expect(url).toContain('date=26-07-2026');
    expect(url).toContain('gestioneorari.didattica.unimib.it');
  });

  it('computes the academic-year `anno` param (year the a.y. started)', () => {
    // Feb 2026 → a.y. 2025/26 → anno=2025
    expect(getUnimibOrariUrl(new Date(2026, 1, 10))).toContain('anno=2025');
    expect(getAcademicYearStart(new Date(2026, 1, 10))).toBe(2025);
    // Aug 2026 → a.y. 2025/26 → anno=2025
    expect(getUnimibOrariUrl(new Date(2026, 7, 3))).toContain('anno=2025');
    expect(getAcademicYearStart(new Date(2026, 7, 3))).toBe(2025);
    // Sep 2026 → a.y. 2026/27 → anno=2026
    expect(getUnimibOrariUrl(new Date(2026, 8, 1))).toContain('anno=2026');
    expect(getAcademicYearStart(new Date(2026, 8, 1))).toBe(2026);
    // Dec 2026 → a.y. 2026/27 → anno=2026
    expect(getUnimibOrariUrl(new Date(2026, 11, 20))).toContain('anno=2026');
    expect(getAcademicYearStart(new Date(2026, 11, 20))).toBe(2026);
    // Jan 2027 → a.y. 2026/27 → anno=2026
    expect(getAcademicYearStart(new Date(2027, 0, 5))).toBe(2026);
  });

  it('resolves unimib_esami dynamic rule correctly with 60 day offset', () => {
    const url = getUnimibEsamiUrl(mockDate);
    expect(url).toContain('datefrom=26-07-2026');
    expect(url).toContain('dateto=24-09-2026');
  });

  it('interpolates template placeholders in raw URLs', () => {
    const rawTemplate = 'https://example.com/logs?date={{YYYY-MM-DD}}&formatted={{DD-MM-YYYY}}';
    const result = resolveDynamicUrl(rawTemplate, undefined, mockDate);
    expect(result).toBe('https://example.com/logs?date=2026-07-26&formatted=26-07-2026');
  });

  it('returns raw URL unchanged if no dynamic rules or templates match', () => {
    const plainUrl = 'https://google.com';
    expect(resolveDynamicUrl(plainUrl, undefined, mockDate)).toBe('https://google.com');
  });
});
