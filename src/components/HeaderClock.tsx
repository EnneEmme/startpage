import { h } from 'preact';
import { Search, CircleQuestionMark, PenLine, Settings } from 'lucide-preact';
import styles from './HeaderClock.module.css';

interface HeaderClockProps {
  onOpenSearch: () => void;
  onOpenCheatsheet: () => void;
  onOpenVisualEdit: () => void;
  onOpenSettings: () => void;
}

export const HeaderClock = ({
  onOpenSearch,
  onOpenCheatsheet,
  onOpenVisualEdit,
  onOpenSettings
}: HeaderClockProps) => {
  return (
    <div class={styles.topRightTools}>
      {/* Fuzzy Search Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenSearch}
        title="Fuzzy Search (Press any key)"
      >
        <Search size={16} />
      </button>

      {/* Shortcuts Cheatsheet Modal */}
      <button
        class={styles.iconBtn}
        onClick={onOpenCheatsheet}
        title="Shortcuts Cheatsheet (? or F1)"
      >
        <CircleQuestionMark size={16} />
      </button>

      {/* Settings Modal Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenSettings}
        title="Settings & Themes"
      >
        <Settings size={16} />
      </button>

      {/* Visual Edit Button (Add or Edit Link) */}
      <button
        class={styles.iconBtn}
        onClick={onOpenVisualEdit}
        title="Add or Edit Links (Shift+N)"
      >
        <PenLine size={16} />
      </button>
    </div>
  );
};
