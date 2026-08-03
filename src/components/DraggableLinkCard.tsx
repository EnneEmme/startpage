import { memo } from 'preact/compat';
import { useComputed } from '@preact/signals';
import { Zap } from 'lucide-preact';
import type { LinkItem } from '../types/startpage';
import {
  draggedLinkIdSignal,
  dragOverLinkIdSignal,
  dropPositionSignal,
  justDroppedLinkIdSignal
} from '../stores/dragStore';
import { ICON_FALLBACK_URL } from '../engine';
import { LinkIcon } from './LinkIcon';
import styles from './ColumnGrid.module.css';

interface DraggableLinkCardProps {
  link: LinkItem;
  displayUrl: string;
  isScript: boolean;
  showShortcuts: boolean;
  onDragStart: (e: DragEvent) => void;
  onDragOver: (e: DragEvent) => void;
  onDrop: (e: DragEvent) => void;
  onDragLeave: (e: DragEvent) => void;
  onDragEnd: (e: DragEvent) => void;
  onClick: (e: MouseEvent) => void;
  onContextMenu: (e: MouseEvent) => void;
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: () => void;
  onTouchMove: () => void;
}

/** Dispatched when keyboard users request the card context menu (Shift+F10 / ContextMenu key). */
export const OPEN_CONTEXT_MENU_EVENT = 'startpage:open-context-menu';

interface DraggableLinkCardViewProps extends DraggableLinkCardProps {
  dragOverClass: string | undefined;
  isBeingDragged: boolean;
  isJustDropped: boolean;
}

/**
 * Presentational card. Pure: every drag visual arrives as a plain boolean/class
 * prop, so this inner memo never re-renders unless its own visuals change.
 */
const DraggableLinkCardView = memo(({
  link,
  displayUrl,
  isScript,
  showShortcuts,
  dragOverClass,
  isBeingDragged,
  isJustDropped,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  onDragEnd,
  onClick,
  onContextMenu,
  onTouchStart,
  onTouchEnd,
  onTouchMove
}: DraggableLinkCardViewProps) => {
  const mainAlias = link.aliases && link.aliases.length > 0 ? link.aliases[0] : null;

  // Keyboard parity for right-click: Shift+F10 / ContextMenu key asks for the
  // context menu at this card's anchor (listener lives in the context-menu
  // branch; this CustomEvent is the cross-branch contract).
  const handleKeyDown = (e: KeyboardEvent) => {
    if ((e.shiftKey && e.key === 'F10') || e.key === 'ContextMenu') {
      e.preventDefault();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      window.dispatchEvent(new CustomEvent(OPEN_CONTEXT_MENU_EVENT, {
        detail: { linkId: link.id, clientX: rect.left, clientY: rect.bottom }
      }));
    }
  };

  return (
    <div
      class={`${styles.linkCardDragWrapper} ${dragOverClass} ${isBeingDragged ? styles.linkBeingDragged : ''} ${isJustDropped ? styles.linkCardReleased : ''}`}
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
      onDragEnd={onDragEnd}
      title={isScript ? 'JS Bookmarklet (Click to execute snippet)' : 'Drag to reorder link'}
    >
      <a
        href={displayUrl || '#'}
        class={styles.linkRow}
        draggable={false}
        onClick={onClick}
        onContextMenu={onContextMenu}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onTouchMove={onTouchMove}
        onKeyDown={handleKeyDown}
      >
        <div class={styles.iconContainer}>
          <LinkIcon
            url={displayUrl || ICON_FALLBACK_URL}
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
});

/**
 * Single draggable link row in a column.
 *
 * The wrapper binds the card's OWN drag-hover visuals to the module drag
 * signals through per-card `computed()` booleans: a dragover frame re-renders
 * at most the 2 cards whose insertion indicator moved, instead of the whole
 * grid. (Reading `isXxx.value` inside render subscribes only this component.)
 */
export const DraggableLinkCard = memo((props: DraggableLinkCardProps) => {
  const linkId = props.link.id;

  const isBeingDragged = useComputed(() => draggedLinkIdSignal.value === linkId).value;
  const isJustDropped = useComputed(() => justDroppedLinkIdSignal.value === linkId).value;
  const dragOverClass = useComputed<string | undefined>(() => {
    if (dragOverLinkIdSignal.value !== linkId) return undefined;
    return dropPositionSignal.value === 'below' ? styles.dragOverBelow : styles.dragOverAbove;
  }).value;

  return (
    <DraggableLinkCardView
      {...props}
      dragOverClass={dragOverClass ?? ''}
      isBeingDragged={isBeingDragged}
      isJustDropped={isJustDropped}
    />
  );
},
  // Function props are intentionally ignored by this comparator: every handler
  // passed by CategoryColumn/ColumnGrid only closes over STABLE module-level
  // state (dragStore signals + engine/appActions singletons) and therefore
  // behaves identically across renders, so stale closures are impossible.
  // Data props, by contrast, must stay referentially equal: mutating a link
  // object in place would wrongly keep the old card on screen.
  (prev: DraggableLinkCardProps, next: DraggableLinkCardProps) =>
  prev.link === next.link &&
  prev.displayUrl === next.displayUrl &&
  prev.isScript === next.isScript &&
  prev.showShortcuts === next.showShortcuts
);
