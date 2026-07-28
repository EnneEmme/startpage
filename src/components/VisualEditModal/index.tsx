import { h, Fragment } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { X, Plus, Sliders, Globe, Zap, Search } from 'lucide-preact';
import { LinkItem } from '../../types/startpage';
import { resolveDynamicUrl } from '../../engine';
import { appActions, categoriesSignal } from '../../stores';
import styles from '../VisualEditModal.module.css';
import { searchLucideIcons } from '../iconRegistry';

import { PreviewPanel } from './PreviewPanel';
import { CategoryPicker } from './CategoryPicker';
import { ScriptEditor } from './ScriptEditor';
import { FormFields } from './FormFields';
import { Modal } from '../modals/Modal';

interface VisualEditModalProps {
  isOpen?: boolean;
  initialEditLink?: LinkItem | null;
  initialLink?: LinkItem | null;
  onClose: () => void;
  onSave?: () => void;
}

export const VisualEditModal = ({
  isOpen = true,
  initialEditLink,
  initialLink,
  onClose,
  onSave
}: VisualEditModalProps) => {
  const targetLink = initialEditLink || initialLink;
  const isEditing = Boolean(targetLink);

  const resolvedDisplayUrl = targetLink ? resolveDynamicUrl(targetLink.url, targetLink.dynamicUrlRule) : '';

  const [title, setTitle] = useState(targetLink?.title || '');
  const [url, setUrl] = useState(targetLink?.url || resolvedDisplayUrl || '');
  const [aliases, setAliases] = useState(targetLink?.aliases ? targetLink.aliases.join(', ') : '');
  const [icon, setIcon] = useState(targetLink?.icon || '');
  const [category, setCategory] = useState(targetLink?.category || 'General');

  const initialMode = targetLink?.isScript || targetLink?.scriptContent || (targetLink?.url && targetLink.url.toLowerCase().startsWith('javascript:'))
    ? 'script'
    : (targetLink?.searchTemplate || targetLink?.searchPath ? 'search' : 'web');

  const [activeTab, setActiveTab] = useState<'web' | 'script' | 'search'>(initialMode);
  const [scriptSnippet, setScriptSnippet] = useState<string>(
    targetLink?.scriptContent || (targetLink?.url?.toLowerCase().startsWith('javascript:') ? targetLink.url : '')
  );
  const [searchTemplate, setSearchTemplate] = useState(targetLink?.searchTemplate || targetLink?.searchPath || '');

  const [isCreatingNewCategory, setIsCreatingNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);

  const [isIconDropdownOpen, setIsIconDropdownOpen] = useState(false);
  const [iconSearchQuery, setIconSearchQuery] = useState('');

  useEffect(() => {
    if (targetLink) {
      setTitle(targetLink.title || '');
      setUrl(targetLink.url || resolveDynamicUrl(targetLink.url, targetLink.dynamicUrlRule) || '');
      setAliases(targetLink.aliases ? targetLink.aliases.join(', ') : '');
      setIcon(targetLink.icon || '');
      setCategory(targetLink.category || 'General');

      const isScript = Boolean(
        targetLink.isScript ||
        targetLink.scriptContent ||
        (targetLink.url && targetLink.url.toLowerCase().startsWith('javascript:'))
      );
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

  // Rules of hooks: the guard below must stay after every hook declaration.
  if (!isOpen) return null;

  const categories = categoriesSignal.value.map(c => c.name);

  const handleSelectCategory = (catName: string) => {
    setCategory(catName);
    setIsCategoryPickerOpen(false);
    setIsCreatingNewCategory(false);
  };

  const handleCreateNewCategory = () => {
    if (newCategoryName.trim()) {
      setCategory(newCategoryName.trim());
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

    // Edit must preserve position in column; only true additions go to the end
    if (isEditing) {
      appActions.updateLink(updatedLink);
    } else {
      appActions.addLink(updatedLink);
    }
    if (onSave) onSave();
    onClose();
  };

  const filteredIcons = searchLucideIcons(iconSearchQuery, 120);
  const firstAlias = aliases.split(',')[0]?.trim();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Link' : 'Add New Link'}
      subtitle="Configure links, JS scripts and search engines"
      icon={isEditing ? <Sliders size={18} /> : <Plus size={18} />}
      contentClassName={styles.formContent}
      hideHeader={false}
    >
      <form onSubmit={handleSubmit} class={styles.formContent}>
          <PreviewPanel
            title={title}
            url={url}
            icon={icon}
            firstAlias={firstAlias}
            activeTab={activeTab}
          />

          {/* Mode Tab Switcher Segmented Control */}
          <div class={styles.segmentedTabsWrapper}>
            <button
              type="button"
              class={`${styles.tabSegment} ${activeTab === 'web' ? styles.activeTabSegment : ''}`}
              onClick={() => setActiveTab('web')}
            >
              <Globe size={14} />
              <span>Standard Website</span>
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
              <span>Search Engine</span>
            </button>
          </div>

          <FormFields
            activeTab={activeTab}
            title={title} setTitle={setTitle}
            url={url} setUrl={setUrl}
            searchTemplate={searchTemplate} setSearchTemplate={setSearchTemplate}
            aliases={aliases} setAliases={setAliases}
            icon={icon} setIcon={setIcon}
            isIconDropdownOpen={isIconDropdownOpen} setIsIconDropdownOpen={setIsIconDropdownOpen}
            iconSearchQuery={iconSearchQuery} setIconSearchQuery={setIconSearchQuery}
            filteredIcons={filteredIcons}
          />

          {activeTab === 'script' && (
            <ScriptEditor scriptSnippet={scriptSnippet} setScriptSnippet={setScriptSnippet} />
          )}

          <CategoryPicker
            categories={categories}
            category={category}
            isCreatingNewCategory={isCreatingNewCategory}
            newCategoryName={newCategoryName}
            isCategoryPickerOpen={isCategoryPickerOpen}
            onSelectCategory={handleSelectCategory}
            onCreateNewCategory={handleCreateNewCategory}
            onSetIsCreatingNewCategory={setIsCreatingNewCategory}
            onSetNewCategoryName={setNewCategoryName}
            onSetIsCategoryPickerOpen={setIsCategoryPickerOpen}
          />

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
    </Modal>
  );
};
