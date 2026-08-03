import { Tag, Check, Plus } from 'lucide-preact';
import styles from '../VisualEditModal.module.css';

interface CategoryPickerProps {
  categories: string[];
  category: string;
  isCreatingNewCategory: boolean;
  newCategoryName: string;
  isCategoryPickerOpen: boolean;
  onSelectCategory: (cat: string) => void;
  onCreateNewCategory: () => void;
  onSetIsCreatingNewCategory: (val: boolean) => void;
  onSetNewCategoryName: (val: string) => void;
  onSetIsCategoryPickerOpen: (val: boolean) => void;
}

export const CategoryPicker = ({
  categories, category, isCreatingNewCategory, newCategoryName,
  isCategoryPickerOpen, onSelectCategory, onCreateNewCategory,
  onSetIsCreatingNewCategory, onSetNewCategoryName, onSetIsCategoryPickerOpen
}: CategoryPickerProps) => {
  return (
    <div class={styles.fieldGroup}>
      <label class={styles.label} for="vem-category">Column / Category</label>
      <div class={styles.customSelectWrapper}>
        {!isCreatingNewCategory ? (
          <button
            id="vem-category"
            type="button"
            class={styles.customSelectTrigger}
            onClick={() => onSetIsCategoryPickerOpen(!isCategoryPickerOpen)}
            aria-expanded={isCategoryPickerOpen}
            aria-haspopup="listbox"
          >
            <span class={styles.selectedCategoryText}>
              <Tag size={14} class={styles.categoryTagIcon} />
              {category}
            </span>
            <span class={styles.arrowIcon}>{isCategoryPickerOpen ? '▲' : '▼'}</span>
          </button>
        ) : (
          <div class={styles.newCategoryInputWrapper}>
            <input
              type="text"
              class={styles.input}
              placeholder="New category name..."
              aria-label="New category name"
              value={newCategoryName}
              onInput={e => onSetNewCategoryName((e.target as HTMLInputElement).value)}
              autoFocus
            />
            <button
              type="button"
              class={styles.confirmCatBtn}
              onClick={onCreateNewCategory}
            >
              Add
            </button>
            <button
              type="button"
              class={styles.cancelCatBtn}
              onClick={() => onSetIsCreatingNewCategory(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {isCategoryPickerOpen && !isCreatingNewCategory && (
          <div class={`${styles.customDropdownMenu} fade-in`} role="listbox" aria-label="Available categories">
            {categories.map(cat => (
              <div
                key={cat}
                role="option"
                aria-selected={cat === category}
                class={`${styles.dropdownOption} ${cat === category ? styles.activeOption : ''}`}
                onClick={() => onSelectCategory(cat)}
              >
                <span>{cat}</span>
                {cat === category && <Check size={14} class={styles.checkIcon} />}
              </div>
            ))}
            <div
              role="option"
              aria-selected={false}
              class={`${styles.dropdownOption} ${styles.createOption}`}
              onClick={() => {
                onSetIsCreatingNewCategory(true);
                onSetIsCategoryPickerOpen(false);
              }}
            >
              <Plus size={14} />
              <span>Create New Category...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
