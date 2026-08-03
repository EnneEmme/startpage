import { useState, useCallback } from 'preact/hooks';
import { memo } from 'preact/compat';
import { useComputed } from '@preact/signals';
import type { CategoryGroup, LinkItem } from '../types/startpage';
import { appActions } from '../stores';
import { dragOverCategoryIdSignal, dragOverLinkIdSignal } from '../stores/dragStore';
import { resolveDynamicUrl, isBookmarkletOrScript, categoryColumnId } from '../engine';
import type { useDragAndDrop } from '../hooks/useDragAndDrop';
import type { ScrollMask } from '../hooks/useColumnScrollMasks';
import { DraggableLinkCard } from './DraggableLinkCard';
import styles from './ColumnGrid.module.css';

type DragApi = ReturnType<typeof useDragAndDrop>;

interface CategoryColumnProps {
  cat: CategoryGroup;
  highlighted: boolean;
  showShortcuts: boolean;
  drag: DragApi;
  mask: ScrollMask | undefined;
  registerList: (columnName: string, el: HTMLDivElement | null) => void;
  onListScroll: (columnName: string, el: HTMLDivElement) => void;
  onCardContextMenu: (e: MouseEvent, link: LinkItem) => void;
  onCardTouchStart: (e: TouchEvent, link: LinkItem) => void;
  onCardTouchEnd: () => void;
  onCardClick: (e: MouseEvent, link: LinkItem) => void;
  /** Optional: renders the empty-state CTA when the column has no links. */
  onAddLink?: ((category: string) => void) | undefined;
}

/**
 * One category column: header with double-click inline rename + drag-to-reorder,
 * and the scroll-masked list of link cards.
 *
 * Memoized: the transient drag-hover classes come from signals (dragStore),
 * not from `drag` snapshot props — `drag.draggedLinkId` & co. are intentionally
 * NOT read here, so a dragover frame does NOT re-render this column. Only two
 * column-level signal booleans are subscribed (isColumnDragOver); per-card
 * drag classes are bound inside DraggableLinkCard itself.
 */
export const CategoryColumn = memo(({
  cat,
  highlighted,
  showShortcuts,
  drag,
  mask,
  registerList,
  onListScroll,
  onCardContextMenu,
  onCardTouchStart,
  onCardTouchEnd,
  onCardClick,
  onAddLink
}: CategoryColumnProps) => {
  // Inline category header rename state (local: only this column re-renders)
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');

  // Column-level drop highlight: signal-based, so writing a new hover target
  // re-renders only the entering/leaving columns, never the whole grid.
  const isDragOver = useComputed(
    () => dragOverCategoryIdSignal.value === cat.name && !dragOverLinkIdSignal.value
  ).value;

  // Stable ref: a fresh arrow each render would make Preact detach/attach on
  // every render, churning mask state into an infinite re-render loop.
  const listRef = useCallback(
    (el: HTMLDivElement | null) => registerList(cat.name, el),
    [cat.name, registerList]
  );

  // CSS-module classes are typed string|undefined by noUncheckedIndexedAccess;
  // the class names exist, and Preact's class prop tolerates undefined.
  let fadeClass: string | undefined = '';
  if (mask?.canScrollUp && mask?.canScrollDown) {
    fadeClass = styles.fadeBoth;
  } else if (mask?.canScrollUp) {
    fadeClass = styles.fadeTop;
  } else if (mask?.canScrollDown) {
    fadeClass = styles.fadeBottom;
  }

  const startRename = () => {
    setIsRenaming(true);
    setRenameValue(cat.name);
  };

  const submitRename = () => {
    if (renameValue.trim() && renameValue.trim() !== cat.name) {
      appActions.renameCategory(cat.name, renameValue.trim());
    }
    setIsRenaming(false);
  };

  return (
    <div
      id={categoryColumnId(cat.name)}
      class={`${styles.columnCard} ${highlighted ? styles.highlightPulse : ''} ${isDragOver ? styles.dragOver : ''}`}
      onDragOver={e => drag.handleDragOver(e, cat.name)}
      onDrop={e => drag.handleDrop(e, cat.name)}
      onDragLeave={drag.handleDragLeave}
    >
      {/* Column Header */}
      <div
        class={styles.columnHeader}
        draggable={!isRenaming}
        onDragStart={e => drag.handleCategoryDragStart(e, cat.name)}
        onDragEnd={drag.handleDragEnd}
        onDblClick={e => {
          e.stopPropagation();
          startRename();
        }}
        title="Double click to rename column header, drag to reorder"
      >
        {!isRenaming ? (
          <h3 class={styles.columnTitle}>{cat.name}</h3>
        ) : (
          <input
            type="text"
            class={styles.inlineRenameInput}
            value={renameValue}
            onInput={e => setRenameValue((e.target as HTMLInputElement).value)}
            onBlur={submitRename}
            onKeyDown={e => {
              if (e.key === 'Enter') submitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            autoFocus
          />
        )}
      </div>

      {/* Viewport-Height Reactive Dynamic Top/Bottom Fade Masked Links List */}
      <div
        ref={listRef}
        class={`${styles.linksList} ${fadeClass}`}
        onScroll={e => onListScroll(cat.name, e.currentTarget as HTMLDivElement)}
      >
        {cat.links.length === 0 ? (
          <div class={styles.emptyState}>
            <p class={styles.emptyStateText}>No links yet</p>
            {onAddLink && (
              <button
                type="button"
                class={styles.emptyStateAction}
                onClick={() => onAddLink(cat.name)}
              >
                Add the first link
              </button>
            )}
          </div>
        ) : (
          cat.links.map((link, linkIdx) => (
            <DraggableLinkCard
              key={link.id}
              link={link}
              displayUrl={resolveDynamicUrl(link.url, link.dynamicUrlRule)}
              isScript={isBookmarkletOrScript(link)}
              showShortcuts={showShortcuts}
              onDragStart={e => drag.handleLinkDragStart(e, link)}
              onDragOver={e => drag.handleDragOver(e, cat.name, link.id)}
              onDrop={e => drag.handleDrop(e, cat.name, linkIdx)}
              onDragLeave={drag.handleDragLeave}
              onDragEnd={drag.handleDragEnd}
              onClick={e => onCardClick(e, link)}
              onContextMenu={e => onCardContextMenu(e, link)}
              onTouchStart={e => onCardTouchStart(e, link)}
              onTouchEnd={onCardTouchEnd}
              onTouchMove={onCardTouchEnd}
            />
          ))
        )}
      </div>
    </div>
  );
});
