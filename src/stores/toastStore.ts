import { signal } from '@preact/signals';

export interface ToastPayload {
  id: number;
  message: string;
  actionLabel?: string | undefined;
  onAction?: (() => void) | undefined;
  duration: number;
}

export const toastSignal = signal<ToastPayload | null>(null);

const DEFAULT_DURATION = 4500;
let dismissTimer: ReturnType<typeof setTimeout> | null = null;

export const dismissToast = (): void => {
  if (dismissTimer !== null) {
    clearTimeout(dismissTimer);
    dismissTimer = null;
  }
  toastSignal.value = null;
};

/**
 * Shows a transient snackbar. An optional action (e.g. Undo) can be attached;
 * showing a new toast replaces the current one.
 */
export const showToast = (
  message: string,
  options: { actionLabel?: string; onAction?: () => void; duration?: number } = {}
): void => {
  dismissToast();
  toastSignal.value = {
    id: Date.now(),
    message,
    actionLabel: options.actionLabel,
    onAction: options.onAction,
    duration: options.duration ?? DEFAULT_DURATION
  };
  dismissTimer = setTimeout(() => {
    toastSignal.value = null;
    dismissTimer = null;
  }, options.duration ?? DEFAULT_DURATION);
};
