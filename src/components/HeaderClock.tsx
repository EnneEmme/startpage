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
  const tools = (
    <>
      {/* Fuzzy Search Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenSearch}
        title="Fuzzy Search (Press any key)"
      >
        <Search size={18} />
      </button>

      {/* Shortcuts Cheatsheet Modal */}
      <button
        class={styles.iconBtn}
        onClick={onOpenCheatsheet}
        title="Shortcuts Cheatsheet (? or F1)"
      >
        <CircleQuestionMark size={18} />
      </button>

      {/* Settings Modal Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenSettings}
        title="Settings & Themes"
      >
        <Settings size={18} />
      </button>

      {/* Visual Edit Button (Add or Edit Link) */}
      <button
        class={styles.iconBtn}
        onClick={onOpenVisualEdit}
        title="Add or Edit Links (Shift+N or n)"
      >
        <PenLine size={18} />
      </button>
    </>
  );

  return (
    <>
      {/* Top Header Toolbar (Desktop >= 860px) */}
      <div class={styles.topRightTools}>
        {tools}
      </div>

      {/* Floating Bottom Nav Bar (Mobile & Tablet < 860px) */}
      <nav class={styles.floatingBottomNav} aria-label="Mobile Navigation">
        {tools}
      </nav>
    </>
  );
};
