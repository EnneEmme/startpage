import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, test, vi } from 'vitest';
import { Modal } from '../src/components/Modals/Modal';

test('renders Modal component correctly when open', () => {
  render(
    <Modal isOpen={true} onClose={() => {}} title="Test Modal">
      <div>Modal Content</div>
    </Modal>
  );

  expect(screen.getByText('Test Modal')).toBeDefined();
  expect(screen.getByText('Modal Content')).toBeDefined();
});

test('does not render when isOpen is false', () => {
  render(
    <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
      <div>Hidden Content</div>
    </Modal>
  );

  expect(screen.queryByRole('dialog')).toBeNull();
});

test('calls onClose when close button is clicked', () => {
  const handleClose = vi.fn();
  render(
    <Modal isOpen={true} onClose={handleClose} title="Closeable Modal">
      <div>Content</div>
    </Modal>
  );

  // Selezione per nome accessibile (aria-label="Close"), non per title copy
  const closeButton = screen.getByRole('button', { name: 'Close' });
  fireEvent.click(closeButton);

  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('calls onClose when backdrop is clicked', () => {
  const handleClose = vi.fn();
  render(
    <Modal isOpen={true} onClose={handleClose} title="Backdrop Modal">
      <div>Content</div>
    </Modal>
  );

  // Modal portals to document.body; the overlay wraps the dialog
  const dialog = screen.getByRole('dialog');
  const overlay = dialog.parentElement as HTMLElement;
  fireEvent.click(overlay);

  expect(handleClose).toHaveBeenCalledTimes(1);
});
