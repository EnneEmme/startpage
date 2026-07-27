import { h } from 'preact';
import { Search, CircleQuestionMark, PenLine, Download, Keyboard, Settings } from 'lucide-preact';
import styles from './HeaderClock.module.css';

interface HeaderClockProps {
  onOpenSearch: () => void;
  onOpenCheatsheet: () => void;
  onOpenVisualEdit: () => void;
  onOpenImportExport: () => void;
  onOpenSettings: () => void;
  showShortcuts?: boolean;
  onToggleShortcuts?: () => void;
}

export const HeaderClock = ({
  onOpenSearch,
  onOpenCheatsheet,
  onOpenVisualEdit,
  onOpenImportExport,
  onOpenSettings,
  showShortcuts = false,
  onToggleShortcuts
}: HeaderClockProps) => {
  return (
    <div class={styles.topRightTools}>
      {/* Toggle Aliases & Category Shortcut Numbers (Alt or click) */}
      <button
        class={`${styles.iconBtn} ${showShortcuts ? styles.activeIconBtn : ''}`}
        onClick={onToggleShortcuts}
        title="Toggle Aliases & Number Shortcuts (Press Alt or Shift+Space)"
      >
        <Keyboard size={17} />
      </button>

      {/* Fuzzy Search Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenSearch}
        title="Fuzzy Search (Press any key)"
      >
        <Search size={17} />
      </button>

      {/* Shortcuts Cheatsheet Modal */}
      <button
        class={styles.iconBtn}
        onClick={onOpenCheatsheet}
        title="Shortcuts Cheatsheet (? or F1)"
      >
        <CircleQuestionMark size={17} />
      </button>

      {/* Settings Modal Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenSettings}
        title="Settings & Themes"
      >
        <Settings size={17} />
      </button>

      {/* Visual Edit Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenVisualEdit}
        title="Add or Edit Links"
      >
        <PenLine size={17} />
      </button>

      {/* Backup / Export Config Button */}
      <button
        class={styles.iconBtn}
        onClick={onOpenImportExport}
        title="Backup & Sync Config"
      >
        <Download size={17} />
      </button>
    </div>
  );
};
