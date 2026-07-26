import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { ChevronDown } from 'lucide-preact';
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

  const [editingCategory, setEditingCategory] = useState<{ originalName: string; text: string } | null>(null);
  const [scrollStates, setScrollStates] = useState<Record<string, { canScrollTop: boolean; canScrollBottom: boolean }>>({});
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [draggedCategoryName, setDraggedCategoryName] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('above');

  // Page-wide scroll indicator state
  const [showPageDownCue, setShowPageDownCue] = useState(false);

  useEffect(() => {
    const checkPageScrollability = () => {
      const isScrolledNearTop = window.scrollY < 40;
      const isPageScrollable = document.documentElement.scrollHeight > window.innerHeight + 100;
      setShowPageDownCue(isScrolledNearTop && isPageScrollable);
    };

    checkPageScrollability();
    window.addEventListener('scroll', checkPageScrollability);
    window.addEventListener('resize', checkPageScrollability);

    return () => {
      window.removeEventListener('scroll', checkPageScrollability);
      window.removeEventListener('resize', checkPageScrollability);
    };
  }, [categories]);

  const handleScrollPageDown = () => {
    window.scrollBy({ top: window.innerHeight * 0.7, behavior: 'smooth' });
  };

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

  const handleHeaderContextMenu = (e: MouseEvent, categoryName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingCategory({
      originalName: categoryName,
      text: categoryName
    });
  };

  const handleFinishRenameCategory = () => {
    if (editingCategory && editingCategory.text.trim()) {
      dataStore.renameCategory(editingCategory.originalName, editingCategory.text.trim());
      if (onConfigChanged) onConfigChanged();
    }
    setEditingCategory(null);
  };

  const handleRenameKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleFinishRenameCategory();
    } else if (e.key === 'Escape') {
      setEditingCategory(null);
    }
  };

  const handleRemoveLink = (linkId: string) => {
    dataStore.removeLink(linkId);
    if (onConfigChanged) {
      onConfigChanged();
    }
  };

  const handleScroll = (e: Event, categoryName: string) => {
    const target = e.target as HTMLDivElement;
    const canScrollTop = target.scrollTop > 5;
    const canScrollBottom = target.scrollTop + target.clientHeight < target.scrollHeight - 8;

    setScrollStates(prev => {
      const current = prev[categoryName];
      if (current?.canScrollTop === canScrollTop && current?.canScrollBottom === canScrollBottom) {
        return prev;
      }
      return {
        ...prev,
        [categoryName]: { canScrollTop, canScrollBottom }
      };
    });
  };

  const handleWheel = (e: WheelEvent) => {
    const target = e.currentTarget as HTMLDivElement;
    const isAtTop = target.scrollTop <= 0 && e.deltaY < 0;
    const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 1 && e.deltaY > 0;

    if (isAtTop || isAtBottom) {
      e.preventDefault();
    }
  };

  /* --------------------------------------------------------------------------
     Fluid & Premium UI/UX Drag & Drop Handlers
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

      const dragGhost = document.createElement('div');
      dragGhost.style.position = 'absolute';
      dragGhost.style.top = '-9999px';
      dragGhost.style.padding = '6px 14px';
      dragGhost.style.background = '#18181b';
      dragGhost.style.border = '1px solid #10b981';
      dragGhost.style.borderRadius = '8px';
      dragGhost.style.color = '#f4f4f5';
      dragGhost.style.fontSize = '13px';
      dragGhost.style.fontWeight = '500';
      dragGhost.style.boxShadow = '0 10px 25px rgba(0,0,0,0.5), 0 0 15px rgba(16,185,129,0.3)';
      dragGhost.innerText = `Moving ${link.title}`;
      document.body.appendChild(dragGhost);
      e.dataTransfer.setDragImage(dragGhost, 20, 20);

      setTimeout(() => document.body.removeChild(dragGhost), 0);
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

    const listContainer = (e.currentTarget as HTMLElement).closest(`.${styles.linksList}`) as HTMLDivElement;
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
      if (dragOverLinkId !== linkId) {
        setDragOverLinkId(linkId);
      }
      const targetElement = e.currentTarget as HTMLElement;
      const rect = targetElement.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const isBottomHalf = relativeY > rect.height / 2;
      setDropPosition(isBottomHalf ? 'below' : 'above');
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
      let finalIndex = targetLinkIndex;
      if (typeof targetLinkIndex === 'number' && dropPosition === 'below') {
        finalIndex = targetLinkIndex + 1;
      }

      dataStore.moveLink(draggedLinkId, targetCategoryName, finalIndex);
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
        const isEditingThisHeader = editingCategory?.originalName === cat.name;

        const state = scrollStates[cat.name] || {
          canScrollTop: false,
          canScrollBottom: cat.links.length > 15
        };

        let fadeClass = '';
        if (state.canScrollTop && state.canScrollBottom) {
          fadeClass = styles.fadeBoth;
        } else if (state.canScrollTop && !state.canScrollBottom) {
          fadeClass = styles.fadeTop;
        } else if (!state.canScrollTop && state.canScrollBottom) {
          fadeClass = styles.fadeBottom;
        }

        return (
          <div
            key={cat.name}
            id={columnId}
            class={`${styles.columnCard} ${isHighlighted ? styles.highlightPulse : ''} ${isDragOver ? styles.dragOver : ''}`}
            onDragOver={e => handleDragOver(e, cat.name)}
            onDragLeave={handleDragLeave}
            onDrop={e => handleDrop(e, cat.name)}
          >
            {/* Draggable Column Header with Right-Click Inline Rename */}
            <div
              class={styles.columnHeader}
              draggable={!isEditingThisHeader}
              onDragStart={e => handleColumnDragStart(e, cat.name)}
              onDragEnd={handleDragEnd}
              onContextMenu={e => handleHeaderContextMenu(e, cat.name)}
              title="Drag to reorder / Right-click to rename"
            >
              {isEditingThisHeader ? (
                <input
                  class={styles.inlineRenameInput}
                  value={editingCategory.text}
                  autoFocus
                  onInput={e => {
                    const val = (e.target as HTMLInputElement).value;
                    setEditingCategory({ originalName: cat.name, text: val });
                  }}
                  onKeyDown={handleRenameKeyDown}
                  onBlur={handleFinishRenameCategory}
                />
              ) : (
                <h2 class={styles.columnTitle}>{cat.name}</h2>
              )}
            </div>

            {/* Viewport-Height Reactive Dynamic Top/Bottom Fade Masked Links List */}
            <div
              class={`${styles.linksList} ${fadeClass}`}
              onScroll={e => handleScroll(e, cat.name)}
              onWheel={handleWheel}
            >
              {cat.links.map((link, linkIdx) => {
                const displayUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
                const mainAlias = link.aliases && link.aliases.length > 0 ? link.aliases[0] : null;
                const isItemDragOver = dragOverLinkId === link.id;
                const isBeingDragged = draggedLinkId === link.id;

                let dragOverClass = '';
                if (isItemDragOver) {
                  dragOverClass = dropPosition === 'below' ? styles.dragOverBelow : styles.dragOverAbove;
                }

                return (
                  <div
                    key={link.id}
                    class={`${styles.linkCardDragWrapper} ${dragOverClass} ${isBeingDragged ? styles.linkBeingDragged : ''}`}
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

      {/* Page-Wide Floating Minimalist Down Indicator Cue (Bottom Center) */}
      <button
        type="button"
        class={`${styles.pageScrollDownIndicator} ${showPageDownCue ? styles.visiblePageIndicator : ''}`}
        onClick={handleScrollPageDown}
        title="Scroll down for more categories"
      >
        <ChevronDown size={16} />
      </button>

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
