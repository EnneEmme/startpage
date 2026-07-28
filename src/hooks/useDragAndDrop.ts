import { useState } from 'preact/hooks';
import { appActions } from '../stores';
import type { LinkItem, CategoryGroup } from '../types/startpage';

/**
 * Owns the whole link/category HTML5 drag-and-drop lifecycle for the grid:
 * dragged item identity, hover targets + drop position, ghost preview,
 * auto-scroll near list edges and the final store mutations.
 */
export function useDragAndDrop(categories: CategoryGroup[], linksListSelector: string) {
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [draggedCategoryName, setDraggedCategoryName] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('below');
  const [justDroppedLinkId, setJustDroppedLinkId] = useState<string | null>(null);

  const handleCategoryDragStart = (e: DragEvent, categoryName: string) => {
    e.stopPropagation();
    setDraggedCategoryName(categoryName);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'CATEGORY', name: categoryName }));
    }
  };

  const handleLinkDragStart = (e: DragEvent, link: LinkItem) => {
    e.stopPropagation();
    setDraggedLinkId(link.id);
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

    setTimeout(() => {
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

    if (dragOverCategory !== categoryName) {
      setDragOverCategory(categoryName);
    }

    // Auto-scroll the column when dragging near its top/bottom edge
    const listContainer = (e.currentTarget as HTMLElement).closest(linksListSelector) as HTMLDivElement | null;
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

      if (dragOverLinkId !== linkId || dropPosition !== newPosition) {
        setDragOverLinkId(linkId);
        setDropPosition(newPosition);
      }
    }
  };

  const handleDragLeave = (e: DragEvent) => {
    const currentTarget = e.currentTarget as HTMLElement;
    const relatedTarget = e.relatedTarget as Node | null;
    if (currentTarget && relatedTarget && currentTarget.contains(relatedTarget)) {
      return; // Ignore dragLeave when moving over internal children
    }

    setDragOverCategory(null);
    setDragOverLinkId(null);
  };

  const handleDrop = (e: DragEvent, targetCategoryName: string, targetLinkIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(null);
    setDragOverLinkId(null);

    if (draggedLinkId) {
      let finalIndex = targetLinkIndex;
      if (typeof targetLinkIndex === 'number' && dropPosition === 'below') {
        finalIndex = targetLinkIndex + 1;
      }

      appActions.moveLink(draggedLinkId, targetCategoryName, finalIndex);

      // Trigger smooth spring drop animation
      setJustDroppedLinkId(draggedLinkId);
      setTimeout(() => setJustDroppedLinkId(null), 350);

      setDraggedLinkId(null);
      return;
    }

    if (draggedCategoryName) {
      const categoryNames = categories.map(c => c.name);
      const fromIdx = categoryNames.indexOf(draggedCategoryName);
      const toIdx = categoryNames.indexOf(targetCategoryName);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        const [dragged] = categoryNames.splice(fromIdx, 1);
        categoryNames.splice(toIdx, 0, dragged);
        appActions.setCategoryOrder(categoryNames);
      }
      setDraggedCategoryName(null);
    }
  };

  const handleDragEnd = () => {
    setDraggedLinkId(null);
    setDraggedCategoryName(null);
    setDragOverCategory(null);
    setDragOverLinkId(null);
  };

  return {
    draggedLinkId,
    draggedCategoryName,
    dragOverCategory,
    dragOverLinkId,
    dropPosition,
    justDroppedLinkId,
    handleCategoryDragStart,
    handleLinkDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
  };
}
