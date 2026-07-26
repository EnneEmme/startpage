import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Download, Upload, Copy, Check, RefreshCw } from 'lucide-preact';
import { dataStore } from '../engine/dataStore';
import { rankStorage } from '../engine/rankStorage';
import styles from './ImportExportModal.module.css';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const ImportExportModal = ({
  isOpen,
  onClose,
  onConfigChanged
}: ImportExportModalProps) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = dataStore.exportJson();
    setJsonText(jsonStr);
    setStatusMsg({ text: 'Configuration exported successfully!', type: 'success' });
  };

  const handleCopy = () => {
    const jsonStr = jsonText || dataStore.exportJson();
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const jsonStr = jsonText || dataStore.exportJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `startpage_links_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!jsonText.trim()) {
      setStatusMsg({ text: 'Please paste JSON content first.', type: 'error' });
      return;
    }

    const success = dataStore.importJson(jsonText);
    if (success) {
      setStatusMsg({ text: 'Configuration imported and applied successfully!', type: 'success' });
      onConfigChanged();
    } else {
      setStatusMsg({ text: 'Failed to parse JSON. Please check JSON syntax.', type: 'error' });
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all links to default configuration?')) {
      dataStore.resetToDefault();
      rankStorage.clear();
      onConfigChanged();
      setStatusMsg({ text: 'Reset to default configuration complete.', type: 'success' });
    }
  };

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.header}>
          <div class={styles.titleGroup}>
            <Download size={22} class={styles.titleIcon} />
            <h2>Import / Export Backup Configuration</h2>
          </div>
          <button class={styles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div class={styles.contentBody}>
          <div class={styles.actionBar}>
            <button class={styles.actionBtn} onClick={handleExport}>
              <Download size={16} /> Export JSON
            </button>
            <button class={styles.actionBtn} onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied!' : 'Copy'}
            </button>
            <button class={styles.actionBtn} onClick={handleDownloadFile}>
              <Download size={16} /> Download File
            </button>
            <button class={`${styles.actionBtn} ${styles.resetBtn}`} onClick={handleResetDefaults}>
              <RefreshCw size={16} /> Reset Default
            </button>
          </div>

          {statusMsg && (
            <div class={`${styles.statusBanner} ${styles[statusMsg.type]}`}>
              {statusMsg.text}
            </div>
          )}

          <textarea
            class={styles.jsonTextarea}
            placeholder="Paste your JSON configuration here to import or click Export above..."
            value={jsonText}
            onInput={e => setJsonText((e.target as HTMLTextAreaElement).value)}
            rows={12}
          />

          <div class={styles.footerBar}>
            <button class={`${styles.actionBtn} ${styles.primaryBtn}`} onClick={handleImport}>
              <Upload size={16} /> Apply & Import JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
