import { signal } from '@preact/signals';

export interface ConfirmRequest {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (ok: boolean) => void;
}

export const confirmSignal = signal<PendingConfirm | null>(null);

/**
 * Themed, non-blocking replacement for native window.confirm().
 * Resolves true on confirm, false on cancel/dismiss.
 */
export const confirmDialog = (request: ConfirmRequest): Promise<boolean> => {
  // A pending dialog is superseded (treated as dismissed) by the new request
  if (confirmSignal.value) {
    confirmSignal.value.resolve(false);
  }
  return new Promise<boolean>(resolve => {
    confirmSignal.value = { ...request, resolve };
  });
};

export const settleConfirm = (ok: boolean): void => {
  const pending = confirmSignal.value;
  confirmSignal.value = null;
  pending?.resolve(ok);
};
