import { h } from 'preact';
import { render, screen, fireEvent } from '@testing-library/preact';
import { expect, test, vi } from 'vitest';
import { Modal } from '../src/components/modals/Modal';

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
  const { container } = render(
    <Modal isOpen={false} onClose={() => {}} title="Hidden Modal">
      <div>Hidden Content</div>
    </Modal>
  );

  expect(container.innerHTML).toBe('');
});

test('calls onClose when close button is clicked', () => {
  const handleClose = vi.fn();
  render(
    <Modal isOpen={true} onClose={handleClose} title="Closeable Modal">
      <div>Content</div>
    </Modal>
  );

  const closeButton = screen.getByTitle('Close (Esc)');
  fireEvent.click(closeButton);

  expect(handleClose).toHaveBeenCalledTimes(1);
});

test('calls onClose when backdrop is clicked', () => {
  const handleClose = vi.fn();
  const { container } = render(
    <Modal isOpen={true} onClose={handleClose} title="Backdrop Modal">
      <div>Content</div>
    </Modal>
  );

  // The overlay is the first child of the container wrapper
  const overlay = container.firstChild as HTMLElement;
  fireEvent.click(overlay);

  expect(handleClose).toHaveBeenCalledTimes(1);
});
