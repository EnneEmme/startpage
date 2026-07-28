import { h } from 'preact';
import { useEffect, useLayoutEffect, useRef, useState } from 'preact/hooks';
import { Edit3, Trash2, ArrowUp, ArrowDown, Folder, Move } from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import { appActions, categoriesSignal, linksSignal } from '../stores';
import { confirmDialog } from '../stores/confirmStore';
import styles from './ContextMenu.module.css';

/** Gap (px) kept between menu and viewport edges when clamping */
const VIEWPORT_GAP = 8;
/** Approx submenu width + gap, used only to decide flip direction pre-paint */
const SUBMENU_FOOTPRINT = 165;

interface ContextMenuProps {
  x: number;
  y: number;
  link: LinkItem;
  onClose: () => void;
  onEdit: (link: LinkItem) => void;
  onRemove: (linkId: string) => void;
  onReorderColumns?: (() => void) | undefined;
}

export const ContextMenu = ({
  x,
  y,
  link,
  onClose,
  onEdit,
  onRemove,
  onReorderColumns
}: ContextMenuProps) => {
  const [showCategorySubmenu, setShowCategorySubmenu] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: x, top: y });
  const [submenuOpensLeft, setSubmenuOpensLeft] = useState<boolean>(false);

  // Measure the real rendered size (no magic 190/220 clamps) and keep the
  // menu fully inside the viewport before paint.
  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const left = Math.max(VIEWPORT_GAP, Math.min(x, window.innerWidth - rect.width - VIEWPORT_GAP));
    const top = Math.max(VIEWPORT_GAP, Math.min(y, window.innerHeight - rect.height - VIEWPORT_GAP));
    setPosition({ left, top });
    setSubmenuOpensLeft(left + rect.width + SUBMENU_FOOTPRINT > window.innerWidth);
  }, [x, y]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    // capture phase: any scroll (also inside columns) or window resize closes the menu
    window.addEventListener('scroll', onClose, true);
    window.addEventListener('resize', onClose);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', onClose, true);
      window.removeEventListener('resize', onClose);
    };
  }, [onClose]);

  const categories = categoriesSignal.value.map(c => c.name);

  const handleEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClose();
    onEdit(link);
  };

  const handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    // Cancelling keeps the menu open; removal offers toast-based Undo upstream
    void confirmDialog({
      title: 'Remove link',
      message: `Remove "${link.title}"?`,
      confirmLabel: 'Remove',
      danger: true
    }).then(ok => {
      if (ok) {
        onRemove(link.id);
        onClose();
      }
    });
  };

  const handleMoveLinkDirection = (e: MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    const categoryLinks = linksSignal.value.filter(l => l.category === link.category);
    const currentIdx = categoryLinks.findIndex(l => l.id === link.id);
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;

    if (currentIdx !== -1 && targetIdx >= 0 && targetIdx < categoryLinks.length) {
      appActions.moveLink(link.id, link.category, targetIdx);
    }
    onClose();
  };

  const handleMoveToCategory = (e: MouseEvent, targetCategory: string) => {
    e.stopPropagation();
    appActions.moveLink(link.id, targetCategory);
    onClose();
  };

  return (
    <>
      {/* Backdrop swallows the dismissing click so it cannot activate
          whatever element is underneath; also handles right-click elsewhere. */}
      <div
        class={styles.menuBackdrop}
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />
      <div
        ref={menuRef}
        class={`${styles.menuContainer} fade-in`}
        style={{ left: `${position.left}px`, top: `${position.top}px` }}
        onClick={e => e.stopPropagation()}
      >
      <div class={styles.menuHeader}>{link.title}</div>

      <button class={styles.menuItem} onClick={handleEditClick}>
        <Edit3 size={15} /> Edit Link
      </button>

      <button class={styles.menuItem} onClick={e => handleMoveLinkDirection(e, 'up')}>
        <ArrowUp size={15} /> Move Up
      </button>

      <button class={styles.menuItem} onClick={e => handleMoveLinkDirection(e, 'down')}>
        <ArrowDown size={15} /> Move Down
      </button>

      <div class={styles.submenuWrapper}>
        <button
          class={styles.menuItem}
          onClick={e => {
            e.stopPropagation();
            setShowCategorySubmenu(prev => !prev);
          }}
        >
          <Folder size={15} /> Move Category...
        </button>

        {showCategorySubmenu && (
          <div class={`${styles.categorySubmenu} ${submenuOpensLeft ? styles.flipLeft : ''}`}>
            {categories.map(cat => (
              <button
                key={cat}
                class={`${styles.submenuItem} ${cat === link.category ? styles.active : ''}`}
                onClick={e => handleMoveToCategory(e, cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {onReorderColumns && (
        <>
          <div class={styles.divider} />
          <button
            class={styles.menuItem}
            onClick={e => {
              e.stopPropagation();
              onClose();
              onReorderColumns();
            }}
          >
            <Move size={15} /> Reorder Columns...
          </button>
        </>
      )}

      <div class={styles.divider} />

      <button class={`${styles.menuItem} ${styles.danger}`} onClick={handleRemoveClick}>
        <Trash2 size={15} /> Remove Link
      </button>
      </div>
    </>
  );
};
