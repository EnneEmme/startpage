import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, test, vi } from 'vitest';
import { Modal } from '../src/components/Modals/Modal';

// Scroll lock is applied at both html and body level and must be fully
// released on close — otherwise the background page can move behind a dialog
// and stay "shifted" on exit.
test('locks scroll on html+body while open and restores position on close', () => {
  const handleClose = vi.fn();
  const scrollToSpy = vi.fn();
  Object.defineProperty(window, 'scrollY', { value: 420, configurable: true });
  window.scrollTo = scrollToSpy;

  const { rerender } = render(
    <Modal isOpen={true} onClose={handleClose} title="Scroll Modal">
      <div>Content</div>
    </Modal>,
  );

  expect(document.documentElement.style.overflow).toBe('hidden');
  expect(document.body.style.overflow).toBe('hidden');

  // Close → teardown must release html+body lock and restore the scroll offset
  rerender(
    <Modal isOpen={false} onClose={handleClose} title="Scroll Modal">
      <div>Content</div>
    </Modal>,
  );

  expect(document.documentElement.style.overflow).toBe('');
  expect(document.body.style.overflow).toBe('');
  expect(scrollToSpy).toHaveBeenCalled();
});

test('renders Modal component correctly when open', () => {
  render(
    <Modal isOpen={true} onClose={() => {}} title="Test Modal">
      <div>Modal Content</div>
    </Modal>,
  );

  expect(screen.getByText('Test Modal')).toBeDefined();
  expect(screen.getByText('Modal Content')).toBeDefined();
});

test('does not render when isOpen is false', () => {
  render(
    <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
      <div>Hidden Content</div>
    </Modal>,
  );

  expect(screen.queryByRole('dialog')).toBeNull();
});

test('calls onClose when close button is clicked', () => {
  const handleClose = vi.fn();
  render(
    <Modal isOpen={true} onClose={handleClose} title="Closeable Modal">
      <div>Content</div>
    </Modal>,
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
    </Modal>,
  );

  // Modal portals to document.body; the overlay wraps the dialog
  const dialog = screen.getByRole('dialog');
  const overlay = dialog.parentElement as HTMLElement;
  fireEvent.click(overlay);

  expect(handleClose).toHaveBeenCalledTimes(1);
});
