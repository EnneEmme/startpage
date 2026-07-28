import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Download, Upload, Copy, Check, RefreshCw, Database } from 'lucide-preact';
import {  dataStore  } from '../engine';
import {  rankStorage  } from '../engine';
import { Modal } from './modals/Modal';
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestione Dati: Backup & Ripristino"
      subtitle="Esporta i tuoi link per sicurezza o importa un backup precedente"
      icon={<Database size={18} class={styles.headerIcon} />}
      footer={
        <button type="button" class={styles.closeActionBtn} onClick={onClose}>
          Chiudi
        </button>
      }
    >
      <div class={styles.contentBody}>
        <div class={styles.sectionBlock}>
          <div class={styles.sectionHeader}>
            <Download size={16} class={styles.sectionIcon} />
            <h3>Esporta Backup (JSON)</h3>
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
