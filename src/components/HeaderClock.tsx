import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { Search, HelpCircle, Edit3, Download, Sparkles } from 'lucide-preact';
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
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('it-IT', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        })
      );
      setDateStr(
        now.toLocaleDateString('it-IT', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header class={styles.header}>
      <div class={styles.clockContainer}>
        <div class={styles.time}>{timeStr}</div>
        <div class={styles.date}>{dateStr}</div>
      </div>

      <div class={styles.actionsBar}>
        <button
          class={styles.searchTriggerBtn}
          onClick={onOpenSearch}
          title="Fuzzy Search (Press any key)"
        >
          <Search size={16} />
          <span>Search or type a shortcut...</span>
          <kbd class={styles.keyBadge}>Press any key</kbd>
        </button>

        <div class={styles.quickTools}>
          <button
            class={styles.iconBtn}
            onClick={onOpenCheatsheet}
            title="Shortcuts Cheatsheet (? or F1)"
          >
            <HelpCircle size={18} />
          </button>
          <button
            class={styles.iconBtn}
            onClick={onOpenVisualEdit}
            title="Add or Edit Links"
          >
            <Edit3 size={18} />
          </button>
          <button
            class={styles.iconBtn}
            onClick={onOpenImportExport}
            title="Backup & Sync Config"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
