import { iconComponentFor } from './iconRegistry';
import styles from './ActionToolbar.module.css';

interface ActionToolbarProps {
  variant: 'header' | 'bottomNav';
  onOpenSearch: () => void;
  onOpenCheatsheet: () => void;
  onOpenVisualEdit: () => void;
  onOpenSettings: () => void;
}

/**
 * Single source for the four app-level action buttons (search, cheatsheet,
 * settings, add/edit link). Rendered as the header bubble on desktop and as
 * the floating bottom nav on <1024px — visibility is CSS-driven per variant.
 */
export const ActionToolbar = ({
  variant,
  onOpenSearch,
  onOpenCheatsheet,
  onOpenVisualEdit,
  onOpenSettings,
}: ActionToolbarProps) => {
  const isNav = variant === 'bottomNav';
  const iconSize = isNav ? 20 : 16;

  const actions = [
    { label: 'Fuzzy Search (Press any key)', Icon: iconComponentFor('Search'), onClick: onOpenSearch },
    {
      label: 'Shortcuts Cheatsheet (? or F1)',
      Icon: iconComponentFor('CircleQuestionMark'),
      onClick: onOpenCheatsheet,
    },
    { label: 'Settings & Themes', Icon: iconComponentFor('Settings'), onClick: onOpenSettings },
    { label: 'Add or Edit Links (Shift+N)', Icon: iconComponentFor('PenLine'), onClick: onOpenVisualEdit },
  ];

  const buttons = actions.map(({ label, Icon, onClick }) => (
    <button
      key={label}
      type="button"
      class={styles.iconBtn}
      onClick={onClick}
      // Space must not activate these modal-trigger buttons (Enter still
      // works): a focused toolbar button should never fire on an accidental
      // Space scroll, and it should not flash a "selected" (active) state.
      onKeyDown={e => {
        if (e.key === ' ') e.preventDefault();
      }}
      title={label}
      aria-label={label}
    >
      <Icon size={iconSize} />
    </button>
  ));

  if (isNav) {
    return (
      <nav class={styles.floatingBottomNav} aria-label="Mobile Navigation">
        {buttons}
      </nav>
    );
  }

  return <div class={styles.topRightTools}>{buttons}</div>;
};
