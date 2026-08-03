import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen, within, act } from '@testing-library/preact';
import { VisualEditModal } from '../src/components/VisualEditModal';
import { dataStore } from '../src/engine/dataStore';
import { confirmSignal, settleConfirm } from '../src/stores/confirmStore';

describe('VisualEditModal Modular Architecture', () => {
  it('renders modal header correctly', () => {
    const onClose = vi.fn();
    render(<VisualEditModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Add New Link')).toBeTruthy();
  });

  it('can switch between tabs and show correct fields', () => {
    const onClose = vi.fn();
    render(<VisualEditModal isOpen={true} onClose={onClose} />);
    
    // Default is Web
    expect(screen.getByText('Website URL')).toBeTruthy();

    // Switch to Script
    const scriptBtn = screen.getByText('Script JS / Bookmarklet');
    fireEvent.click(scriptBtn);
    expect(screen.getByText('JavaScript Code / Bookmarklet')).toBeTruthy();

    // Switch to Search
    const searchBtn = screen.getByText('Search Engine');
    fireEvent.click(searchBtn);
    expect(screen.getByText('Site Base URL')).toBeTruthy();
    expect(screen.getByText('Search Parameter (Query Template)')).toBeTruthy();
  });

  it('can interact with the preview panel', () => {
    const onClose = vi.fn();
    render(<VisualEditModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText('Link Card Preview')).toBeTruthy();
  });

  describe('A6: tabs, dirty handling, category registration', () => {
    it('renders the mode switcher as an ARIA tablist with tabs and a tabpanel', () => {
      render(<VisualEditModal isOpen={true} onClose={vi.fn()} />);

      const tablist = screen.getByRole('tablist', { name: 'Link type' });
      const tabs = within(tablist).getAllByRole('tab');
      expect(tabs).toHaveLength(3);

      expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
      expect(tabs[0]!.getAttribute('aria-controls')).toBe('vem-panel-web');
      expect(tabs[0]!.tabIndex).toBe(0);
      expect(tabs[1]!.getAttribute('aria-selected')).toBe('false');
      expect(tabs[1]!.tabIndex).toBe(-1);

      const panel = screen.getByRole('tabpanel');
      expect(panel.id).toBe('vem-panel-web');
      expect(panel.getAttribute('aria-labelledby')).toBe('vem-tab-web');
    });

    it('switches tabs with ArrowRight/ArrowLeft (automatic activation)', () => {
      render(<VisualEditModal isOpen={true} onClose={vi.fn()} />);
      const tablist = screen.getByRole('tablist', { name: 'Link type' });
      const tabs = within(tablist).getAllByRole('tab');

      fireEvent.keyDown(tablist, { key: 'ArrowRight' });
      expect(tabs[1]!.getAttribute('aria-selected')).toBe('true');
      expect(screen.getByRole('tabpanel').id).toBe('vem-panel-script');
      expect(document.activeElement).toBe(tabs[1]);

      fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
      expect(tabs[0]!.getAttribute('aria-selected')).toBe('true');
      expect(screen.getByRole('tabpanel').id).toBe('vem-panel-web');
    });

    it('resets fields and accessory UI state on close → reopen', () => {
      const onClose = vi.fn();
      const { rerender } = render(<VisualEditModal isOpen={true} onClose={onClose} />);

      const titleInput = screen.getByPlaceholderText(/e.g. GitHub/i) as HTMLInputElement;
      fireEvent.input(titleInput, { target: { value: 'Dirty Title' } });

      // open an accessory dropdown so we can verify it resets too
      fireEvent.click(screen.getByText(/Pick \(/));
      expect(screen.queryByPlaceholderText(/Search \d+ Lucide icons/)).not.toBeNull();

      rerender(<VisualEditModal isOpen={false} onClose={onClose} />);
      rerender(<VisualEditModal isOpen={true} onClose={onClose} />);

      const reopenedTitle = screen.getByPlaceholderText(/e.g. GitHub/i) as HTMLInputElement;
      expect(reopenedTitle.value).toBe('');
      expect(screen.queryByPlaceholderText(/Search \d+ Lucide icons/)).toBeNull();
      expect(screen.getByRole('tabpanel').id).toBe('vem-panel-web');
    });

    it('registers a brand new category in the column order when adding a link', () => {
      dataStore.resetToDefault();
      const onClose = vi.fn();
      render(<VisualEditModal isOpen={true} onClose={onClose} />);

      fireEvent.input(screen.getByPlaceholderText(/e.g. GitHub, ChatGPT, Mail/i), {
        target: { value: 'Fresh Link' }
      });
      fireEvent.input(screen.getByPlaceholderText('e.g. https://www.youtube.com'), {
        target: { value: 'https://fresh.example.com' }
      });

      // Open the category dropdown and switch to "create new category" mode
      const trigger = screen.getByText('General').closest('button')!;
      fireEvent.click(trigger);
      fireEvent.click(screen.getByText('Create New Category...'));

      fireEvent.input(screen.getByLabelText('New category name'), {
        target: { value: 'TestCategoryXYZ' }
      });
      fireEvent.click(screen.getByText('Add'));

      fireEvent.click(screen.getByText('Create Link'));

      expect(onClose).toHaveBeenCalledTimes(1);
      expect(dataStore.getCategoryOrder()).toContain('TestCategoryXYZ');
      expect(
        dataStore.getLinks().some(l => l.title === 'Fresh Link' && l.category === 'TestCategoryXYZ')
      ).toBe(true);
    });

    it('asks "Discard changes?" when closing a dirty form, closes cleanly otherwise', async () => {
      const onClose = vi.fn();
      render(<VisualEditModal isOpen={true} onClose={onClose} />);

      const overlay = screen.getByRole('dialog').parentElement as HTMLElement;

      // Pristine form: overlay click closes immediately, no confirm
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
      onClose.mockClear();

      // Dirty form: overlay click opens the themed confirm instead
      fireEvent.input(screen.getByPlaceholderText(/e.g. GitHub, ChatGPT, Mail/i), {
        target: { value: 'Something typed' }
      });
      fireEvent.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
      expect(confirmSignal.value?.title).toBe('Discard changes?');
      expect(confirmSignal.value?.danger).toBe(true);

      // Cancel keeps the form open
      act(() => settleConfirm(false));
      await Promise.resolve();
      expect(onClose).not.toHaveBeenCalled();

      // Confirm discards and closes
      fireEvent.click(overlay);
      expect(confirmSignal.value?.title).toBe('Discard changes?');
      act(() => settleConfirm(true));
      await Promise.resolve();
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
