import { h } from 'preact';
import { Search, CircleQuestionMark, PenLine, Settings } from 'lucide-preact';
import styles from './MobileBottomNav.module.css';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
  onOpenCheatsheet: () => void;
  onOpenVisualEdit: () => void;
  onOpenSettings: () => void;
}

export const MobileBottomNav = ({
  onOpenSearch,
  onOpenCheatsheet,
  onOpenVisualEdit,
  onOpenSettings
}: MobileBottomNavProps) => {
  return (
    <nav class={styles.floatingBottomNav} aria-label="Mobile Navigation">
      <button
        class={styles.iconBtn}
        onClick={onOpenSearch}
        title="Fuzzy Search (Press any key)"
      >
        <Search size={20} />
      </button>

      <button
        class={styles.iconBtn}
        onClick={onOpenCheatsheet}
        title="Shortcuts Cheatsheet (? or F1)"
      >
        <CircleQuestionMark size={20} />
      </button>

      <button
        class={styles.iconBtn}
        onClick={onOpenSettings}
        title="Settings & Themes"
      >
        <Settings size={20} />
      </button>

      <button
        class={styles.iconBtn}
        onClick={onOpenVisualEdit}
        title="Add or Edit Links (Shift+N)"
      >
        <PenLine size={20} />
      </button>
    </nav>
  );
};
