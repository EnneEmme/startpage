import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import {
  X, Check, Plus, Tag, Mail, Globe, Search, MessageSquare, Sparkles, Bot, Cpu, Send,
  Tv, Music, Film, Code, Terminal, Calendar, FileText, Share2, Video, Image, BookOpen,
  Zap, Star, Heart, Folder, Link as LinkIconComponent, Shield, Box, Compass, Activity, Layers, Grid, Database,
  Server, HardDrive, Cloud, Lock, Unlock, Key, Eye, Settings, Sliders, Wrench, Feather,
  PenTool, Play, Pause, Volume2, Radio, Headphones, Bookmark, Flag, Bell, Award,
  Briefcase, ShoppingBag, DollarSign, CreditCard, BarChart2, PieChart, TrendingUp, Target,
  Crosshair, Sun, Moon, Smile, ThumbsUp, Flame, MapPin, Maximize2, Minimize2
} from 'lucide-preact';
import { LinkItem } from '../types/startpage';
import { dataStore } from '../engine/dataStore';
import { resolveDynamicUrl } from '../engine/dynamicEvaluator';
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
  { name: 'Terminal', spec: 'Terminal', category: 'Dev', icon: Terminal },
  { name: 'Code', spec: 'Code', category: 'Dev', icon: Code },
  { name: 'Sparkles', spec: 'Sparkles', category: 'AI', icon: Sparkles },
  { name: 'Bot', spec: 'Bot', category: 'AI', icon: Bot },
  { name: 'Cpu', spec: 'Cpu', category: 'AI', icon: Cpu },
  { name: 'Zap', spec: 'Zap', category: 'Dev', icon: Zap },
  { name: 'Database', spec: 'Database', category: 'Dev', icon: Database },
  { name: 'Server', spec: 'Server', category: 'Dev', icon: Server },
  { name: 'HardDrive', spec: 'HardDrive', category: 'Dev', icon: HardDrive },
  { name: 'Cloud', spec: 'Cloud', category: 'Dev', icon: Cloud },
  { name: 'Lock', spec: 'Lock', category: 'Security', icon: Lock },
  { name: 'Unlock', spec: 'Unlock', category: 'Security', icon: Unlock },
  { name: 'Key', spec: 'Key', category: 'Security', icon: Key },
  { name: 'Shield', spec: 'Shield', category: 'Security', icon: Shield },
  { name: 'Box', spec: 'Box', category: 'Dev', icon: Box },
  { name: 'Layers', spec: 'Layers', category: 'Dev', icon: Layers },
  { name: 'Grid', spec: 'Grid', category: 'Dev', icon: Grid },
  { name: 'Activity', spec: 'Activity', category: 'Dev', icon: Activity },
  { name: 'Compass', spec: 'Compass', category: 'Dev', icon: Compass },

  // Communication & Social
  { name: 'Mail', spec: 'Mail', category: 'Social', icon: Mail },
  { name: 'Send', spec: 'Send', category: 'Social', icon: Send },
  { name: 'MessageSquare', spec: 'MessageSquare', category: 'Social', icon: MessageSquare },
  { name: 'Share2', spec: 'Share2', category: 'Social', icon: Share2 },
  { name: 'Globe', spec: 'Globe', category: 'Social', icon: Globe },
  { name: 'Link', spec: 'Link', category: 'Social', icon: LinkIconComponent },
  { name: 'Tag', spec: 'Tag', category: 'Social', icon: Tag },
  { name: 'Flag', spec: 'Flag', category: 'Social', icon: Flag },
  { name: 'Bell', spec: 'Bell', category: 'Social', icon: Bell },
  { name: 'Award', spec: 'Award', category: 'Social', icon: Award },
  { name: 'Briefcase', spec: 'Briefcase', category: 'Social', icon: Briefcase },
  { name: 'Heart', spec: 'Heart', category: 'Social', icon: Heart },
  { name: 'Smile', spec: 'Smile', category: 'Social', icon: Smile },
  { name: 'ThumbsUp', spec: 'ThumbsUp', category: 'Social', icon: ThumbsUp },

  // Media & Entertainment
  { name: 'Tv', spec: 'Tv', category: 'Media', icon: Tv },
  { name: 'Music', spec: 'Music', category: 'Media', icon: Music },
  { name: 'Film', spec: 'Film', category: 'Media', icon: Film },
  { name: 'Video', spec: 'Video', category: 'Media', icon: Video },
  { name: 'Image', spec: 'Image', category: 'Media', icon: Image },
  { name: 'Radio', spec: 'Radio', category: 'Media', icon: Radio },
  { name: 'Headphones', spec: 'Headphones', category: 'Media', icon: Headphones },
  { name: 'Play', spec: 'Play', category: 'Media', icon: Play },
  { name: 'Pause', spec: 'Pause', category: 'Media', icon: Pause },
  { name: 'Volume2', spec: 'Volume2', category: 'Media', icon: Volume2 },
  { name: 'Flame', spec: 'Flame', category: 'Media', icon: Flame },
  { name: 'Sun', spec: 'Sun', category: 'Media', icon: Sun },
  { name: 'Moon', spec: 'Moon', category: 'Media', icon: Moon },

  // Office & Education
  { name: 'Calendar', spec: 'Calendar', category: 'Office', icon: Calendar },
  { name: 'FileText', spec: 'FileText', category: 'Office', icon: FileText },
  { name: 'BookOpen', spec: 'BookOpen', category: 'Office', icon: BookOpen },
  { name: 'Folder', spec: 'Folder', category: 'Office', icon: Folder },
  { name: 'Search', spec: 'Search', category: 'Office', icon: Search },
  { name: 'Bookmark', spec: 'Bookmark', category: 'Office', icon: Bookmark },
  { name: 'BarChart2', spec: 'BarChart2', category: 'Office', icon: BarChart2 },
  { name: 'PieChart', spec: 'PieChart', category: 'Office', icon: PieChart },
  { name: 'TrendingUp', spec: 'TrendingUp', category: 'Office', icon: TrendingUp },
  { name: 'Target', spec: 'Target', category: 'Office', icon: Target },
  { name: 'Crosshair', spec: 'Crosshair', category: 'Office', icon: Crosshair },
  { name: 'DollarSign', spec: 'DollarSign', category: 'Office', icon: DollarSign },
  { name: 'CreditCard', spec: 'CreditCard', category: 'Office', icon: CreditCard },
  { name: 'ShoppingBag', spec: 'ShoppingBag', category: 'Office', icon: ShoppingBag },

  // Tools & Settings
  { name: 'Settings', spec: 'Settings', category: 'Tools', icon: Settings },
  { name: 'Sliders', spec: 'Sliders', category: 'Tools', icon: Sliders },
  { name: 'Wrench', spec: 'Wrench', category: 'Tools', icon: Wrench },
  { name: 'Feather', spec: 'Feather', category: 'Tools', icon: Feather },
  { name: 'PenTool', spec: 'PenTool', category: 'Tools', icon: PenTool },
  { name: 'Star', spec: 'Star', category: 'Tools', icon: Star },
  { name: 'MapPin', spec: 'MapPin', category: 'Tools', icon: MapPin },
  { name: 'Eye', spec: 'Eye', category: 'Tools', icon: Eye },
  { name: 'Maximize2', spec: 'Maximize2', category: 'Tools', icon: Maximize2 },
  { name: 'Minimize2', spec: 'Minimize2', category: 'Tools', icon: Minimize2 }
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

  // Prefill URL cleanly (resolved if dynamic)
  const resolvedDisplayUrl = targetLink ? resolveDynamicUrl(targetLink.url, targetLink.dynamicUrlRule) : '';

  const [title, setTitle] = useState(targetLink?.title || '');
  const [url, setUrl] = useState(targetLink?.url || resolvedDisplayUrl || '');
  const [aliases, setAliases] = useState(targetLink?.aliases ? targetLink.aliases.join(', ') : '');
  const [icon, setIcon] = useState(targetLink?.icon || '');
  const [category, setCategory] = useState(targetLink?.category || 'General');

  // Link Mode Tab State: 'web' | 'script' | 'search'
  const initialMode = targetLink?.isScript || (targetLink?.url && targetLink.url.toLowerCase().startsWith('javascript:'))
    ? 'script'
    : (targetLink?.searchTemplate || targetLink?.searchPath ? 'search' : 'web');

  const [activeTab, setActiveTab] = useState<'web' | 'script' | 'search'>(initialMode);
  const [scriptSnippet, setScriptSnippet] = useState<string>(
    targetLink?.scriptContent || (targetLink?.url?.toLowerCase().startsWith('javascript:') ? targetLink.url : '')
  );
  const [searchTemplate, setSearchTemplate] = useState(targetLink?.searchTemplate || targetLink?.searchPath || '');

  // Custom Category State
  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  // Icon Picker Dropdown State
  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  // Re-populate modal state whenever targetLink prop changes
  useEffect(() => {
    if (targetLink) {
      setTitle(targetLink.title || '');
      setUrl(targetLink.url || resolveDynamicUrl(targetLink.url, targetLink.dynamicUrlRule) || '');
      setAliases(targetLink.aliases ? targetLink.aliases.join(', ') : '');
      setIcon(targetLink.icon || '');
      setCategory(targetLink.category || 'General');

      const isScript = Boolean(targetLink.isScript || (targetLink.url && targetLink.url.toLowerCase().startsWith('javascript:')));
      const isSearch = Boolean(targetLink.searchTemplate || targetLink.searchPath);

      setActiveTab(isScript ? 'script' : (isSearch ? 'search' : 'web'));
      setScriptSnippet(targetLink.scriptContent || (targetLink.url?.toLowerCase().startsWith('javascript:') ? targetLink.url : ''));
      setSearchTemplate(targetLink.searchTemplate || targetLink.searchPath || '');
    } else {
      setTitle('');
      setUrl('');
      setAliases('');
      setIcon('');
      setCategory('General');
      setActiveTab('web');
      setScriptSnippet('');
      setSearchTemplate('');
    }
  }, [targetLink]);

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
    if (!title.trim()) return;

    const parsedAliases = aliases
      .split(',')
      .map(a => a.trim().toLowerCase())
      .filter(Boolean);

    const linkId = targetLink?.id || `link_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const targetCat = isCreatingNewCategory && newCategoryName.trim() ? newCategoryName.trim() : category;

    let finalUrl = url.trim();
    let finalScriptContent: string | undefined = undefined;
    const isScriptMode = activeTab === 'script';
    const isSearchMode = activeTab === 'search';

    if (isScriptMode) {
      const code = scriptSnippet.trim();
      finalScriptContent = code;
      finalUrl = code.toLowerCase().startsWith('javascript:') ? code : `javascript:${encodeURI(code)}`;
    }

    // Preserve dynamic rules if url was not manually altered
    const finalDynamicRule = targetLink?.dynamicUrlRule;

    const updatedLink: LinkItem = {
      id: linkId,
      title: title.trim(),
      url: finalUrl,
      aliases: parsedAliases,
      category: targetCat || 'General',
      icon: icon.trim() || undefined,
      isScript: isScriptMode || undefined,
      scriptContent: finalScriptContent,
      dynamicUrlRule: finalDynamicRule,
      searchTemplate: isSearchMode && searchTemplate.trim() ? searchTemplate.trim() : undefined
    };

    dataStore.addLink(updatedLink);
    if (onSave) onSave();
    if (onConfigChanged) onConfigChanged();
    onClose();
  };

  const filteredIcons = PRESET_ICONS.filter(i =>
    i.name.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
    i.spec.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
    i.category.toLowerCase().includes(iconSearchQuery.toLowerCase())
  );

  const firstAlias = aliases.split(',')[0]?.trim();

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div class={`${styles.modalContainer} fade-in`} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div class={styles.modalHeader}>
          <div class={styles.headerTitleGroup}>
            <div class={styles.headerIconBadge}>
              {isEditing ? <Sliders size={18} /> : <Plus size={18} />}
            </div>
            <div>
              <h2 class={styles.modalTitle}>{isEditing ? 'Edit Link' : 'Add New Link'}</h2>
              <span class={styles.modalSubtitle}>Configura collegamenti, script JS e motori di ricerca</span>
            </div>
          </div>
          <button class={styles.closeBtn} onClick={onClose} type="button" title="Chiudi (Esc)">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} class={styles.formContent}>
          {/* Real-Time Live Preview Card */}
          <div class={styles.previewBox}>
            <div class={styles.previewHeader}>
              <Eye size={14} class={styles.previewIcon} />
              <span>Anteprima Card Link</span>
            </div>

            <div class={styles.previewCardRow}>
              <div class={styles.previewIconContainer}>
                <LinkIcon
                  url={url || 'https://example.com'}
                  iconSpec={icon || undefined}
                  title={title || 'Anteprima Link'}
                  size={18}
                />
              </div>

              <div class={styles.previewInfo}>
                <span class={styles.previewTitle}>
                  {title || 'Titolo del Link'}
                  {activeTab === 'script' && <Zap size={11} style={{ marginLeft: '4px', color: '#f59e0b', display: 'inline-block' }} />}
                </span>
              </div>

              {firstAlias && (
                <span class={styles.previewAliasBadge}>
                  {firstAlias}
                </span>
              )}
            </div>
          </div>

          {/* Mode Tab Switcher Segmented Control */}
          <div class={styles.segmentedTabsWrapper}>
            <button
              type="button"
              class={`${styles.tabSegment} ${activeTab === 'web' ? styles.activeTabSegment : ''}`}
              onClick={() => setActiveTab('web')}
            >
              <Globe size={14} />
              <span>Sito Web Standard</span>
            </button>

            <button
              type="button"
              class={`${styles.tabSegment} ${activeTab === 'script' ? styles.activeTabSegment : ''}`}
              onClick={() => setActiveTab('script')}
            >
              <Zap size={14} />
              <span>Script JS / Bookmarklet</span>
            </button>

            <button
              type="button"
              class={`${styles.tabSegment} ${activeTab === 'search' ? styles.activeTabSegment : ''}`}
              onClick={() => setActiveTab('search')}
            >
              <Search size={14} />
              <span>Motore di Ricerca</span>
            </button>
          </div>

          {/* Title Input */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Titolo del Link</label>
            <input
              type="text"
              class={styles.input}
              placeholder="e.g. GitHub, ChatGPT, Mail..."
              value={title}
              onInput={e => setTitle((e.target as HTMLInputElement).value)}
              required
            />
          </div>

          {/* Dynamic Field Based on Selected Mode */}
          {activeTab === 'web' && (
            <div class={styles.fieldGroup}>
              <label class={styles.label}>URL Sito Web</label>
              <input
                type="text"
                class={styles.input}
                placeholder="e.g. https://www.youtube.com"
                value={url}
                onInput={e => setUrl((e.target as HTMLInputElement).value)}
                required
              />
            </div>
          )}

          {activeTab === 'script' && (
            <div class={styles.fieldGroup}>
              <label class={styles.label}>Codice JavaScript / Bookmarklet</label>
              <textarea
                class={styles.input}
                style={{ minHeight: '85px', fontFamily: 'var(--font-mono)', fontSize: '0.84rem' }}
                placeholder="es. alert('Hello World') oppure javascript:(function(){...})();"
                value={scriptSnippet}
                onInput={e => setScriptSnippet((e.target as HTMLInputElement).value)}
                required
              />
              <span class={styles.helperText}>
                Puoi inserire sia codice JS diretto (es. <code>alert("Test")</code>) che bookmarklet (es. <code>javascript:void(0)</code>).
              </span>
            </div>
          )}

          {activeTab === 'search' && (
            <>
              <div class={styles.fieldGroup}>
                <label class={styles.label}>URL Base del Sito</label>
                <input
                  type="text"
                  class={styles.input}
                  placeholder="e.g. https://www.youtube.com"
                  value={url}
                  onInput={e => setUrl((e.target as HTMLInputElement).value)}
                  required
                />
              </div>

              <div class={styles.fieldGroup}>
                <label class={styles.label}>Parametro di Ricerca (Search Query Template)</label>
                <input
                  type="text"
                  class={styles.input}
                  placeholder="es. /results?search_query={q}  oppure  /search?q={q}"
                  value={searchTemplate}
                  onInput={e => setSearchTemplate((e.target as HTMLInputElement).value)}
                  required
                />
                <span class={styles.helperText}>
                  Inserisci il percorso con il segnaposto <code>{"{"}q{"}"}</code> (es. <code>/results?search_query={"{"}q{"}"}</code>).
                </span>
              </div>
            </>
          )}

          {/* Category Dropdown Picker */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Colonna / Categoria</label>
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
                    placeholder="Nome nuova categoria..."
                    value={newCategoryName}
                    onInput={e => setNewCategoryName((e.target as HTMLInputElement).value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    class={styles.confirmCatBtn}
                    onClick={handleCreateNewCategory}
                  >
                    Aggiungi
                  </button>
                  <button
                    type="button"
                    class={styles.cancelCatBtn}
                    onClick={() => setIsCreatingNewCategory(false)}
                  >
                    Annulla
                  </button>
                </div>
              )}

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
                    <span>Crea Nuova Categoria...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Aliases */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Scorciatoie / Alias da Tastiera (separati da virgola)</label>
            <input
              type="text"
              class={styles.input}
              placeholder="es. g, gh, github, yt"
              value={aliases}
              onInput={e => setAliases((e.target as HTMLInputElement).value)}
            />
          </div>

          {/* Icon Picker Dropdown */}
          <div class={styles.fieldGroup}>
            <label class={styles.label}>Icona Personalizzata</label>
            <div class={styles.iconDropdownWrapper}>
              <div class={styles.iconInputTriggerRow}>
                <div class={styles.iconLiveBadge}>
                  <LinkIcon
                    url={url || 'https://example.com'}
                    iconSpec={icon || undefined}
                    title={title || 'Preview'}
                    size={20}
                  />
                </div>
                <input
                  type="text"
                  class={styles.input}
                  placeholder="Nome Lucide oppure URL Immagine..."
                  value={icon}
                  onInput={e => setIcon((e.target as HTMLInputElement).value)}
                />
                <button
                  type="button"
                  class={styles.iconPickerToggleBtn}
                  onClick={() => setIsIconDropdownOpen(!isIconDropdownOpen)}
                >
                  Scegli ({PRESET_ICONS.length}) ▼
                </button>
              </div>

              {isIconDropdownOpen && (
                <div class={`${styles.iconDropdownMenu} fade-in`}>
                  <div class={styles.iconSearchHeader}>
                    <input
                      type="text"
                      class={styles.iconSearchInput}
                      placeholder="Cerca oltre 75+ icone (Dev, Social, Media)..."
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
