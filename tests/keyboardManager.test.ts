import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KeyboardManager } from '../src/engine/keyboardManager';

describe('KeyboardManager Engine & Advanced Shortcuts', () => {
  let keyboardManager: KeyboardManager;
  const mockHandlers = {
    onOpenSearch: vi.fn(),
    onOpenCheatsheet: vi.fn(),
    onOpenVisualEdit: vi.fn(),
    onOpenSettings: vi.fn(),
    onSelectCategoryIndex: vi.fn(),
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

  it('does not handle Escape (each UI layer owns its own Escape)', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    keyboardManager.handleKeyDown(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('still ignores Escape while a modal is active (Modal owns the single close path)', () => {
    // Regression guard (P7/R3): with modalActive the global manager must not
    // touch Escape at all — no preventDefault, no handler, no double-close.
    keyboardManager.setModalActive(true);
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true });
    keyboardManager.handleKeyDown(event);
    expect(event.defaultPrevented).toBe(false);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();
    expect(mockHandlers.onOpenCheatsheet).not.toHaveBeenCalled();
    expect(mockHandlers.onOpenSettings).not.toHaveBeenCalled();
    expect(mockHandlers.onOpenVisualEdit).not.toHaveBeenCalled();
    expect(mockHandlers.onSelectCategoryIndex).not.toHaveBeenCalled();
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
    expect(mockHandlers.onSelectCategoryIndex).not.toHaveBeenCalled();
    expect(ctrl1Event.defaultPrevented).toBe(false);

    const cmd3Event = new KeyboardEvent('keydown', { key: '3', code: 'Digit3', metaKey: true });
    keyboardManager.handleKeyDown(cmd3Event);
    expect(cmd3Event.defaultPrevented).toBe(false);
  });

  it('selects category by Shift+digit (layout-independent via e.code)', () => {
    // IT layout: Shift+2 is '"'; the code is still Digit2
    const shift2 = new KeyboardEvent('keydown', {
      key: '"',
      code: 'Digit2',
      shiftKey: true,
      cancelable: true,
    });
    keyboardManager.handleKeyDown(shift2);
    expect(mockHandlers.onSelectCategoryIndex).toHaveBeenCalledWith(1);
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

  it('leaves navigation keys native inside inputs (SearchModal owns its keydown)', () => {
    const inputEl = document.createElement('input');
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true });
    Object.defineProperty(downEvent, 'target', { value: inputEl });

    keyboardManager.handleKeyDown(downEvent);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();
    expect(downEvent.defaultPrevented).toBe(false);

    const upEvent = new KeyboardEvent('keydown', { key: 'ArrowUp', cancelable: true });
    Object.defineProperty(upEvent, 'target', { value: inputEl });
    keyboardManager.handleKeyDown(upEvent);
    expect(upEvent.defaultPrevented).toBe(false);
  });

  it('leaves Enter native in inputs so forms can submit', () => {
    const inputEl = document.createElement('input');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    Object.defineProperty(enterEvent, 'target', { value: inputEl });

    keyboardManager.handleKeyDown(enterEvent);
    expect(enterEvent.defaultPrevented).toBe(false);
  });

  it('never intercepts keys inside a TEXTAREA (newlines/caret must work)', () => {
    const textareaEl = document.createElement('textarea');
    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    Object.defineProperty(enterEvent, 'target', { value: textareaEl });

    keyboardManager.handleKeyDown(enterEvent);
    expect(enterEvent.defaultPrevented).toBe(false);

    const gEvent = new KeyboardEvent('keydown', { key: 'g', cancelable: true });
    Object.defineProperty(gEvent, 'target', { value: textareaEl });
    keyboardManager.handleKeyDown(gEvent);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();
  });

  it('suspends page shortcuts while a modal is active, except modal toggle keys', () => {
    keyboardManager.setModalActive(true);

    // type-to-search char must NOT open search behind a modal
    const charEvent = new KeyboardEvent('keydown', { key: 'g' });
    keyboardManager.handleKeyDown(charEvent);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();

    // Shift+digit category jump must NOT fire behind a modal
    const shift2 = new KeyboardEvent('keydown', { key: '"', code: 'Digit2', shiftKey: true });
    keyboardManager.handleKeyDown(shift2);
    expect(mockHandlers.onSelectCategoryIndex).not.toHaveBeenCalled();

    // modal toggle keys still reach handlers (app decides stacking vs toggle)
    const questionEvent = new KeyboardEvent('keydown', { key: '?' });
    keyboardManager.handleKeyDown(questionEvent);
    expect(mockHandlers.onOpenCheatsheet).toHaveBeenCalledTimes(1);

    const commaEvent = new KeyboardEvent('keydown', { key: ',', cancelable: true });
    keyboardManager.handleKeyDown(commaEvent);
    // comma is a toggle key: it passes the gate and reaches its handler
    expect(mockHandlers.onOpenSettings).toHaveBeenCalledTimes(1);
    expect(commaEvent.defaultPrevented).toBe(true);
  });

  it('typing in an input inside a modal is never treated as a page shortcut', () => {
    keyboardManager.setModalActive(true);
    const inputEl = document.createElement('input');
    const charEvent = new KeyboardEvent('keydown', { key: 'g' });
    Object.defineProperty(charEvent, 'target', { value: inputEl });

    keyboardManager.handleKeyDown(charEvent);
    expect(mockHandlers.onOpenSearch).not.toHaveBeenCalled();
    expect(charEvent.defaultPrevented).toBe(false);
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
