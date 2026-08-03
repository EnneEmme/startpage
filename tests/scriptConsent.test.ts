import { describe, it, expect, beforeEach } from 'vitest';
import {
  clearConsents,
  grantConsent,
  hasConsent,
  hashScriptIdentity,
} from '../src/engine/scriptConsent';
import type { LinkItem } from '../src/types/startpage';

const STORAGE_KEY = 'startpage_script_consents';

const scriptLink = (id: string, scriptContent: string): LinkItem => ({
  id,
  title: `Script ${id}`,
  url: '',
  isScript: true,
  scriptContent,
  aliases: [],
  category: 'Tools',
});

const bookmarkletLink = (id: string, url: string): LinkItem => ({
  id,
  title: `Bookmarklet ${id}`,
  url,
  aliases: [],
  category: 'Tools',
});

describe('scriptConsent Engine (D1)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hasConsent is false for scripts never confirmed', () => {
    expect(hasConsent(scriptLink('a', 'alert(1)'))).toBe(false);
  });

  it('grantConsent persists under startpage_script_consents and round-trips', () => {
    const link = scriptLink('a', 'alert(1)');
    grantConsent(link);
    expect(hasConsent(link)).toBe(true);

    const raw = localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const map = JSON.parse(raw!) as Record<string, string>;
    expect(Object.keys(map)).toEqual(['a']);
    expect(map['a']).toMatch(/^djb2:/);
  });

  it('any edit to the script body invalidates the consent', () => {
    const link = scriptLink('a', 'console.log(1)');
    grantConsent(link);
    expect(hasConsent(link)).toBe(true);

    expect(hasConsent(scriptLink('a', 'console.log(2)'))).toBe(false);
    expect(hasConsent(scriptLink('a', 'console.log(1);'))).toBe(false);
    // Edge-documented: surrounding whitespace is normalized (trim) before
    // hashing, so it does NOT invalidate — semantically the same script.
    expect(hasConsent(scriptLink('a', '  console.log(1)  '))).toBe(true);
  });

  it('bookmarklet identity comes from url when scriptContent is absent', () => {
    const link = bookmarkletLink('b', 'javascript:alert(1)');
    grantConsent(link);
    expect(hasConsent(link)).toBe(true);
    expect(hasConsent(bookmarkletLink('b', 'javascript:alert(2)'))).toBe(false);
    expect(hasConsent(bookmarkletLink('c', 'javascript:alert(1)'))).toBe(false); // other id
  });

  it('consents are isolated per link id', () => {
    grantConsent(scriptLink('a', 'alert(1)'));
    expect(hasConsent(scriptLink('b', 'alert(1)'))).toBe(false);
  });

  it('clearConsents drops every stored consent', () => {
    grantConsent(scriptLink('a', 'alert(1)'));
    grantConsent(scriptLink('b', 'alert(2)'));
    clearConsents();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(hasConsent(scriptLink('a', 'alert(1)'))).toBe(false);
    expect(hasConsent(scriptLink('b', 'alert(2)'))).toBe(false);
  });

  it('survives corrupted or wrong-shaped storage (fail closed: re-ask)', () => {
    const link = scriptLink('a', 'alert(1)');
    grantConsent(link);

    localStorage.setItem(STORAGE_KEY, 'CORRUPTED_{{{JSON');
    expect(hasConsent(link)).toBe(false);

    localStorage.setItem(STORAGE_KEY, '[1,2,3]');
    expect(hasConsent(link)).toBe(false);

    // grantConsent recovers by rewriting a valid map from scratch
    grantConsent(link);
    expect(hasConsent(link)).toBe(true);
  });

  it('hashScriptIdentity is deterministic and length-sensitive', () => {
    expect(hashScriptIdentity('abc')).toBe(hashScriptIdentity('abc'));
    expect(hashScriptIdentity('abc')).not.toBe(hashScriptIdentity('abd'));
    expect(hashScriptIdentity('abc')).toContain(':3');
    expect(hashScriptIdentity('')).toContain(':0');
  });
});
