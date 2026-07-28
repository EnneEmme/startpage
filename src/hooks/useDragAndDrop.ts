import { useState } from 'preact/hooks';
import { LinkItem, CategoryGroup } from '../types/startpage';

export function useDragAndDrop() {
  const [draggingCategory, setDraggingCategory] = useState<CategoryGroup | null>(null);
  const [draggingLink, setDraggingLink] = useState<LinkItem | null>(null);
  const [dropIndicator, setDropIndicator] = useState<string | null>(null);

  const handleDragStart = (type: 'category' | 'link', item: any) => {
    if (type === 'category') setDraggingCategory(item);
    if (type === 'link') setDraggingLink(item);
  };

  const handleDragEnd = () => {
    setDraggingCategory(null);
    setDraggingLink(null);
    setDropIndicator(null);
  };

  return {
    draggingCategory,
    setDraggingCategory,
    draggingLink,
    setDraggingLink,
    dropIndicator,
    setDropIndicator,
    handleDragStart,
    handleDragEnd,
  };
}
