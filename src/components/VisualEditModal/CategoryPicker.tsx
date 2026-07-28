import { h } from 'preact';
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
      <label class={styles.label}>Colonna / Categoria</label>
      <div class={styles.customSelectWrapper}>
        {!isCreatingNewCategory ? (
          <div
            class={styles.customSelectTrigger}
            onClick={() => onSetIsCategoryPickerOpen(!isCategoryPickerOpen)}
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
              onInput={e => onSetNewCategoryName((e.target as HTMLInputElement).value)}
              autoFocus
            />
            <button
              type="button"
              class={styles.confirmCatBtn}
              onClick={onCreateNewCategory}
            >
              Aggiungi
            </button>
            <button
              type="button"
              class={styles.cancelCatBtn}
              onClick={() => onSetIsCreatingNewCategory(false)}
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
                onClick={() => onSelectCategory(cat)}
              >
                <span>{cat}</span>
                {cat === category && <Check size={14} class={styles.checkIcon} />}
              </div>
            ))}
            <div
              class={`${styles.dropdownOption} ${styles.createOption}`}
              onClick={() => {
                onSetIsCreatingNewCategory(true);
                onSetIsCategoryPickerOpen(false);
              }}
            >
              <Plus size={14} />
              <span>Crea Nuova Categoria...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
