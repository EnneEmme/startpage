import { useState } from 'preact/hooks';
import type { CategoryGroup, LinkItem } from '../types/startpage';
import { appActions } from '../stores';
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
}

/**
 * One category column: header with double-click inline rename + drag-to-reorder,
 * and the scroll-masked list of link cards.
 */
export const CategoryColumn = ({
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
  onCardClick
}: CategoryColumnProps) => {
  // Inline category header rename state (local: only this column re-renders)
  const [isRenaming, setIsRenaming] = useState<boolean>(false);
  const [renameValue, setRenameValue] = useState<string>('');

  const isDragOver = drag.dragOverCategory === cat.name && !drag.dragOverLinkId;

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
        ref={el => registerList(cat.name, el)}
        class={`${styles.linksList} ${fadeClass}`}
        onScroll={e => onListScroll(cat.name, e.currentTarget as HTMLDivElement)}
      >
        {cat.links.map((link, linkIdx) => {
          const displayUrl = resolveDynamicUrl(link.url, link.dynamicUrlRule);
          const isScript = isBookmarkletOrScript(link);
          const isItemDragOver = drag.dragOverLinkId === link.id;

          let dragOverClass: string | undefined = '';
          if (isItemDragOver) {
            dragOverClass = drag.dropPosition === 'below' ? styles.dragOverBelow : styles.dragOverAbove;
          }

          return (
            <DraggableLinkCard
              key={link.id}
              link={link}
              displayUrl={displayUrl}
              isScript={isScript}
              showShortcuts={showShortcuts}
              dragOverClass={dragOverClass}
              isBeingDragged={drag.draggedLinkId === link.id}
              isJustDropped={drag.justDroppedLinkId === link.id}
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
          );
        })}
      </div>
    </div>
  );
};
