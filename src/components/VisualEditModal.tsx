import { h } from 'preact';
import { useState } from 'preact/hooks';
import {
  X, Check, Plus, Tag, Mail, Globe, Search, MessageSquare, Sparkles, Bot, Cpu, Send,
  Tv, Music, Film, Code, Terminal, Calendar, FileText, Share2, Video, Image, BookOpen,
  Zap, Star, Heart, Folder, Link, Shield, Box, Compass, Activity, Layers, Grid, Database,
  Server, HardDrive, Cloud, Lock, Unlock, Key, Eye, Settings, Sliders, Wrench, Feather,
  PenTool, Play, Pause, Volume2, Radio, Headphones, Bookmark, Flag, Bell, Award,
  Briefcase, ShoppingBag, DollarSign, CreditCard, BarChart2, PieChart, TrendingUp, Target,
  Crosshair, Sun, Moon, Smile, ThumbsUp, Flame, MapPin, Maximize2, Minimize2
} from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import { dataStore } from '../engine/dataStore';
import { LinkIcon } from './LinkIcon';
import styles from './VisualEditModal.module.css';

interface VisualEditModalProps {
  isOpen?: boolean;
  initialEditLink?: LinkItem | null;
  initialLink?: LinkItem | null;
  onClose: () => void;
  onSave?: () => void;
  onConfigChanged?: () => void;
}

const PRESET_ICONS = [
  // AI & Tech
  { name: 'Sparkles', spec: 'Sparkles', icon: Sparkles },
  { name: 'Bot', spec: 'Bot', icon: Bot },
  { name: 'Cpu', spec: 'Cpu', icon: Cpu },
  { name: 'Zap', spec: 'Zap', icon: Zap },
  { name: 'Terminal', spec: 'Terminal', icon: Terminal },
  { name: 'Code', spec: 'Code', icon: Code },
  { name: 'Database', spec: 'Database', icon: Database },
  { name: 'Server', spec: 'Server', icon: Server },
  { name: 'HardDrive', spec: 'HardDrive', icon: HardDrive },
  { name: 'Cloud', spec: 'Cloud', icon: Cloud },
  { name: 'Lock', spec: 'Lock', icon: Lock },
  { name: 'Unlock', spec: 'Unlock', icon: Unlock },
  { name: 'Key', spec: 'Key', icon: Key },
  { name: 'Shield', spec: 'Shield', icon: Shield },
  { name: 'Box', spec: 'Box', icon: Box },
  { name: 'Layers', spec: 'Layers', icon: Layers },
  { name: 'Grid', spec: 'Grid', icon: Grid },
  { name: 'Activity', spec: 'Activity', icon: Activity },
  { name: 'Compass', spec: 'Compass', icon: Compass },

  // Communication & Social
  { name: 'Mail', spec: 'Mail', icon: Mail },
  { name: 'Send', spec: 'Send', icon: Send },
  { name: 'MessageSquare', spec: 'MessageSquare', icon: MessageSquare },
  { name: 'Share2', spec: 'Share2', icon: Share2 },
  { name: 'Globe', spec: 'Globe', icon: Globe },
  { name: 'Link', spec: 'Link', icon: Link },
  { name: 'Tag', spec: 'Tag', icon: Tag },
  { name: 'Flag', spec: 'Flag', icon: Flag },
  { name: 'Bell', spec: 'Bell', icon: Bell },
  { name: 'Award', spec: 'Award', icon: Award },
  { name: 'Briefcase', spec: 'Briefcase', icon: Briefcase },
  { name: 'Heart', spec: 'Heart', icon: Heart },
  { name: 'Smile', spec: 'Smile', icon: Smile },
  { name: 'ThumbsUp', spec: 'ThumbsUp', icon: ThumbsUp },

  // Media & Entertainment
  { name: 'Tv', spec: 'Tv', icon: Tv },
  { name: 'Music', spec: 'Music', icon: Music },
  { name: 'Film', spec: 'Film', icon: Film },
  { name: 'Video', spec: 'Video', icon: Video },
  { name: 'Image', spec: 'Image', icon: Image },
  { name: 'Radio', spec: 'Radio', icon: Radio },
  { name: 'Headphones', spec: 'Headphones', icon: Headphones },
  { name: 'Play', spec: 'Play', icon: Play },
  { name: 'Pause', spec: 'Pause', icon: Pause },
  { name: 'Volume2', spec: 'Volume2', icon: Volume2 },
  { name: 'Flame', spec: 'Flame', icon: Flame },
  { name: 'Sun', spec: 'Sun', icon: Sun },
  { name: 'Moon', spec: 'Moon', icon: Moon },

  // Office & Education
  { name: 'Calendar', spec: 'Calendar', icon: Calendar },
  { name: 'FileText', spec: 'FileText', icon: FileText },
  { name: 'BookOpen', spec: 'BookOpen', icon: BookOpen },
  { name: 'Folder', spec: 'Folder', icon: Folder },
  { name: 'Search', spec: 'Search', icon: Search },
  { name: 'Bookmark', spec: 'Bookmark', icon: Bookmark },
  { name: 'BarChart2', spec: 'BarChart2', icon: BarChart2 },
  { name: 'PieChart', spec: 'PieChart', icon: PieChart },
  { name: 'TrendingUp', spec: 'TrendingUp', icon: TrendingUp },
  { name: 'Target', spec: 'Target', icon: Target },
  { name: 'Crosshair', spec: 'Crosshair', icon: Crosshair },
  { name: 'DollarSign', spec: 'DollarSign', icon: DollarSign },
  { name: 'CreditCard', spec: 'CreditCard', icon: CreditCard },
  { name: 'ShoppingBag', spec: 'ShoppingBag', icon: ShoppingBag },

  // Tools & Settings
  { name: 'Settings', spec: 'Settings', icon: Settings },
  { name: 'Sliders', spec: 'Sliders', icon: Sliders },
  { name: 'Wrench', spec: 'Wrench', icon: Wrench },
  { name: 'Feather', spec: 'Feather', icon: Feather },
  { name: 'PenTool', spec: 'PenTool', icon: PenTool },
  { name: 'Star', spec: 'Star', icon: Star },
  { name: 'MapPin', spec: 'MapPin', icon: MapPin },
  { name: 'Eye', spec: 'Eye', icon: Eye },
  { name: 'Maximize2', spec: 'Maximize2', icon: Maximize2 },
  { name: 'Minimize2', spec: 'Minimize2', icon: Minimize2 }
];

export const VisualEditModal = ({
  isOpen = true,
  initialEditLink,
  initialLink,
  onClose,
  onSave,
  onConfigChanged
}: VisualEditModalProps) => {
  if (!isOpen) return null;

  const targetLink = initialEditLink || initialLink;
  const isEditing = Boolean(targetLink);

  const [title, setTitle] = useState(targetLink?.title || '');
  const [url, setUrl] = useState(targetLink?.url || '');
  const [aliases, setAliases] = useState(targetLink?.aliases ? targetLink.aliases.join(', ') : '');
  const [icon, setIcon] = useState(targetLink?.icon || '');
  const [category, setCategory] = useState(targetLink?.category || 'General');

  // Custom Category State
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Icon Picker Dropdown State
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

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

    const linkId = targetLink?.id || `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
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
    if (onConfigChanged) onConfigChanged();
    onClose();
  };

  const filteredIcons = PRESET_ICONS.filter(i =>
    i.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
    i.spec.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        <div class={styles.modalHeader}>
          <h2 class={styles.modalTitle}>{isEditing ? 'Edit Link' : 'Add New Link'}</h2>
          <button class={styles.closeBtn} onClick={onClose} type="button">
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

          {/* Custom Category Picker */}
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

          {/* Clean Non-Invasive Icon Dropdown Picker */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Icon</label>
            <div class={styles.iconDropdownWrapper}>
              <div class={styles.iconInputTriggerRow}>
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
                  placeholder="Lucide name or Image URL..."
                  value={icon}
                  onInput={e => setIcon((e.target as HTMLInputElement).value)}
                />
                <button
                  type="button"
                  class={styles.iconPickerToggleBtn}
                  onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                >
                  Choose ({PRESET_ICONS.length}) ▼
                </button>
              </div>

              {/* Compact Dark Icon Dropdown Menu */}
              {isIconDropdownOpen && (
                <div class={`${styles.iconDropdownMenu} fade-in`}>
                  <div class={styles.iconSearchHeader}>
                    <input
                      type="text"
                      class={styles.iconSearchInput}
                      placeholder="Search 75+ icons..."
                      value={iconSearchQuery}
                      onInput={e => setIconSearchQuery((e.target as HTMLInputElement).value)}
                      autoFocus
                    />
                  </div>
                  <div class={styles.iconDropdownGrid}>
                    {filteredIcons.map(item => {
                      const IconComp = item.icon;
                      const isSelected = icon === item.spec;

                      return (
                        <button
                          key={item.spec}
                          type="button"
                          class={`${styles.iconDropdownItem} ${isSelected ? styles.selectedIconItem : ''}`}
                          onClick={() => {
                            setIcon(item.spec);
                            setIsIconDropdownOpen(false);
                          }}
                          title={item.name}
                        >
                          <IconComp size={15} />
                          <span class={styles.iconItemName}>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
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
