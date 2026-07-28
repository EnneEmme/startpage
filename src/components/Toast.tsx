import { X } from 'lucide-preact';
import { toastSignal, dismissToast } from '../stores/toastStore';
import styles from './Toast.module.css';

/** Global snackbar host: renders the current toast with optional action (Undo). */
export const Toast = () => {
  const toast = toastSignal.value;
  if (!toast) return null;

  return (
    <div class={styles.toastHost} role="status" aria-live="polite">
      <span class={styles.toastMessage}>{toast.message}</span>
      {toast.actionLabel && toast.onAction && (
        <button
          type="button"
          class={styles.toastAction}
          onClick={() => {
            toast.onAction?.();
            dismissToast();
          }}
        >
          {toast.actionLabel}
        </button>
      )}
      <button
        type="button"
        class={styles.toastDismiss}
        onClick={dismissToast}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
};
