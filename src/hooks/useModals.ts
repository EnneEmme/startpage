import { useState } from 'preact/hooks';
import type { LinkItem } from '../types/startpage';

export type ModalId = 'search' | 'cheatsheet' | 'importExport' | 'visualEdit' | 'settings' | 'reorder';

/**
 * Discriminated modal state: at most one modal can be open at any time.
 * Impossible states (search over settings over cheatsheet...) are impossible
 * by construction — isAnyModalOpen is derived, never hand-maintained.
 */
export function useModals() {
  const [activeModal, setActiveModal] = useState<ModalId | null>(null);
  const [initialSearchChar, setInitialSearchChar] = useState<string>('');
  const [editTargetLink, setEditTargetLink] = useState<LinkItem | null>(null);

  const isAnyModalOpen = activeModal !== null;

  const isModalOpen = (id: ModalId): boolean => activeModal === id;

  const openModal = (id: ModalId): void => {
    if (id !== 'visualEdit') setEditTargetLink(null);
    setActiveModal(id);
  };

  const closeModal = (): void => {
    setActiveModal(null);
    setEditTargetLink(null);
  };

  const openVisualEdit = (link: LinkItem | null = null): void => {
    setEditTargetLink(link);
    setActiveModal('visualEdit');
  };

  /**
   * Toggle semantics for shortcut keys: only fires when nothing else is open,
   * or when the same modal is already open (closes it). Never switches modal.
   */
  const toggleModalExclusive = (id: ModalId): void => {
    setActiveModal(prev => {
      if (prev === null) return id;
      if (prev === id) return null;
      return prev;
    });
  };

  return {
    activeModal,
    isAnyModalOpen,
    isModalOpen,
    openModal,
    closeModal,
    openVisualEdit,
    toggleModalExclusive,
    initialSearchChar,
    setInitialSearchChar,
    editTargetLink,
  };
}
