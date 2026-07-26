import { h } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Edit3, Trash2, ArrowUp, ArrowDown, Folder } from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import { dataStore } from '../engine/dataStore';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  x: number;
  y: number;
  link: LinkItem;
  onClose: () => void;
  onEdit: (link: LinkItem) => void;
  onRemove: (linkId: string) => void;
  onConfigChanged: () => void;
}

export const ContextMenu = ({
  x,
  y,
  link,
  onClose,
  onEdit,
  onRemove,
  onConfigChanged
}: ContextMenuProps) => {
  const [showCategorySubmenu, setShowCategorySubmenu] = useState<boolean>(false);

  useEffect(() => {
    const handleOutsideClick = () => onClose();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('click', handleOutsideClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const categories = dataStore.getCategories().map(c => c.name);

  const handleEditClick = (e: MouseEvent) => {
    e.stopPropagation();
    onClose();
    onEdit(link);
  };

  const handleRemoveClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove this link?`)) {
      onRemove(link.id);
    }
    onClose();
  };

  const handleMoveLinkDirection = (e: MouseEvent, direction: 'up' | 'down') => {
    e.stopPropagation();
    const categoryLinks = dataStore.getLinks().filter(l => l.category === link.category);
    const currentIdx = categoryLinks.findIndex(l => l.id === link.id);
    const targetIdx = direction === 'up' ? currentIdx - 1 : currentIdx + 1;

    if (currentIdx !== -1 && targetIdx >= 0 && targetIdx < categoryLinks.length) {
      dataStore.moveLink(link.id, link.category, targetIdx);
      onConfigChanged();
    }
    onClose();
  };

  const handleMoveToCategory = (e: MouseEvent, targetCategory: string) => {
    e.stopPropagation();
    dataStore.moveLink(link.id, targetCategory);
    onConfigChanged();
    onClose();
  };

  // Keep menu inside viewport boundaries
  const adjustedX = Math.min(x, window.innerWidth - 190);
  const adjustedY = Math.min(y, window.innerHeight - 220);

  return (
    <div
      class={`${styles.menuContainer} fade-in`}
      style={{ left: `${adjustedX}px`, top: `${adjustedY}px` }}
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
          <div class={styles.categorySubmenu}>
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

      <div class={styles.divider} />

      <button class={`${styles.menuItem} ${styles.danger}`} onClick={handleRemoveClick}>
        <Trash2 size={15} /> Remove Link
      </button>
    </div>
  );
};
