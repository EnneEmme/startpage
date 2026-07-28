import { describe, it, expect } from 'vitest';
import { categorySlug, categoryColumnId } from '../src/engine/categoryScroll';

describe('categoryScroll helpers', () => {
  it('builds a deterministic slug from a category name', () => {
    expect(categorySlug('Reading & News')).toBe('reading___news');
    expect(categorySlug('AI & LLMs')).toBe('ai___llms');
    expect(categorySlug('Fun')).toBe('fun');
  });

  it('builds the column DOM id from a category name', () => {
    expect(categoryColumnId('School')).toBe('column-school');
  });

  it('produces the same id for the same name (stable across components)', () => {
    expect(categoryColumnId('AI & LLMs')).toBe(`column-${categorySlug('AI & LLMs')}`);
  });
});
