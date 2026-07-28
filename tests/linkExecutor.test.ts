import { describe, it, expect, vi } from 'vitest';
import { executeLink, isBookmarkletOrScript, extractScriptCode } from '../src/engine/linkExecutor';
import type { LinkItem } from '../src/types/startpage';

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
});
