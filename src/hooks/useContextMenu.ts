import { useState } from 'preact/hooks';
import { LinkItem, CategoryGroup } from '../types/startpage';

interface ContextMenuPos {
  x: number;
  y: number;
}

export function useContextMenu() {
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState<ContextMenuPos>({ x: 0, y: 0 });
  const [targetLink, setTargetLink] = useState<LinkItem | null>(null);
  const [targetCategory, setTargetCategory] = useState<CategoryGroup | null>(null);

  const openContextMenu = (
    x: number,
    y: number,
    link: LinkItem | null = null,
    category: CategoryGroup | null = null
  ) => {
    setContextMenuPos({ x, y });
    setTargetLink(link);
    setTargetCategory(category);
    setContextMenuVisible(true);
  };

  const closeContextMenu = () => {
    setContextMenuVisible(false);
    setTargetLink(null);
    setTargetCategory(null);
  };

  return {
    contextMenuVisible,
    contextMenuPos,
    targetLink,
    targetCategory,
    openContextMenu,
    closeContextMenu,
  };
}
