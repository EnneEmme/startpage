// Explicit public API of the stores layer (no `export *`).

export { linksSignal, categoriesSignal, appActions } from './appStore';
export { themeConfigSignal, settingsActions } from './settingsStore';
export { toastSignal, showToast, dismissToast } from './toastStore';
export type { ToastPayload } from './toastStore';
export { confirmSignal, confirmDialog, settleConfirm } from './confirmStore';
export type { ConfirmRequest } from './confirmStore';
export {
  draggedLinkIdSignal,
  draggedCategoryNameSignal,
  dragOverCategoryIdSignal,
  dragOverLinkIdSignal,
  dropPositionSignal,
  justDroppedLinkIdSignal,
  dragStore,
} from './dragStore';
export type { DropPosition } from './dragStore';
