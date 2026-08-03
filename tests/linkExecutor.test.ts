import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeLink, isBookmarkletOrScript, extractScriptCode, setScriptConfirmHandler } from '../src/engine/linkExecutor';
import { clearConsents, hasConsent } from '../src/engine/scriptConsent';
import type { LinkItem } from '../src/types/startpage';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));

describe('LinkExecutor Engine', () => {
  it('identifies bookmarklet and script links correctly', () => {
    const normalLink: LinkItem = { id: '1', title: 'Google', url: 'https://google.com', aliases: [], category: 'Main' };
    const scriptLink: LinkItem = { id: '2', title: 'Alert', url: 'javascript:alert(1)', aliases: [], category: 'Tools' };
    const flagScriptLink: LinkItem = { id: '3', title: 'Snippet', url: '', isScript: true, scriptContent: 'console.log(1)', aliases: [], category: 'Tools' };

    expect(isBookmarkletOrScript(normalLink)).toBe(false);
    expect(isBookmarkletOrScript(scriptLink)).toBe(true);
    expect(isBookmarkletOrScript(flagScriptLink)).toBe(true);
  });

  it('extracts script code properly', () => {
    const scriptLink: LinkItem = { id: '2', title: 'Alert', url: 'javascript:alert("Hello")', aliases: [], category: 'Tools' };
    const flagScriptLink: LinkItem = { id: '3', title: 'Snippet', url: '', isScript: true, scriptContent: 'console.log("Test")', aliases: [], category: 'Tools' };

    expect(extractScriptCode(scriptLink)).toBe('alert("Hello")');
    expect(extractScriptCode(flagScriptLink)).toBe('console.log("Test")');
  });

  it('executes custom JS script functions when executeLink is called', () => {
    let dummyValue = 0;
    // Set window dummy function
    (globalThis as any).testGlobalScriptFn = () => { dummyValue = 42; };

    const scriptLink: LinkItem = {
      id: 'script_1',
      title: 'Run Test Function',
      url: '',
      isScript: true,
      scriptContent: 'globalThis.testGlobalScriptFn()',
      aliases: [],
      category: 'Tools'
    };

    executeLink(scriptLink);
    expect(dummyValue).toBe(42);
  });

  it('resolves dynamic unimib_orari and unimib_esami URLs properly', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const unimibOrariLink: LinkItem = {
      id: 'unimib_1',
      title: 'Unimib Orari',
      url: '',
      dynamicUrlRule: 'unimib_orari',
      aliases: [],
      category: 'University'
    };

    executeLink(unimibOrariLink, '_blank');
    expect(windowSpy).toHaveBeenCalledWith(expect.stringContaining('view=easycourse'), '_blank', 'noopener,noreferrer');

    windowSpy.mockRestore();
  });

  it('returns true when navigation is handled, false when there is nothing to do', () => {
    const windowSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const normalLink: LinkItem = { id: '10', title: 'GitHub', url: 'https://github.com', aliases: [], category: 'Main' };
    const emptyLink: LinkItem = { id: '11', title: 'Empty', url: '', aliases: [], category: 'Main' };

    expect(executeLink(normalLink, '_blank')).toBe(true);
    expect(windowSpy).toHaveBeenCalledWith('https://github.com', '_blank', 'noopener,noreferrer');

    expect(executeLink(emptyLink)).toBe(false);
    expect(executeLink(undefined as unknown as LinkItem)).toBe(false);

    windowSpy.mockRestore();
  });

  describe('script security (D1)', () => {
    beforeEach(() => {
      localStorage.clear();
      clearConsents();
      setScriptConfirmHandler(null);
    });

    it('script errors return false and never fall back to javascript: navigation', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const badLink: LinkItem = {
        id: 'bad_1',
        title: 'Bad Script',
        url: '',
        isScript: true,
        scriptContent: 'throw new Error("boom")',
        aliases: [],
        category: 'Tools'
      };

      expect(executeLink(badLink)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('[LinkExecutor] Script execution error:', expect.any(Error));
      // The old window.location.href='javascript:...' fallback is gone for good
      const logged = errorSpy.mock.calls.map(call => String(call[0])).join(' ');
      expect(logged).not.toContain('Fallback');
      errorSpy.mockRestore();
    });

    it('executes scripts without a consent handler (pure-engine retrocompat)', () => {
      let dummyValue = 0;
      (globalThis as Record<string, unknown>).__secNoHandlerRun = () => { dummyValue = 7; };
      const link: LinkItem = {
        id: 'nohandler_1', title: 'No Handler', url: '', isScript: true,
        scriptContent: 'globalThis.__secNoHandlerRun()', aliases: [], category: 'Tools'
      };

      expect(executeLink(link)).toBe(true);
      expect(dummyValue).toBe(7);
    });

    it('denied consent prevents execution and persists nothing', async () => {
      let ran = 0;
      (globalThis as Record<string, unknown>).__secDenyRun = () => { ran++; };
      const handler = vi.fn(() => Promise.resolve(false));
      setScriptConfirmHandler(handler);
      const link: LinkItem = {
        id: 'deny_1', title: 'Deny Me', url: '', isScript: true,
        scriptContent: 'globalThis.__secDenyRun()', aliases: [], category: 'Tools'
      };

      // Click owned by the consent flow → true even though nothing ran (yet)
      expect(executeLink(link)).toBe(true);
      await tick();
      expect(handler).toHaveBeenCalledTimes(1);
      expect(ran).toBe(0);
      expect(hasConsent(link)).toBe(false);
    });

    it('granted consent executes and persists (no re-prompt on next click)', async () => {
      let ran = 0;
      (globalThis as Record<string, unknown>).__secGrantRun = () => { ran++; };
      const handler = vi.fn(() => Promise.resolve(true));
      setScriptConfirmHandler(handler);
      const link: LinkItem = {
        id: 'grant_1', title: 'Grant Me', url: '', isScript: true,
        scriptContent: 'globalThis.__secGrantRun()', aliases: [], category: 'Tools'
      };

      executeLink(link);
      await tick();
      expect(ran).toBe(1);
      expect(hasConsent(link)).toBe(true);
      expect(localStorage.getItem('startpage_script_consents')).toContain('grant_1');

      // Second click: persisted consent → direct execution, handler untouched
      expect(executeLink(link)).toBe(true);
      expect(ran).toBe(2);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('editing the script body invalidates the persisted consent (re-ask)', async () => {
      let ran = 0;
      (globalThis as Record<string, unknown>).__secEditRun = () => { ran++; };
      const handler = vi.fn(() => Promise.resolve(true));
      setScriptConfirmHandler(handler);
      const link: LinkItem = {
        id: 'edit_1', title: 'Edit Me', url: '', isScript: true,
        scriptContent: 'globalThis.__secEditRun()', aliases: [], category: 'Tools'
      };

      executeLink(link);
      await tick();
      expect(ran).toBe(1);

      // Same id, tampered body → consent no longer valid → prompt again
      const edited: LinkItem = { ...link, scriptContent: 'globalThis.__secEditRun(); globalThis.__secEditRun();' };
      expect(hasConsent(edited)).toBe(false);
      executeLink(edited);
      await tick();
      expect(handler).toHaveBeenCalledTimes(2);
      expect(ran).toBe(3);
    });

    it('builtin default scripts (unimib_orari/esami) run with implicit consent', () => {
      let ran = 0;
      (globalThis as Record<string, unknown>).__secBuiltinRun = () => { ran++; };
      const handler = vi.fn(() => Promise.resolve(true));
      setScriptConfirmHandler(handler);
      const builtin: LinkItem = {
        id: 'unimib_orari', title: 'Orari', url: '', isScript: true,
        scriptContent: 'globalThis.__secBuiltinRun()', aliases: [], category: 'School'
      };

      expect(executeLink(builtin)).toBe(true);
      expect(ran).toBe(1);
      expect(handler).not.toHaveBeenCalled();
    });

    it('confirm handler rejection fails closed (no execution, no crash)', async () => {
      let ran = 0;
      (globalThis as Record<string, unknown>).__secRejectRun = () => { ran++; };
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      setScriptConfirmHandler(() => Promise.reject(new Error('dialog exploded')));
      const link: LinkItem = {
        id: 'reject_1', title: 'Reject', url: '', isScript: true,
        scriptContent: 'globalThis.__secRejectRun()', aliases: [], category: 'Tools'
      };

      expect(executeLink(link)).toBe(true);
      await tick();
      expect(ran).toBe(0);
      expect(hasConsent(link)).toBe(false);
      expect(errorSpy).toHaveBeenCalledWith('[LinkExecutor] Script confirm handler error:', expect.any(Error));
      errorSpy.mockRestore();
    });
  });
});
