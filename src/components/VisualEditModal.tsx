import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  X, Check, Plus, Tag, Mail, Globe, Search, MessageSquare, Sparkles, Bot, Cpu, Send,
  Tv, Music, Film, Code, Terminal, Calendar, FileText, Share2, Video, Image, BookOpen,
  Zap, Star, Heart, Folder, Link, Shield, Box, Compass
} from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import { dataStore } from '../engine/dataStore';
import { LinkIcon } from './LinkIcon';
import styles from './VisualEditModal.module.css';

interface VisualEditModalProps {
  initialLink?: LinkItem | null;
  onClose: () => void;
  onSave?: () => void;
}

const PRESET_ICONS = [
  { name: 'Mail', spec: 'Mail', icon: Mail },
  { name: 'Globe', spec: 'Globe', icon: Globe },
  { name: 'Search', spec: 'Search', icon: Search },
  { name: 'MessageSquare', spec: 'MessageSquare', icon: MessageSquare },
  { name: 'Sparkles', spec: 'Sparkles', icon: Sparkles },
  { name: 'Bot', spec: 'Bot', icon: Bot },
  { name: 'Cpu', spec: 'Cpu', icon: Cpu },
  { name: 'Send', spec: 'Send', icon: Send },
  { name: 'Tv', spec: 'Tv', icon: Tv },
  { name: 'Music', spec: 'Music', icon: Music },
  { name: 'Film', spec: 'Film', icon: Film },
  { name: 'Code', spec: 'Code', icon: Code },
  { name: 'Terminal', spec: 'Terminal', icon: Terminal },
  { name: 'Calendar', spec: 'Calendar', icon: Calendar },
  { name: 'FileText', spec: 'FileText', icon: FileText },
  { name: 'Share2', spec: 'Share2', icon: Share2 },
  { name: 'Video', spec: 'Video', icon: Video },
  { name: 'Image', spec: 'Image', icon: Image },
  { name: 'BookOpen', spec: 'BookOpen', icon: BookOpen },
  { name: 'Zap', spec: 'Zap', icon: Zap },
  { name: 'Star', spec: 'Star', icon: Star },
  { name: 'Heart', spec: 'Heart', icon: Heart },
  { name: 'Folder', spec: 'Folder', icon: Folder },
  { name: 'Link', spec: 'Link', icon: Link },
  { name: 'Shield', spec: 'Shield', icon: Shield },
  { name: 'Box', spec: 'Box', icon: Box },
  { name: 'Compass', spec: 'Compass', icon: Compass }
];

export const VisualEditModal = ({ initialLink, onClose, onSave }: VisualEditModalProps) => {
  const isEditing = Boolean(initialLink);

  const [title, setTitle] = useState(initialLink?.title || '');
  const [url, setUrl] = useState(initialLink?.url || '');
  const [aliases, setAliases] = useState(initialLink?.aliases ? initialLink.aliases.join(', ') : '');
  const [icon, setIcon] = useState(initialLink?.icon || '');
  const [category, setCategory] = useState(initialLink?.category || 'General');

  // Custom Category State
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Icon Search State
  const [iconQuery, setIconQuery] = useState('');

  const categories = dataStore.getCategories().map(c => c.name);

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setIsCategoryPickerOpen(false);
    setIsCreatingNewCategory(false);
  };

  const handleCreateNewCategory = () => {
    if (newCategoryName.trim()) {
      const trimmed = newCategoryName.trim();
      setCategory(trimmed);
      setIsCreatingNewCategory(false);
      setNewCategoryName('');
      setIsCategoryPickerOpen(false);
    }
  };

  const handleSubmit = (e: h.JSX.TargetedEvent<HTMLFormElement, Event>) => {
    e.preventDefault();

    if (!title.trim() || !url.trim()) return;

    const parsedAliases = aliases
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);

    const linkId = initialLink?.id || `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const targetCat = isCreatingNewCategory && newCategoryName.trim() ? newCategoryName.trim() : category;

    const updatedLink: LinkItem = {
      id: linkId,
      title: title.trim(),
      url: url.trim(),
      aliases: parsedAliases,
      category: targetCat || 'General',
      icon: icon.trim() || undefined
    };

    dataStore.addLink(updatedLink);
    if (onSave) onSave();
    onClose();
  };

  const filteredIcons = PRESET_ICONS.filter(i =>
    i.name.toLowerCase().includes(iconQuery.toLowerCase()) ||
    i.spec.toLowerCase().includes(iconQuery.toLowerCase())
  );

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.modalHeader}>
          <h2 class={styles.modalTitle}>{isEditing ? 'Edit Link' : 'Add New Link'}</h2>
          <button class={styles.closeBtn} onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} class={styles.formContent}>
          {/* Title */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Title</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. GitHub, ChatGPT, Mail..."
              value={title}
              onInput={e => setTitle((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          {/* URL */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>URL</label>
            <input
              type="url"
              class={styles.input}
              placeholder="https://example.com"
              value={url}
              onInput={e => setUrl((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          {/* Custom Category Picker with Suggestions & Add Mode */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Category</label>
            <div class={styles.customSelectWrapper}>
              {!isCreatingNewCategory ? (
                <div
                  class={styles.customSelectTrigger}
                  onClick={() => setIsCategoryPickerOpen(!isCategoryPickerOpen)}
                >
                  <span class={styles.selectedCategoryText}>
                    <Tag size={14} class={styles.categoryTagIcon} />
                    {category}
                  </span>
                  <span class={styles.arrowIcon}>{isCategoryPickerOpen ? '▲' : '▼'}</span>
                </div>
              ) : (
                <div class={styles.newCategoryInputWrapper}>
                  <input
                    type="text"
                    class={styles.input}
                    placeholder="Enter new category name..."
                    value={newCategoryName}
                    onInput={e => setNewCategoryName((e.target as HTMLInputElement).value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    class={styles.confirmCatBtn}
                    onClick={handleCreateNewCategory}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    class={styles.cancelCatBtn}
                    onClick={() => setIsCreatingNewCategory(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Dark Dropdown Menu */}
              {isCategoryPickerOpen && !isCreatingNewCategory && (
                <div class={`${styles.customDropdownMenu} fade-in`}>
                  {categories.map(cat => (
                    <div
                      key={cat}
                      class={`${styles.dropdownOption} ${cat === category ? styles.activeOption : ''}`}
                      onClick={() => handleSelectCategory(cat)}
                    >
                      <span>{cat}</span>
                      {cat === category && <Check size={14} class={styles.checkIcon} />}
                    </div>
                  ))}
                  <div
                    class={`${styles.dropdownOption} ${styles.createOption}`}
                    onClick={() => {
                      setIsCreatingNewCategory(true);
                      setIsCategoryPickerOpen(false);
                    }}
                  >
                    <Plus size={14} />
                    <span>Create New Category...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aliases */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Shortcuts / Aliases (comma separated)</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. g, gh, github"
              value={aliases}
              onInput={e => setAliases((e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Icon Search & Live Visual Suggestions Grid */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Icon Search & Visual Suggestions</label>
            <div class={styles.iconInputPreviewRow}>
              <div class={styles.iconLiveBadge}>
                <LinkIcon
                  url={url || 'https://example.com'}
                  iconSpec={icon}
                  title={title || 'Preview'}
                  size={20}
                />
              </div>
              <input
                type="text"
                class={styles.input}
                placeholder="Search icon (e.g. Mail, Globe, Code, Bot, Search...)"
                value={icon || iconQuery}
                onInput={e => {
                  const val = (e.target as HTMLInputElement).value;
                  setIcon(val);
                  setIconQuery(val);
                }}
              />
            </div>

            {/* Visual Icon Grid Suggestions */}
            <div class={styles.iconSuggestionsBox}>
              <div class={styles.iconGrid}>
                {filteredIcons.map(item => {
                  const IconComp = item.icon;
                  const isSelected = icon === item.spec;

                  return (
                    <button
                      key={item.spec}
                      type="button"
                      class={`${styles.iconGridCard} ${isSelected ? styles.selectedIconCard : ''}`}
                      onClick={() => {
                        setIcon(item.spec);
                        setIconQuery(item.spec);
                      }}
                      title={item.name}
                    >
                      <IconComp size={16} />
                      <span class={styles.iconCardLabel}>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div class={styles.modalFooter}>
            <button type="button" class={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" class={styles.saveBtn}>
              {isEditing ? 'Save Changes' : 'Create Link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
