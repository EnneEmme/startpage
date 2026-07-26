import { h } from 'preact';
import { useState } from 'preact/hooks';
import { X, Plus, Edit3, Trash2, Check } from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import { dataStore } from '../engine/dataStore';
import styles from './VisualEditModal.module.css';

interface VisualEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigChanged: () => void;
}

export const VisualEditModal = ({
  isOpen,
  onClose,
  onConfigChanged
}: VisualEditModalProps) => {
  const [title, setTitle] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [aliasesStr, setAliasesStr] = useState<string>('');
  const [category, setCategory] = useState<string>('General');
  const [icon, setIcon] = useState<string>('');
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);

  if (!isOpen) return null;

  const links = dataStore.getLinks();

  const handleSave = (e: Event) => {
    e.preventDefault();
    if (!title.trim()) return;

    const id = selectedLinkId || title.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const aliases = aliasesStr
      ? aliasesStr.split(',').map(a => a.trim()).filter(Boolean)
      : [id];

    const linkItem: LinkItem = {
      id,
      title: title.trim(),
      url: url.trim(),
      aliases,
      category: category.trim() || 'General',
      icon: icon.trim() || undefined
    };

    dataStore.addLink(linkItem);
    onConfigChanged();
    handleResetForm();
  };

  const handleEditLink = (link: LinkItem) => {
    setSelectedLinkId(link.id);
    setTitle(link.title);
    setUrl(link.url);
    setAliasesStr(link.aliases.join(', '));
    setCategory(link.category);
    setIcon(link.icon || '');
  };

  const handleDeleteLink = (linkId: string) => {
    if (confirm('Delete this link?')) {
      dataStore.removeLink(linkId);
      onConfigChanged();
      if (selectedLinkId === linkId) {
        handleResetForm();
      }
    }
  };

  const handleResetForm = () => {
    setSelectedLinkId(null);
    setTitle('');
    setUrl('');
    setAliasesStr('');
    setCategory('General');
    setIcon('');
  };

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.header}>
          <div class={styles.titleGroup}>
            <Edit3 size={22} class={styles.titleIcon} />
            <h2>{selectedLinkId ? 'Edit Link' : 'Add New Link'}</h2>
          </div>
          <button class={styles.closeBtn} onClick={onClose} title="Close">
            <X size={20} />
          </button>
        </div>

        <div class={styles.contentBody}>
          {/* Add/Edit Form */}
          <form class={styles.form} onSubmit={handleSave}>
            <div class={styles.formGroup}>
              <label>Title *</label>
              <input
                type="text"
                class={styles.input}
                placeholder="e.g. GitHub Trending"
                value={title}
                onInput={e => setTitle((e.target as HTMLInputElement).value)}
                required
              />
            </div>

            <div class={styles.formGroup}>
              <label>URL *</label>
              <input
                type="text"
                class={styles.input}
                placeholder="e.g. https://github.com/trending"
                value={url}
                onInput={e => setUrl((e.target as HTMLInputElement).value)}
              />
            </div>

            <div class={styles.formRow}>
              <div class={styles.formGroup}>
                <label>Aliases (comma separated)</label>
                <input
                  type="text"
                  class={styles.input}
                  placeholder="e.g. gh, trend"
                  value={aliasesStr}
                  onInput={e => setAliasesStr((e.target as HTMLInputElement).value)}
                />
              </div>

              <div class={styles.formGroup}>
                <label>Category</label>
                <input
                  type="text"
                  class={styles.input}
                  placeholder="e.g. Dev, Social, Fun"
                  value={category}
                  onInput={e => setCategory((e.target as HTMLInputElement).value)}
                />
              </div>
            </div>

            <div class={styles.formGroup}>
              <label>Icon (Lucide name, Image URL, or leave blank for Favicon)</label>
              <input
                type="text"
                class={styles.input}
                placeholder="e.g. Github or leave blank for auto favicon"
                value={icon}
                onInput={e => setIcon((e.target as HTMLInputElement).value)}
              />
            </div>

            <div class={styles.formActions}>
              {selectedLinkId && (
                <button type="button" class={styles.secondaryBtn} onClick={handleResetForm}>
                  Cancel Edit
                </button>
              )}
              <button type="submit" class={styles.primaryBtn}>
                <Check size={16} /> {selectedLinkId ? 'Update Link' : 'Add Link'}
              </button>
            </div>
          </form>

          {/* Links Management List */}
          <div class={styles.linksManager}>
            <h3 class={styles.managerTitle}>Existing Links ({links.length})</h3>
            <div class={styles.linksList}>
              {links.map(l => (
                <div key={l.id} class={styles.manageRow}>
                  <div class={styles.manageInfo}>
                    <span class={styles.manageTitle}>{l.title}</span>
                    <span class={styles.manageCategory}>{l.category}</span>
                  </div>
                  <div class={styles.manageActions}>
                    <button class={styles.rowBtn} onClick={() => handleEditLink(l)} title="Edit">
                      <Edit3 size={15} />
                    </button>
                    <button class={`${styles.rowBtn} ${styles.deleteBtn}`} onClick={() => handleDeleteLink(l.id)} title="Delete">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
