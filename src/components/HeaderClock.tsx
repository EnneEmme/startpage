import { h } from 'preact';
import { Search, HelpCircle, Edit3, Download } from 'lucide-preact';
import styles from './HeaderClock.module.css';

interface HeaderClockProps {
  onOpenSearch: () => void;
  onOpenCheatsheet: () => void;
  onOpenVisualEdit: () => void;
  onOpenImportExport: () => void;
}

export const HeaderClock = ({
  onOpenSearch,
  onOpenCheatsheet,
  onOpenVisualEdit,
  onOpenImportExport
}: HeaderClockProps) => {
  return (
    <div class={styles.topRightTools}>
      <button
        class={styles.iconBtn}
        onClick={onOpenSearch}
        title="Fuzzy Search (Press any key)"
      >
        <Search size={17} />
      </button>

      <button
        class={styles.iconBtn}
        onClick={onOpenCheatsheet}
        title="Shortcuts Cheatsheet (? or F1)"
      >
        <HelpCircle size={17} />
      </button>

      <button
        class={styles.iconBtn}
        onClick={onOpenVisualEdit}
        title="Add or Edit Links"
      >
        <Edit3 size={17} />
      </button>

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
