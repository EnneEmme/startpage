import { Icon } from './Icon';
import { confirmSignal, settleConfirm } from '../stores';
import { Modal } from './Modals/Modal';
import styles from './ConfirmDialog.module.css';

/**
 * Global themed confirm dialog host.
 * Replaces blocking native confirm() with a promise-based modal.
 */
export const ConfirmDialog = () => {
  const pending = confirmSignal.value;
  if (!pending) return null;

  return (
    <Modal
      isOpen={true}
      onClose={() => settleConfirm(false)}
      title={pending.title ?? 'Confirm action'}
      icon={<Icon name="AlertTriangle" size={18} />}
      maxWidth="420px"
      footer={
        <div class={styles.actions}>
          <button type="button" class={styles.cancelBtn} onClick={() => settleConfirm(false)}>
            {pending.cancelLabel ?? 'Cancel'}
          </button>
          <button
            type="button"
            class={`${styles.confirmBtn} ${pending.danger ? styles.dangerBtn : ''}`}
            onClick={() => settleConfirm(true)}
            autoFocus
          >
            {pending.confirmLabel ?? 'Confirm'}
          </button>
        </div>
      }
    >
      <p class={styles.message}>{pending.message}</p>
    </Modal>
  );
};
