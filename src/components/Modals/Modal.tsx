import type { ComponentChildren } from 'preact';
import { createPortal } from 'preact/compat';
import { useEffect, useRef } from 'preact/hooks';
import { Icon } from '../Icon';
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
  /** Accessible name, required when the header is hidden (no visible title). */
  ariaLabel?: string | undefined;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

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
  hideHeader = false,
  ariaLabel,
}: ModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Open/close lifecycle: remember trigger, lock page scroll (with scrollbar
  // compensation), make the app tree inert, restore focus on close.
  useEffect(() => {
    if (!isOpen) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;

    const appRoot = document.getElementById('app');
    appRoot?.setAttribute('inert', '');

    // Measure the scrollbar gap BEFORE locking, then lock the document at
    // both html and body level. Setting only `body` overflow leaves
    // documentElement scrollable on several engines, so the background
    // could still move (and drift) behind the dialog.
    const prevScrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    const prevPaddingRight = document.body.style.paddingRight;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    if (scrollbarGap > 0) {
      document.body.style.paddingRight = `${scrollbarGap}px`;
    }

    return () => {
      appRoot?.removeAttribute('inert');
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
      document.body.style.touchAction = prevTouchAction;
      document.body.style.paddingRight = prevPaddingRight;
      // Put the page back exactly where it was, then restore focus without
      // triggering a scroll — no jump, no "shifted" background on close.
      try {
        window.scrollTo({ top: prevScrollY, left: 0, behavior: 'auto' });
      } catch {
        // jsdom lacks scrollTo; harmless in tests
      }
      restoreFocusRef.current?.focus?.({ preventScroll: true });
      restoreFocusRef.current = null;
    };
  }, [isOpen]);

  // Initial focus: explicit [autofocus] inside the dialog, otherwise the dialog itself.
  useEffect(() => {
    if (!isOpen) return;
    const container = containerRef.current;
    if (!container) return;
    const autofocusTarget = container.querySelector<HTMLElement>('[autofocus]');
    if (autofocusTarget) {
      autofocusTarget.focus();
    } else {
      container.focus();
    }
  }, [isOpen]);

  // Escape + focus trap: Tab/Shift+Tab cycle inside the dialog.
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const container = containerRef.current;
      if (!container) return;
      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(el => el.offsetParent !== null || el === document.activeElement);
      if (focusable.length === 0) {
        e.preventDefault();
        container.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey) {
        if (!active || active === first || !container.contains(active)) {
          e.preventDefault();
          last?.focus();
        }
      } else if (!active || active === last || !container.contains(active)) {
        e.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div class={styles.overlay} onClick={onClose}>
      <div
        ref={containerRef}
        class={`${styles.modalContainer} fade-in ${className}`}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        style={maxWidth ? { maxWidth } : undefined}
      >
        {!hideHeader && (title || icon || subtitle) && (
          <div class={styles.modalHeader}>
            <div class={styles.headerTitleGroup}>
              {icon && <div class={styles.headerIconBadge}>{icon}</div>}
              <div>
                {title && (
                  <h2 id="modal-title" class={styles.modalTitle}>
                    {title}
                  </h2>
                )}
                {subtitle && <span class={styles.modalSubtitle}>{subtitle}</span>}
              </div>
            </div>
            <button
              class={styles.closeBtn}
              onClick={onClose}
              type="button"
              title="Close (Esc)"
              aria-label="Close"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        )}
        <div class={`${styles.modalContent} ${contentClassName}`}>{children}</div>
        {footer && <div class={styles.modalFooter}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
};
