import { useState, useRef, useEffect } from 'preact/hooks';
import type { LinkItem } from '../types/startpage';
import { linksSignal } from '../stores';

export interface ContextMenuState {
  x: number;
  y: number;
  link: LinkItem;
}

/** Custom event name dispatched by link cards (e.g. Shift+F10 / context-menu key) */
export const OPEN_CONTEXT_MENU_EVENT = 'startpage:open-context-menu';

interface OpenContextMenuDetail {
  linkId?: string;
  clientX?: number;
  clientY?: number;
}

/**
 * Context menu state for link cards: right-click opens immediately, touch
 * long-press (~500ms) is the mobile path to edit/remove/move. The synthetic
 * click that follows a long-press must be swallowed so it doesn't navigate.
 */
export function useContextMenu(longPressMs = 500) {
  const [menu, setMenu] = useState<ContextMenuState | null>(null);
  const longPressTimer = useRef<number | null>(null);
  const longPressTriggered = useRef<boolean>(false);

  const openMenu = (x: number, y: number, link: LinkItem) => setMenu({ x, y, link });
  const closeMenu = () => setMenu(null);

  const handleLinkContextMenu = (e: MouseEvent, link: LinkItem) => {
    e.preventDefault();
    openMenu(e.clientX, e.clientY, link);
  };

  const handleLinkTouchStart = (e: TouchEvent, link: LinkItem) => {
    longPressTriggered.current = false;
    const touch = e.touches[0];
    if (!touch) return;
    const { clientX, clientY } = touch;
    longPressTimer.current = window.setTimeout(() => {
      longPressTriggered.current = true;
      openMenu(clientX, clientY, link);
    }, longPressMs);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current !== null) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  /**
   * Returns true once when the click is the synthetic one right after a
   * long-press (flag is consumed on read).
   */
  const shouldSwallowClick = (): boolean => {
    if (longPressTriggered.current) {
      longPressTriggered.current = false;
      return true;
    }
    return false;
  };

  // Cleanup any pending long-press timer on unmount
  useEffect(() => cancelLongPress, []);

  // Keyboard path: link cards (and any other trigger) can request the menu by
  // dispatching a CustomEvent with the target link id and pointer coordinates.
  // The link is resolved against the current store, never trusted by value.
  useEffect(() => {
    const handleOpenRequest = (e: Event) => {
      const detail = (e as CustomEvent<OpenContextMenuDetail>).detail;
      if (!detail || typeof detail.linkId !== 'string') return;
      const link = linksSignal.value.find(l => l.id === detail.linkId);
      if (!link) return;
      const x = typeof detail.clientX === 'number' ? detail.clientX : window.innerWidth / 2;
      const y = typeof detail.clientY === 'number' ? detail.clientY : window.innerHeight / 2;
      openMenu(x, y, link);
    };
    window.addEventListener(OPEN_CONTEXT_MENU_EVENT, handleOpenRequest);
    return () => window.removeEventListener(OPEN_CONTEXT_MENU_EVENT, handleOpenRequest);
  }, []);

  return {
    menu,
    openMenu,
    closeMenu,
    shouldSwallowClick,
    handleLinkContextMenu,
    handleLinkTouchStart,
    cancelLongPress,
  };
}
