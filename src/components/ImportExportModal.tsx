import { useState } from 'preact/hooks';
import { Download, Upload, Copy, Check, RefreshCw, Database } from 'lucide-preact';
import { copyTextToClipboard } from '../engine';
import { appActions, confirmDialog, showToast } from '../stores';
import { Modal } from './modals/Modal';
import styles from './ImportExportModal.module.css';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportExportModal = ({
  isOpen,
  onClose
}: ImportExportModalProps) => {
  const [jsonText, setJsonText] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = () => {
    const jsonStr = appActions.exportJson();
    setJsonText(jsonStr);
    setStatusMsg({ text: 'Configuration exported successfully!', type: 'success' });
  };

  const handleCopy = async () => {
    const jsonStr = jsonText || appActions.exportJson();
    const ok = await copyTextToClipboard(jsonStr);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      setStatusMsg({ text: 'Clipboard unavailable here: use Download File instead.', type: 'error' });
    }
  };

  const handleDownloadFile = () => {
    const jsonStr = jsonText || appActions.exportJson();
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

    const success = appActions.importJson(jsonText);
    if (success) {
      setStatusMsg({ text: 'Configuration imported and applied successfully!', type: 'success' });
    } else {
      setStatusMsg({ text: 'Failed to parse JSON. Please check JSON syntax.', type: 'error' });
    }
  };

  const handleResetDefaults = () => {
    void confirmDialog({
      title: 'Reset to defaults',
      message: 'Reset all links to the default configuration? You can undo right after.',
      confirmLabel: 'Reset',
      danger: true
    }).then(ok => {
      if (!ok) return;
      const snapshot = appActions.exportJson();
      appActions.resetToDefaults();
      setStatusMsg({ text: 'Reset to default configuration complete.', type: 'success' });
      showToast('Configuration reset to defaults', {
        actionLabel: 'Undo',
        onAction: () => {
          appActions.importJson(snapshot);
        }
      });
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Data Management: Backup & Restore"
      subtitle="Export your links for safekeeping or import a previous backup"
      icon={<Database size={18} class={styles.headerIcon} />}
      footer={
        <button type="button" class={styles.closeActionBtn} onClick={onClose}>
          Close
        </button>
      }
    >
      <div class={styles.contentBody}>
        <div class={styles.sectionBlock}>
          <div class={styles.sectionHeader}>
            <Download size={16} class={styles.sectionIcon} />
            <h3>Export Backup (JSON)</h3>
          </div>
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
    </Modal>
  );
};
