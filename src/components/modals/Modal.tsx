import type { ComponentChildren } from 'preact';
import { useEffect } from 'preact/hooks';
import { X } from 'lucide-preact';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: ComponentChildren;
  children: ComponentChildren;
  footer?: ComponentChildren;
  maxWidth?: string;
  className?: string;
  contentClassName?: string | undefined;
  hideHeader?: boolean;
}

export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxWidth,
  className = '',
  contentClassName = '',
  hideHeader = false
}: ModalProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div class={styles.overlay} onClick={onClose}>
      <div 
        class={`${styles.modalContainer} fade-in ${className}`} 
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {!hideHeader && (title || icon || subtitle) && (
          <div class={styles.modalHeader}>
            <div class={styles.headerTitleGroup}>
              {icon && (
                <div class={styles.headerIconBadge}>
                  {icon}
                </div>
              )}
              <div>
                {title && <h2 id="modal-title" class={styles.modalTitle}>{title}</h2>}
                {subtitle && <span class={styles.modalSubtitle}>{subtitle}</span>}
              </div>
            </div>
            <button class={styles.closeBtn} onClick={onClose} type="button" title="Close (Esc)" aria-label="Close">
              <X size={18} />
            </button>
          </div>
        )}
        <div class={`${styles.modalContent} ${contentClassName}`}>
          {children}
        </div>
        {footer && (
          <div class={styles.modalFooter}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
