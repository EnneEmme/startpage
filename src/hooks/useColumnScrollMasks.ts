import { useState, useEffect, useRef, useCallback } from 'preact/hooks';

export interface ScrollMask {
  canScrollUp: boolean;
  canScrollDown: boolean;
}

/**
 * Gradient fade-mask state for scrollable column lists, measured through
 * registered refs (no document.querySelectorAll keyed by textContent).
 * Measures post-paint via requestAnimationFrame, on window resize and on
 * every list scroll; calls with identical values bail out (no re-render).
 */
export function useColumnScrollMasks(columnCount: number) {
  const [masks, setMasks] = useState<Record<string, ScrollMask>>({});
  const listRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const measureList = useCallback((columnName: string, el: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = el;
    const canScrollUp = scrollTop > 4;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 4;

    setMasks(prev => {
      const current = prev[columnName];
      if (current?.canScrollUp === canScrollUp && current?.canScrollDown === canScrollDown) {
        return prev;
      }
      return { ...prev, [columnName]: { canScrollUp, canScrollDown } };
    });
  }, []);

  const registerList = useCallback((columnName: string, el: HTMLDivElement | null) => {
    if (el) {
      // Skip re-registration of the same element (idempotent: no state churn)
      if (listRefs.current.get(columnName) === el) return;
      listRefs.current.set(columnName, el);
      // Post-paint measurement (accurate heights on first load)
      requestAnimationFrame(() => measureList(columnName, el));
    } else {
      // Skip unregister when nothing is registered (defensive idempotency)
      if (!listRefs.current.has(columnName)) return;
      listRefs.current.delete(columnName);
      setMasks(prev => {
        if (!(columnName in prev)) return prev;
        const next = { ...prev };
        delete next[columnName];
        return next;
      });
    }
  }, [measureList]);

  const handleListScroll = useCallback((columnName: string, el: HTMLDivElement) => {
    measureList(columnName, el);
  }, [measureList]);

  // Re-measure everything when the column set changes and on window resize
  useEffect(() => {
    const remeasure = () => listRefs.current.forEach((el, name) => measureList(name, el));
    const raf = requestAnimationFrame(remeasure);
    window.addEventListener('resize', remeasure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', remeasure);
    };
  }, [columnCount, measureList]);

  return { masks, registerList, handleListScroll };
}
