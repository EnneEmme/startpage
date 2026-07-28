import { h } from 'preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { ChevronDown, Zap } from 'lucide-preact';
import { LinkItem, CategoryGroup } from '../types/startpage';
import {  dataStore  } from '../engine';
import {  resolveDynamicUrl  } from '../engine';
import {  executeLink, isBookmarkletOrScript  } from '../engine';
import { LinkIcon } from './LinkIcon';
import { ContextMenu } from './ContextMenu';
import styles from './ColumnGrid.module.css';

interface ColumnGridProps {
  categories: CategoryGroup[];
  showShortcuts: boolean;
  highlightedCategory?: string | null;
  onConfigChanged?: () => void;
  onEditLink?: (link: LinkItem) => void;
}

export const ColumnGrid = ({
  categories,
  showShortcuts,
  highlightedCategory,
  onConfigChanged,
  onEditLink
}: ColumnGridProps) => {
  const [contextMenuState, setContextMenuState] = useState<{
    x: number;
    y: number;
    link: LinkItem;
  } | null>(null);

  // Inline Category Header Rename State
  const [editingCategoryName, setEditingCategoryName] = useState<string | null>(null);
  const [renameInputValue, setRenameInputValue] = useState<string>('');

  // Drag & Drop State
  const [draggedLinkId, setDraggedLinkId] = useState<string | null>(null);
  const [draggedCategoryName, setDraggedCategoryName] = useState<string | null>(null);
  const [dragOverCategory, setDragOverCategory] = useState<string | null>(null);
  const [dragOverLinkId, setDragOverLinkId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'above' | 'below'>('below');
  const [justDroppedLinkId, setJustDroppedLinkId] = useState<string | null>(null);

  // Reactive Gradient Fade Mask & Page Down Cue State
  const [scrollStates, setScrollStates] = useState<Record<string, { canScrollUp: boolean; canScrollDown: boolean }>>({});
  const [hasPageScrollDown, setHasPageScrollDown] = useState<boolean>(false);

  // Check page scroll state for bottom chevron indicator
  const checkPageScroll = () => {
    const totalHeight = document.documentElement.scrollHeight;
    const viewportHeight = window.innerHeight;
    const currentScroll = window.scrollY || document.documentElement.scrollTop;

    // Show indicator if content extends > 80px below fold and user hasn't scrolled near bottom
    const isUnscrolledPage = currentScroll < 120;
    const hasMorePageContent = totalHeight > viewportHeight + 80;

    setHasPageScrollDown(isUnscrolledPage && hasMorePageContent);
  };

  // Measure all column link lists to initialize gradient fade masks immediately on load
  const checkAllColumnScrollMasks = () => {
    const newScrollStates: Record<string, { canScrollUp: boolean; canScrollDown: boolean }> = {};
    const columnElements = document.querySelectorAll(`.${styles.columnCard}`);

    columnElements.forEach(colEl => {
      const titleEl = colEl.querySelector(`.${styles.columnTitle}`);
      const listEl = colEl.querySelector(`.${styles.linksList}`) as HTMLDivElement | null;
      if (titleEl && listEl) {
        const colName = titleEl.textContent || '';
        const { scrollTop, scrollHeight, clientHeight } = listEl;
        newScrollStates[colName] = {
          canScrollUp: scrollTop > 4,
          canScrollDown: scrollTop + clientHeight < scrollHeight - 4
        };
      }
    });

    setScrollStates(newScrollStates);
  };

  useEffect(() => {
    checkPageScroll();
    checkAllColumnScrollMasks();

    // Secondary measurement after DOM paint to ensure accurate height calculations on startup
    const timer = setTimeout(() => {
      checkPageScroll();
      checkAllColumnScrollMasks();
    }, 60);

    const handleResize = () => {
      checkPageScroll();
      checkAllColumnScrollMasks();
    };

    window.addEventListener('scroll', checkPageScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', checkPageScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [categories]);

  // Isolate mousewheel scrolling to inner column list only
  const handleWheel = (e: WheelEvent) => {
    const container = e.currentTarget as HTMLDivElement;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const delta = e.deltaY;

    if (delta > 0 && scrollTop + clientHeight >= scrollHeight - 1) {
      container.scrollTop = scrollHeight;
      e.preventDefault();
    } else if (delta < 0 && scrollTop <= 0) {
      container.scrollTop = 0;
      e.preventDefault();
    }
  };

  const updateScrollMasksForColumn = (columnName: string, container: HTMLDivElement) => {
    const { scrollTop, scrollHeight, clientHeight } = container;
    const canScrollUp = scrollTop > 4;
    const canScrollDown = scrollTop + clientHeight < scrollHeight - 4;

    setScrollStates(prev => {
      const current = prev[columnName];
      if (current?.canScrollUp === canScrollUp && current?.canScrollDown === canScrollDown) {
        return prev;
      }
      return {
        ...prev,
        [columnName]: { canScrollUp, canScrollDown }
      };
    });
  };

  const handleScroll = (e: Event, columnName: string) => {
    const container = e.currentTarget as HTMLDivElement;
    updateScrollMasksForColumn(columnName, container);
  };

  // Scroll smooth to bottom of page when clicking floating chevron indicator
  const scrollToNextPageRow = () => {
    window.scrollTo({
      top: window.innerHeight - 100,
      behavior: 'smooth'
    });
  };

  const handleContextMenu = (e: MouseEvent, link: LinkItem) => {
    e.preventDefault();
    setContextMenuState({
      x: e.clientX,
      y: e.clientY,
      link
    });
  };

  const handleLinkClick = (e: MouseEvent, link: LinkItem) => {
    // executeLink owns all navigation (scripts included): always prevent the
    // native anchor navigation to avoid double navigation. Cmd/Ctrl+click
    // opens in a new tab via window.open (native new-tab default is prevented).
    e.preventDefault();
    executeLink(link, e.metaKey || e.ctrlKey ? '_blank' : '_self');
  };

  const handleHeaderDoubleClick = (e: MouseEvent, categoryName: string) => {
    e.stopPropagation();
    setEditingCategoryName(categoryName);
    setRenameInputValue(categoryName);
  };

  const handleRenameSubmit = (oldName: string) => {
    if (renameInputValue.trim() && renameInputValue.trim() !== oldName) {
      dataStore.renameCategory(oldName, renameInputValue.trim());
      if (onConfigChanged) onConfigChanged();
    }
    setEditingCategoryName(null);
  };

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
    if (e.dataTransfer) {
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

      dataStore.moveLink(draggedLinkId, targetCategoryName, finalIndex);

      // Trigger smooth spring drop animation
      setJustDroppedLinkId(draggedLinkId);
      setTimeout(() => setJustDroppedLinkId(null), 350);

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

        const maskState = scrollStates[cat.name] || { canScrollUp: false, canScrollDown: false };
        let fadeClass = '';
        if (maskState.canScrollUp && maskState.canScrollDown) {
          fadeClass = styles.fadeBoth;
        } else if (maskState.canScrollUp) {
          fadeClass = styles.fadeTop;
        } else if (maskState.canScrollDown) {
          fadeClass = styles.fadeBottom;
        }

        return (
          <div
            key={cat.name}
            id={columnId}
            class={`${styles.columnCard} ${isHighlighted ? styles.highlightPulse : ''} ${isDragOver ? styles.dragOver : ''}`}
            onDragOver={e => handleDragOver(e, cat.name)}
            onDrop={e => handleDrop(e, cat.name)}
            onDragLeave={handleDragLeave}
          >
            {/* Column Header */}
            <div
              class={styles.columnHeader}
              draggable={editingCategoryName !== cat.name}
              onDragStart={e => handleCategoryDragStart(e, cat.name)}
              onDragEnd={handleDragEnd}
              onDblClick={e => handleHeaderDoubleClick(e, cat.name)}
              title="Double click to rename column header, drag to reorder"
            >
              {editingCategoryName !== cat.name ? (
                <h3 class={styles.columnTitle}>{cat.name}</h3>
              ) : (
                <input
                  type="text"
                  class={styles.inlineRenameInput}
                  value={renameInputValue}
                  onInput={e => setRenameInputValue((e.target as HTMLInputElement).value)}
                  onBlur={() => handleRenameSubmit(cat.name)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') handleRenameSubmit(cat.name);
                    if (e.key === 'Escape') setEditingCategoryName(null);
                  }}
                  autoFocus
                />
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
                const isScript = isBookmarkletOrScript(link);
                const isItemDragOver = dragOverLinkId === link.id;
                const isBeingDragged = draggedLinkId === link.id;
                const isJustDropped = justDroppedLinkId === link.id;

                let dragOverClass = '';
                if (isItemDragOver) {
                  dragOverClass = dropPosition === 'below' ? styles.dragOverBelow : styles.dragOverAbove;
                }

                return (
                  <div
                    key={link.id}
                    class={`${styles.linkCardDragWrapper} ${dragOverClass} ${isBeingDragged ? styles.linkBeingDragged : ''} ${isJustDropped ? styles.linkCardReleased : ''}`}
                    draggable={true}
                    onDragStart={e => handleLinkDragStart(e, link)}
                    onDragOver={e => handleDragOver(e, cat.name, link.id)}
                    onDrop={e => handleDrop(e, cat.name, linkIdx)}
                    onDragLeave={handleDragLeave}
                    onDragEnd={handleDragEnd}
                    title={isScript ? 'JS Bookmarklet (Click to execute snippet)' : 'Drag to reorder link'}
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
                        <span class={styles.linkTitle}>
                          {link.title}
                          {isScript && <Zap size={11} style={{ marginLeft: '4px', color: '#f59e0b', display: 'inline-block', verticalAlign: 'middle' }} title="JS Script Bookmarklet" />}
                        </span>
                      </div>

                      {mainAlias && (
                        <span class={`${styles.aliasBadge} ${showShortcuts ? styles.visibleAliasBadge : ''}`}>
                          {mainAlias}
                        </span>
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
        class={`${styles.pageScrollDownIndicator} ${hasPageScrollDown ? styles.visiblePageIndicator : ''}`}
        onClick={scrollToNextPageRow}
        title="Scroll down to view remaining columns"
      >
        <ChevronDown size={20} />
      </button>

      {/* Context Menu */}
      {contextMenuState && (
        <ContextMenu
          x={contextMenuState.x}
          y={contextMenuState.y}
          link={contextMenuState.link}
          onClose={() => setContextMenuState(null)}
          onEdit={link => {
            if (onEditLink) onEditLink(link);
          }}
          onRemove={linkId => {
            dataStore.removeLink(linkId);
            if (onConfigChanged) onConfigChanged();
          }}
          onConfigChanged={() => {
            if (onConfigChanged) onConfigChanged();
          }}
        />
      )}
    </div>
  );
};
