import { describe, it, expect } from 'vitest';
import { extractDomain, getFaviconUrl, resolveIcon } from '../src/engine/iconResolver';

describe('iconResolver Engine', () => {
  it('extracts domain correctly from valid URL', () => {
    expect(extractDomain('https://github.com/trending')).toBe('github.com');
    expect(extractDomain('http://mail.google.com/mail')).toBe('mail.google.com');
    expect(extractDomain('invalid-url')).toBe('');
  });

  it('returns favicon url for domain', () => {
    expect(getFaviconUrl('https://youtube.com')).toBe('https://icon.horse/icon/youtube.com');
  });

  it('resolves icon as favicon if no icon specified', () => {
    const resolved = resolveIcon('https://reddit.com');
    expect(resolved.type).toBe('favicon');
    expect(resolved.src).toBe('https://icon.horse/icon/reddit.com');
  });

  it('resolves icon as custom_url if HTTP URL provided', () => {
    const resolved = resolveIcon('https://example.com', 'https://custom-cdn.com/my-icon.png');
    expect(resolved.type).toBe('custom_url');
    expect(resolved.src).toBe('https://custom-cdn.com/my-icon.png');
  });

  it('resolves icon as lucide if named string provided', () => {
    const resolved = resolveIcon('https://twitter.com', 'Twitter');
    expect(resolved.type).toBe('lucide');
    expect(resolved.src).toBe('Twitter');
  });
});
