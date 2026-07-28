import { useState, useRef, useEffect } from 'preact/hooks';
import type { LinkItem } from '../types/startpage';

export interface ContextMenuState {
  x: number;
  y: number;
  link: LinkItem;
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
