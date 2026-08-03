import { useState, useEffect, useRef } from 'preact/hooks';
import { Download, Upload, Copy, Check, RefreshCw, Database } from 'lucide-preact';
import { copyTextToClipboard, dataStore, IMPORT_COPIED_FEEDBACK_MS } from '../engine';
import { appActions, confirmDialog, showToast } from '../stores';
import { Modal } from './Modals/Modal';
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
  const copiedTimerRef = useRef<number | null>(null);

  // Release any pending "Copied!" reset on unmount
  useEffect(
    () => () => {
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
    },
    []
  );

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
      if (copiedTimerRef.current !== null) {
        window.clearTimeout(copiedTimerRef.current);
      }
      copiedTimerRef.current = window.setTimeout(() => {
        copiedTimerRef.current = null;
        setCopied(false);
      }, IMPORT_COPIED_FEEDBACK_MS);
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

    // Structured diagnostics come from the engine: appActions.importJson stays
    // the boolean compatibility path for the stores layer, while this modal
    // needs the failure reason to surface it to the user via toast.
    const result = dataStore.importJsonDetailed(jsonText);
    if (result.ok) {
      setStatusMsg({ text: 'Configuration imported and applied successfully!', type: 'success' });
    } else {
      showToast(`Import failed: ${result.error}`);
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
      icon={<Database size={18} />}
      footer={
        <button type="button" class={styles.actionBtn} onClick={onClose}>
          Close
        </button>
      }
    >
      <div class={styles.contentBody}>
        <div>
          <div>
            <Download size={16} />
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
