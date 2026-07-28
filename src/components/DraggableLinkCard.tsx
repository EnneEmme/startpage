import { memo } from 'preact/compat';
import { Zap } from 'lucide-preact';
import type { LinkItem } from '../types/startpage';
import { ICON_FALLBACK_URL } from '../engine';
import { LinkIcon } from './LinkIcon';
import styles from './ColumnGrid.module.css';

interface DraggableLinkCardProps {
  link: LinkItem;
  displayUrl: string;
  isScript: boolean;
  showShortcuts: boolean;
  dragOverClass: string | undefined;
  isBeingDragged: boolean;
  isJustDropped: boolean;
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

/**
 * Single draggable link row in a column. Memoized so drag-over state on
 * other cards doesn't re-render this one.
 */
export const DraggableLinkCard = memo(({
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
}: DraggableLinkCardProps) => {
  const mainAlias = link.aliases && link.aliases.length > 0 ? link.aliases[0] : null;

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
}, (prev: DraggableLinkCardProps, next: DraggableLinkCardProps) =>
  prev.link === next.link &&
  prev.displayUrl === next.displayUrl &&
  prev.isScript === next.isScript &&
  prev.showShortcuts === next.showShortcuts &&
  prev.dragOverClass === next.dragOverClass &&
  prev.isBeingDragged === next.isBeingDragged &&
  prev.isJustDropped === next.isJustDropped
);
