import { h } from 'preact';
import { useState } from 'preact/hooks';
import { CategoryGroup, LinkItem } from '../types/startpage';
import { resolveDynamicUrl } from '../engine/dynamicEvaluator';
import { rankStorage } from '../engine/rankStorage';
import { dataStore } from '../engine/dataStore';
import { LinkIcon } from './LinkIcon';
import { ContextMenu } from './ContextMenu';
import styles from './ColumnGrid.module.css';

interface ColumnGridProps {
  categories: CategoryGroup[];
  highlightedCategory?: string | null;
  onLinkClick?: (link: LinkItem) => void;
  onEditLink?: (link: LinkItem) => void;
  onConfigChanged?: () => void;
}

export const ColumnGrid = ({
  categories,
  highlightedCategory,
  onLinkClick,
  onEditLink,
  onConfigChanged
}: ColumnGridProps) => {
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    link: LinkItem;
  } | null>(null);

  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [draggedCategoryName, setDraggedCategoryName] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);

  const handleLinkClick = (e: MouseEvent, link: LinkItem) => {
    if (draggedLinkId) {
      e.preventDefault();
      return;
    }

    rankStorage.recordUsage(link.id);

    if (onLinkClick) {
      onLinkClick(link);
    }

    const targetUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
    if (targetUrl) {
      window.location.href = targetUrl;
    }
  };

  const handleContextMenu = (e: MouseEvent, link: LinkItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuState({
      x: e.clientX,
      y: e.clientY,
      link
    });
  };

  const handleRemoveLink = (linkId: string) => {
    dataStore.removeLink(linkId);
    if (onConfigChanged) {
      onConfigChanged();
    }
  };

  /* --------------------------------------------------------------------------
     Fluid Drag & Drop Handlers (Columns & Links)
     -------------------------------------------------------------------------- */
  const handleColumnDragStart = (e: DragEvent, categoryName: string) => {
    setDraggedCategoryName(categoryName);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'COLUMN', name: categoryName }));
    }
  };

  const handleLinkDragStart = (e: DragEvent, link: LinkItem) => {
    e.stopPropagation();
    setDraggedLinkId(link.id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'LINK', id: link.id }));
    }
  };

  const handleDragOver = (e: DragEvent, categoryName: string, linkId?: string) => {
    e.preventDefault();
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }
    if (dragOverCategory !== categoryName) {
      setDragOverCategory(categoryName);
    }
    if (linkId && dragOverLinkId !== linkId) {
      setDragOverLinkId(linkId);
    }
  };

  const handleDragLeave = () => {
    setDragOverCategory(null);
    setDragOverLinkId(null);
  };

  const handleDrop = (e: DragEvent, targetCategoryName: string, targetLinkIndex?: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverCategory(null);
    setDragOverLinkId(null);

    if (draggedLinkId) {
      dataStore.moveLink(draggedLinkId, targetCategoryName, targetLinkIndex);
      setDraggedLinkId(null);
      if (onConfigChanged) onConfigChanged();
      return;
    }

    if (draggedCategoryName) {
      const categoryNames = categories.map(c => c.name);
      const fromIdx = categoryNames.indexOf(draggedCategoryName);
      const toIdx = categoryNames.indexOf(targetCategoryName);

      if (fromIdx !== -1 && toIdx !== -1 && fromIdx !== toIdx) {
        const [dragged] = categoryNames.splice(fromIdx, 1);
        categoryNames.splice(toIdx, 0, dragged);
        dataStore.setCategoryOrder(categoryNames);
        if (onConfigChanged) onConfigChanged();
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

  return (
    <div class={styles.gridContainer}>
      {categories.map(cat => {
        const columnId = `column-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
        const isHighlighted = highlightedCategory === cat.name;
        const isDragOver = dragOverCategory === cat.name && !dragOverLinkId;

        return (
          <div
            key={cat.name}
            id={columnId}
            class={`${styles.columnCard} ${isHighlighted ? styles.highlightPulse : ''} ${isDragOver ? styles.dragOver : ''}`}
            onDragOver={e => handleDragOver(e, cat.name)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, cat.name)}
          >
            {/* Draggable Column Header (Clean - No Link Count Badge) */}
            <div
              class={styles.columnHeader}
              draggable={true}
              onDragStart={e => handleColumnDragStart(e, cat.name)}
              onDragEnd={handleDragEnd}
              title="Drag to reorder column"
            >
              <h2 class={styles.columnTitle}>{cat.name}</h2>
            </div>

            <div class={styles.linksList}>
              {cat.links.map((link, linkIdx) => {
                const displayUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
                const mainAlias = link.aliases && link.aliases.length > 0 ? link.aliases[0] : null;
                const isItemDragOver = dragOverLinkId === link.id;
                const isBeingDragged = draggedLinkId === link.id;

                return (
                  <div
                    key={link.id}
                    class={`${styles.linkCardDragWrapper} ${isItemDragOver ? styles.dragOverLink : ''} ${isBeingDragged ? styles.linkBeingDragged : ''}`}
                    draggable={true}
                    onDragStart={e => handleLinkDragStart(e, link)}
                    onDragOver={e => handleDragOver(e, cat.name, link.id)}
                    onDrop={e => handleDrop(e, cat.name, linkIdx)}
                    onDragEnd={handleDragEnd}
                    title="Drag to reorder link"
                  >
                    <a
                      href={displayUrl || '#'}
                      class={styles.linkRow}
                      draggable={false}
                      onClick={e => handleLinkClick(e, link)}
                      onContextMenu={e => handleContextMenu(e, link)}
                    >
                      <div class={styles.iconContainer}>
                        <LinkIcon
                          url={displayUrl || 'https://example.com'}
                          iconSpec={link.icon}
                          title={link.title}
                          size={18}
                        />
                      </div>

                      <div class={styles.linkInfo}>
                        <span class={styles.linkTitle}>{link.title}</span>
                      </div>

                      {mainAlias && (
                        <span class={styles.aliasBadge}>{mainAlias}</span>
                      )}
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          link={contextMenuState.link}
          onClose={() => setContextMenuState(null)}
          onEdit={link => {
            if (onEditLink) onEditLink(link);
          }}
          onRemove={handleRemoveLink}
          onConfigChanged={() => {
            if (onConfigChanged) onConfigChanged();
          }}
        />
      )}
    </div>
  );
};
