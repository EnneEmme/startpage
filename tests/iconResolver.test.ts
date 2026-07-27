import { describe, it, expect } from 'vitest';
import { extractDomain, extractOrigin, getFaviconCandidates, getFaviconUrl, resolveIcon } from '../src/engine/iconResolver';

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

  it('returns multi-tier candidate list for sub-service URLs', () => {
    const candidates = getFaviconCandidates('https://mail.google.com/mail/u/0/#inbox');
    expect(candidates).toHaveLength(6);
    expect(candidates[0]).toBe('https://www.google.com/s2/favicons?domain=https://mail.google.com&sz=128');
    expect(candidates[1]).toBe('https://www.google.com/s2/favicons?domain=mail.google.com&sz=128');
    expect(candidates[2]).toBe('https://icon.horse/icon/mail.google.com');
    expect(candidates[3]).toBe('https://icons.duckduckgo.com/ip3/mail.google.com.ico');
    expect(candidates[4]).toBe('https://mail.google.com/favicon.ico');
    expect(candidates[5]).toBe('https://mail.google.com/favicon.ico');
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
});
