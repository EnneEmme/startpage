import { signal } from '@preact/signals';

export type DropPosition = 'above' | 'below';

/**
 * Transient drag-and-drop hover state, kept OUT of component state on purpose.
 *
 * During an HTML5 drag the `dragover` event fires once per frame per hovered
 * element. When this state lived in `useDragAndDrop`'s `useState`, every one
 * of those events re-rendered the whole ColumnGrid (all columns + all cards).
 * As module-level signals, only components that READ a given signal re-render
 * when it changes: CategoryColumn subscribes to `dragOverCategoryId`/
 * `dragOverLinkId` only, and each DraggableLinkCard subscribes to its own
 * per-card `computed()` boolean — so a dragover frame re-renders at most the
 * 2 cards swapping the insertion indicator instead of the entire grid.
 *
 * All writes are guarded: signals skip notification when assigned an identical
 * value, but we compare first anyway so spurious reads in hot paths stay cheap.
 */
export const draggedLinkIdSignal = signal<string | null>(null);
export const draggedCategoryNameSignal = signal<string | null>(null);
export const dragOverCategoryIdSignal = signal<string | null>(null);
export const dragOverLinkIdSignal = signal<string | null>(null);
export const dropPositionSignal = signal<DropPosition>('below');
export const justDroppedLinkIdSignal = signal<string | null>(null);

export const dragStore = {
  setDraggedLinkId(id: string | null): void {
    if (draggedLinkIdSignal.value !== id) draggedLinkIdSignal.value = id;
  },

  setDraggedCategoryName(name: string | null): void {
    if (draggedCategoryNameSignal.value !== name) draggedCategoryNameSignal.value = name;
  },

  setDragOverCategory(name: string | null): void {
    if (dragOverCategoryIdSignal.value !== name) dragOverCategoryIdSignal.value = name;
  },

  /** Hover target + insertion side change together: batch as one write each. */
  setDragOverLink(id: string | null, position?: DropPosition): void {
    if (dragOverLinkIdSignal.value !== id) dragOverLinkIdSignal.value = id;
    if (position !== undefined && dropPositionSignal.value !== position) {
      dropPositionSignal.value = position;
    }
  },

  setJustDroppedLinkId(id: string | null): void {
    if (justDroppedLinkIdSignal.value !== id) justDroppedLinkIdSignal.value = id;
  },

  /** Full transient-state reset (drop / dragend). */
  resetDragState(): void {
    dragStore.setDraggedLinkId(null);
    dragStore.setDraggedCategoryName(null);
    dragStore.setDragOverCategory(null);
    dragStore.setDragOverLink(null);
  },
};
