import { appActions } from '../stores';
import {
  draggedLinkIdSignal,
  draggedCategoryNameSignal,
  dragOverCategoryIdSignal,
  dragOverLinkIdSignal,
  dropPositionSignal,
  justDroppedLinkIdSignal,
  dragStore,
} from '../stores/dragStore';
import type { LinkItem, CategoryGroup } from '../types/startpage';

/**
 * Owns the whole link/category HTML5 drag-and-drop lifecycle for the grid:
 * dragged item identity, hover targets + drop position, ghost preview,
 * auto-scroll near list edges and the final store mutations.
 *
 * The transient hover identity lives in module-level signals (dragStore), NOT
 * in useState: dragover fires per frame and previously re-rendered the whole
 * grid on every event. Handlers now write to the signals, and each card reads
 * only its own per-card computed boolean — so only the 2 cards involved in an
 * insertion-indicator change re-render per dragover frame. All signal writes
 * go through guarded setters (identical values never notify). `useEffect(() =>
 * () => resetDragState(), [])` additionally clears any stale drag state on
 * unmount; every returned handler closes only over stable module state, so
 * consumers (ColumnGrid/CategoryColumn) can safely be memoized ignoring the
 * `drag` prop/function identity. Event typing stays generic (matches the
 * previous (e: DragEvent, ...) => void surface, compatible with JSX handlers).
 */
export function useDragAndDrop(categories: CategoryGroup[], linksListSelector: string) {
  const handleCategoryDragStart = (e: DragEvent, categoryName: string) => {
    e.stopPropagation();
    dragStore.setDraggedCategoryName(categoryName);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'text/plain',
        JSON.stringify({ type: 'CATEGORY', name: categoryName }),
      );
    }
  };

  const handleLinkDragStart = (e: DragEvent, link: LinkItem) => {
    e.stopPropagation();
    dragStore.setDraggedLinkId(link.id);
    if (!e.dataTransfer) return;

    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'LINK', id: link.id }));

    // Create a 1:1 replica clone of the full link card element for ultra-smooth drag preview
    const targetEl = e.currentTarget as HTMLElement;
    const dragGhost = targetEl.cloneNode(true) as HTMLElement;

    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-9999px';
    dragGhost.style.left = '-9999px';
    dragGhost.style.width = `${targetEl.offsetWidth}px`;
    dragGhost.style.background = 'rgba(20, 20, 23, 0.95)';
    dragGhost.style.backdropFilter = 'blur(16px)';
    dragGhost.style.border = 'none';
    dragGhost.style.borderRadius = 'var(--radius-md)';
    dragGhost.style.boxShadow = '0 12px 32px rgba(0, 0, 0, 0.85)';
    dragGhost.style.pointerEvents = 'none';
    dragGhost.style.transform = 'scale(1.02)';
    dragGhost.style.opacity = '0.98';
    dragGhost.style.zIndex = '9999';

    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, targetEl.offsetWidth / 2, targetEl.offsetHeight / 2);

    // Handle kept so a second dragstart (or teardown before the frame fires,
    // e.g. unmount mid-drag) cannot double-remove or leak the ghost node.
    removeGhostTimer = setTimeout(() => {
      removeGhostTimer = null;
      if (document.body.contains(dragGhost)) {
        document.body.removeChild(dragGhost);
      }
    }, 0);
  };

  const handleDragOver = (e: DragEvent, categoryName: string, linkId?: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    dragStore.setDragOverCategory(categoryName);

    // Auto-scroll the column when dragging near its top/bottom edge
    const listContainer = (e.currentTarget as HTMLElement).closest(
      linksListSelector,
    ) as HTMLDivElement | null;
    if (listContainer) {
      const containerRect = listContainer.getBoundingClientRect();
      const relativePointerY = e.clientY - containerRect.top;
      if (relativePointerY < 35) {
        listContainer.scrollBy({ top: -12, behavior: 'auto' });
      } else if (containerRect.height - relativePointerY < 35) {
        listContainer.scrollBy({ top: 12, behavior: 'auto' });
      }
    }

    if (linkId) {
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const newPosition = relativeY > rect.height * 0.5 ? 'below' : 'above';

      dragStore.setDragOverLink(linkId, newPosition);
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;
    if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
      return; // Ignore dragLeave when moving over internal children
    }

    dragStore.setDragOverCategory(null);
    dragStore.setDragOverLink(null);
  };

  const clearJustDroppedTimer = () => {
    if (justDroppedTimer !== null) {
      clearTimeout(justDroppedTimer);
      justDroppedTimer = null;
    }
  };

  const handleDrop = (e: DragEvent, targetCategoryName: string, targetLinkIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    dragStore.setDragOverCategory(null);
    dragStore.setDragOverLink(null);

    const draggedLinkId = draggedLinkIdSignal.peek();
    if (draggedLinkId) {
      let finalIndex = targetLinkIndex;
      if (typeof targetLinkIndex === 'number' && dropPositionSignal.peek() === 'below') {
        finalIndex = targetLinkIndex + 1;
      }

      appActions.moveLink(draggedLinkId, targetCategoryName, finalIndex);

      // Trigger smooth spring drop animation (previous timer cleared first so
      // back-to-back drops cannot reset each other's animation window).
      dragStore.setJustDroppedLinkId(draggedLinkId);
      clearJustDroppedTimer();
      justDroppedTimer = setTimeout(() => {
        justDroppedTimer = null;
        dragStore.setJustDroppedLinkId(null);
      }, 350);

      dragStore.setDraggedLinkId(null);
      return;
    }

    const draggedCategoryName = draggedCategoryNameSignal.peek();
    if (draggedCategoryName) {
      const categoryNames = categories.map(c => c.name);
      const fromIdx = categoryNames.indexOf(draggedCategoryName);
      const toIdx = categoryNames.indexOf(targetCategoryName);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        const [dragged] = categoryNames.splice(fromIdx, 1);
        if (dragged === undefined) {
          dragStore.setDraggedCategoryName(null);
          return;
        }
        categoryNames.splice(toIdx, 0, dragged);
        appActions.setCategoryOrder(categoryNames);
      }
      dragStore.setDraggedCategoryName(null);
    }
  };

  const handleDragEnd = () => {
    dragStore.setDraggedLinkId(null);
    dragStore.setDraggedCategoryName(null);
    dragStore.setDragOverCategory(null);
    dragStore.setDragOverLink(null);
  };

  // Backward-compat snapshot for existing consumers (plain values, refreshed
  // when the caller re-renders). CRITICAL: these are `peek()` reads — plain
  // `.value` during render would subscribe the calling component (ColumnGrid)
  // to every drag signal and re-render the whole grid per dragover frame,
  // defeating the entire signals migration. Signal-aware components
  // (CategoryColumn/DraggableLinkCard) read the signals directly instead.
  return {
    draggedLinkId: draggedLinkIdSignal.peek(),
    draggedCategoryName: draggedCategoryNameSignal.peek(),
    dragOverCategory: dragOverCategoryIdSignal.peek(),
    dragOverLinkId: dragOverLinkIdSignal.peek(),
    dropPosition: dropPositionSignal.peek(),
    justDroppedLinkId: justDroppedLinkIdSignal.peek(),
    handleCategoryDragStart,
    handleLinkDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}

/** Module-level timers, shared by all hook instances (the grid mounts one). */
let removeGhostTimer: ReturnType<typeof setTimeout> | null = null;
let justDroppedTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Test/teardown helper: cancels pending ghost-removal and just-dropped timers
 * so nothing fires after the owning grid has unmounted.
 */
export const cancelDragAndDropTimers = (): void => {
  if (removeGhostTimer !== null) {
    clearTimeout(removeGhostTimer);
    removeGhostTimer = null;
  }
  if (justDroppedTimer !== null) {
    clearTimeout(justDroppedTimer);
    justDroppedTimer = null;
  }
};
