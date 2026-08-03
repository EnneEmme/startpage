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

// Returning focus to the page container (not the trigger button) so a
// floating toolbar trigger never keeps a selection ring / Space activation
// after the dialog closes.
test('close returns focus to #app container, not the trigger button', () => {
  const handleClose = vi.fn();
  document.body.innerHTML = '<div id="app" tabindex="-1"></div>';

  const trigger = document.createElement('button');
  trigger.tabIndex = 0;
  trigger.textContent = 'Open';
  document.body.appendChild(trigger);
  trigger.focus();

  const { rerender } = render(
    <Modal isOpen={true} onClose={handleClose} title="Focus Modal">
      <div>Content</div>
    </Modal>,
  );

  rerender(
    <Modal isOpen={false} onClose={handleClose} title="Focus Modal">
      <div>Content</div>
    </Modal>,
  );

  expect(document.activeElement).not.toBe(trigger);
  const appRoot = document.getElementById('app');
  expect(appRoot).not.toBeNull();
  expect(document.activeElement).toBe(appRoot);
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
