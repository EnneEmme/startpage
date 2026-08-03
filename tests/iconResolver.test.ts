import { describe, it, expect, beforeEach } from 'vitest';
import { extractDomain, extractOrigin, formatSvgToDataUrl, getCachedFaviconIndex, getFaviconCandidates, getFaviconUrl, isAllowedImageDataUrl, resolveIcon, setCachedFaviconIndex } from '../src/engine/iconResolver';

describe('iconResolver Engine', () => {
  it('extracts domain correctly from valid URL', () => {
    expect(extractDomain('https://github.com/trending')).toBe('github.com');
    expect(extractDomain('http://mail.google.com/mail')).toBe('mail.google.com');
    expect(extractDomain('https://notebooklm.google.com')).toBe('notebooklm.google.com');
    expect(extractDomain('https://elearning.unimib.it/enrol/index.php?id=68868')).toBe('elearning.unimib.it');
    expect(extractDomain('invalid-url')).toBe('');
  });

  it('extracts origin correctly from valid URL', () => {
    expect(extractOrigin('https://mail.google.com/mail/u/0/#inbox')).toBe('https://mail.google.com');
    expect(extractOrigin('https://notebooklm.google.com')).toBe('https://notebooklm.google.com');
    expect(extractOrigin('https://elearning.unimib.it/enrol/index.php?id=68868')).toBe('https://elearning.unimib.it');
    expect(extractOrigin('https://aistudio.google.com/prompts/new_chat')).toBe('https://aistudio.google.com');
    expect(extractOrigin('invalid-url')).toBe('');
  });

  it('returns short multi-tier candidate list (3 providers, sz=64)', () => {
    const candidates = getFaviconCandidates('https://mail.google.com/mail/u/0/#inbox');
    expect(candidates).toHaveLength(3);
    expect(candidates[0]).toBe('https://www.google.com/s2/favicons?domain=mail.google.com&sz=64');
    expect(candidates[1]).toBe('https://icon.horse/icon/mail.google.com');
    expect(candidates[2]).toBe('https://icons.duckduckgo.com/ip3/mail.google.com.ico');
  });

  it('returns candidate list with direct brand favicon overrides for NotebookLM', () => {
    const timestamp = 1720000000000;
    const candidates = getFaviconCandidates('https://notebooklm.google.com', timestamp);
    expect(candidates[0]).toBe('https://ssl.gstatic.com/docs/doclist/images/infinite_notebooklm_color_32dp.png?_cb=1720000000000');
    expect(candidates[1]).toContain('_cb=1720000000000');
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

  it('resolves icon as custom_url base64 data URL if raw SVG string provided', () => {
    const rawSvg = '<svg viewBox="0 0 24 24"><path d="M0 0h24v24H0z"/></svg>';
    const resolved = resolveIcon('https://example.com', rawSvg);
    expect(resolved.type).toBe('custom_url');
    expect(resolved.src).toContain('data:image/svg+xml;base64,');
  });

  it('sanitizes markdown link artifacts inside pasted SVG code', () => {
    const markdownSvg = '<svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)"><path d="M0 0h10v10H0z"/></svg>';
    const resolved = resolveIcon('https://example.com', markdownSvg);
    expect(resolved.type).toBe('custom_url');
    expect(resolved.src).toContain('data:image/svg+xml;base64,');
  });

  it('resolves icon as lucide if named string provided', () => {
    const resolved = resolveIcon('https://twitter.com', 'Twitter');
    expect(resolved.type).toBe('lucide');
    expect(resolved.src).toBe('Twitter');
  });

  describe('data: URL whitelist (D4)', () => {
    it('accepts whitelisted image MIME types (png/jpg/gif/webp/svg/ico)', () => {
      const allowed = [
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==',
        'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
        'data:image/jpg;base64,/9j/4AAQSkZJRg==',
        'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
        'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBI=',
        'data:image/svg+xml;base64,PHN2Zy8+',
        'data:image/svg+xml;utf8,<svg></svg>',
        'data:image/x-icon;base64,AAABAA==',
        'data:image/vnd.microsoft.icon;base64,AAABAA=='
      ];
      for (const spec of allowed) {
        expect(isAllowedImageDataUrl(spec)).toBe(true);
        const resolved = resolveIcon('https://example.com', spec);
        expect(resolved.type).toBe('custom_url');
        expect(resolved.src).toBe(spec);
      }
    });

    it('rejects non-image data: URLs (data:text/html → favicon fallback)', () => {
      const hostile = 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==';
      expect(isAllowedImageDataUrl(hostile)).toBe(false);
      const resolved = resolveIcon('https://example.com', hostile);
      // NOT rendered as a custom icon: falls back to the favicon pipeline
      expect(resolved.type).toBe('favicon');
      expect(resolved.src).toBe('https://icon.horse/icon/example.com');

      expect(isAllowedImageDataUrl('data:application/javascript;base64,YQ==')).toBe(false);
      expect(isAllowedImageDataUrl('data:text/plain;base64,YQ==')).toBe(false);
      expect(isAllowedImageDataUrl('data:image/bmp;base64,Qk0=')).toBe(false); // not whitelisted
    });

    it('is case-insensitive on scheme and MIME (RFC 2397)', () => {
      expect(isAllowedImageDataUrl('DATA:IMAGE/PNG;base64,iVBORw0KGgo=')).toBe(true);
      const resolved = resolveIcon('https://example.com', 'DATA:TEXT/HTML;base64,PGI+');
      expect(resolved.type).toBe('favicon');
    });

    it('formatSvgToDataUrl passes through whitelisted image data: only', () => {
      const png = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUg==';
      expect(formatSvgToDataUrl(png)).toBe(png);
      // hostile/unknown data: payload → empty source (img onError fallback)
      expect(formatSvgToDataUrl('data:text/html;base64,PHNjcmlwdD48L3NjcmlwdD4=')).toBe('');
      // raw SVG keeps the existing encoding behavior
      expect(formatSvgToDataUrl('<svg viewBox="0 0 1 1"></svg>')).toContain('data:image/svg+xml;base64,');
    });
  });

  describe('favicon provider cache', () => {
    beforeEach(() => localStorage.clear());

    it('defaults to 0 and round-trips a winning candidate index', () => {
      expect(getCachedFaviconIndex('github.com')).toBe(0);
      setCachedFaviconIndex('github.com', 2);
      expect(getCachedFaviconIndex('github.com')).toBe(2);
    });

    it('keeps domains isolated and survives corrupted JSON', () => {
      setCachedFaviconIndex('a.com', 1);
      expect(getCachedFaviconIndex('b.com')).toBe(0);
      localStorage.setItem('startpage_favicon_cache', 'not-json{{{');
      expect(getCachedFaviconIndex('a.com')).toBe(0);
      localStorage.setItem('startpage_favicon_cache', '[1,2]');
      expect(getCachedFaviconIndex('a.com')).toBe(0);
    });
  });
});
