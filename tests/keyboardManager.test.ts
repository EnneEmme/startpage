import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardManager } from '../src/engine/keyboardManager';

describe('KeyboardManager Engine & Advanced Shortcuts', () => {
  let keyboardManager: KeyboardManager;
  const mockHandlers = {
    onOpenSearch: vi.fn(),
    onCloseModals: vi.fn(),
    onOpenCheatsheet: vi.fn(),
    onOpenVisualEdit: vi.fn(),
    onSelectCategoryIndex: vi.fn(),
    onSelectQuickResult: vi.fn(),
    onNavigateSearch: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    keyboardManager = new KeyboardManager(mockHandlers);
  });

  it('detects if event target is an input field', () => {
    const inputEl = document.createElement('input');
    const divEl = document.createElement('div');
    const textareaEl = document.createElement('textarea');

    expect(keyboardManager.isTypingInInput(inputEl)).toBe(true);
    expect(keyboardManager.isTypingInInput(textareaEl)).toBe(true);
    expect(keyboardManager.isTypingInInput(divEl)).toBe(false);
  });

  it('triggers onCloseModals when Escape key is pressed', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    keyboardManager.handleKeyDown(event);
    expect(mockHandlers.onCloseModals).toHaveBeenCalledTimes(1);
  });

  it('triggers onOpenCheatsheet when ?, F1, or Ctrl+/ is pressed', () => {
    const questionEvent = new KeyboardEvent('keydown', { key: '?' });
    keyboardManager.handleKeyDown(questionEvent);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(1);

    const f1Event = new KeyboardEvent('keydown', { key: 'F1' });
    keyboardManager.handleKeyDown(f1Event);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(2);

    const ctrlSlashEvent = new KeyboardEvent('keydown', { key: '/', ctrlKey: true });
    keyboardManager.handleKeyDown(ctrlSlashEvent);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(3);
  });

  it('never intercepts Ctrl/Cmd+1-9 (browser tab switching must keep working)', () => {
    const ctrl1Event = new KeyboardEvent('keydown', { key: '1', code: 'Digit1', ctrlKey: true });
    keyboardManager.handleKeyDown(ctrl1Event);
    expect(mockHandlers.onSelectQuickResult).not.toHaveBeenCalled();
    expect(mockHandlers.onSelectCategoryIndex).not.toHaveBeenCalled();
    expect(ctrl1Event.defaultPrevented).toBe(false);

    const cmd3Event = new KeyboardEvent('keydown', { key: '3', code: 'Digit3', metaKey: true });
    keyboardManager.handleKeyDown(cmd3Event);
    expect(mockHandlers.onSelectQuickResult).not.toHaveBeenCalled();
    expect(cmd3Event.defaultPrevented).toBe(false);
  });

  it('selects category by Shift+digit (layout-independent via e.code)', () => {
    // IT layout: Shift+2 is '"'; the code is still Digit2
    const shift2 = new KeyboardEvent('keydown', { key: '"', code: 'Digit2', shiftKey: true, cancelable: true });
    keyboardManager.handleKeyDown(shift2);
    expect(mockHandlers.onSelectCategoryIndex).toHaveBeenCalledWith(1);
    expect(mockHandlers.onSelectQuickResult).toHaveBeenCalledWith(1);
    expect(shift2.defaultPrevented).toBe(true);
  });

  it('treats a plain digit as type-to-search (queries can start with numbers)', () => {
    const digitEvent = new KeyboardEvent('keydown', { key: '3', code: 'Digit3' });
    keyboardManager.handleKeyDown(digitEvent);
    expect(mockHandlers.onOpenSearch).toHaveBeenCalledWith('3');
    expect(mockHandlers.onSelectCategoryIndex).not.toHaveBeenCalled();
  });

  it('treats a plain n as type-to-search; Shift+N opens the Add-Link modal', () => {
    const nEvent = new KeyboardEvent('keydown', { key: 'n' });
    keyboardManager.handleKeyDown(nEvent);
    expect(mockHandlers.onOpenSearch).toHaveBeenCalledWith('n');
    expect(mockHandlers.onOpenVisualEdit).not.toHaveBeenCalled();

    const shiftNEvent = new KeyboardEvent('keydown', { key: 'N', shiftKey: true });
    keyboardManager.handleKeyDown(shiftNEvent);
    expect(mockHandlers.onOpenVisualEdit).toHaveBeenCalledTimes(1);
    expect(mockHandlers.onOpenSearch).toHaveBeenCalledTimes(1); // unchanged
  });

  it('prevents default on intercepted chars (Firefox quick-find on "/")', () => {
    const slashEvent = new KeyboardEvent('keydown', { key: '/', cancelable: true });
    keyboardManager.handleKeyDown(slashEvent);
    expect(mockHandlers.onOpenSearch).toHaveBeenCalledWith('/');
    expect(slashEvent.defaultPrevented).toBe(true);
  });

  it('triggers onOpenSearch with typed character when outside input', () => {
    const charEvent = new KeyboardEvent('keydown', { key: 'g' });
    keyboardManager.handleKeyDown(charEvent);
    expect(mockHandlers.onOpenSearch).toHaveBeenCalledWith('g');
  });

  it('ignores modifier key combinations like Ctrl+C or Cmd+V for search auto-open', () => {
    const ctrlC = new KeyboardEvent('keydown', { key: 'c', ctrlKey: true });
    keyboardManager.handleKeyDown(ctrlC);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();

    const cmdV = new KeyboardEvent('keydown', { key: 'v', metaKey: true });
    keyboardManager.handleKeyDown(cmdV);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();
  });

  it('handles navigation keys (ArrowUp, ArrowDown, Enter) when inside input', () => {
    const inputEl = document.createElement('input');
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
    Object.defineProperty(downEvent, 'target', { value: inputEl });

    keyboardManager.handleKeyDown(downEvent);
    expect(mockHandlers.onNavigateSearch).toHaveBeenCalledWith('down');

    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
    Object.defineProperty(upEvent, 'target', { value: inputEl });
    keyboardManager.handleKeyDown(upEvent);
    expect(mockHandlers.onNavigateSearch).toHaveBeenCalledWith('up');

    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
    Object.defineProperty(enterEvent, 'target', { value: inputEl });
    keyboardManager.handleKeyDown(enterEvent);
    expect(mockHandlers.onNavigateSearch).toHaveBeenCalledWith('enter');
  });

  it('attaches and detaches window event listener safely', () => {
    const spyAdd = vi.spyOn(window, 'addEventListener');
    const spyRemove = vi.spyOn(window, 'removeEventListener');

    keyboardManager.attach();
    expect(spyAdd).toHaveBeenCalledWith('keydown', expect.any(Function));

    keyboardManager.detach();
    expect(spyRemove).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
