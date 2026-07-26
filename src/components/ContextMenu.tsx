import { h } from 'preact';
import { useEffect } from 'preact/hooks';
import { Edit3, Trash2 } from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import styles from './ContextMenu.module.css';

interface ContextMenuProps {
  x: number;
  y: number;
  link: LinkItem;
  onClose: () => void;
  onEdit: (link: LinkItem) => void;
  onRemove: (linkId: string) => void;
}

export const ContextMenu = ({
  x,
  y,
  link,
  onClose,
  onEdit,
  onRemove
}: ContextMenuProps) => {
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

  // Keep menu inside viewport boundaries
  const adjustedX = Math.min(x, window.innerWidth - 180);
  const adjustedY = Math.min(y, window.innerHeight - 100);

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
      <button class={`${styles.menuItem} ${styles.danger}`} onClick={handleRemoveClick}>
        <Trash2 size={15} /> Remove Link
      </button>
    </div>
  );
};
