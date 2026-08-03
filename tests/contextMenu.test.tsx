import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, act, screen, within } from '@testing-library/preact';
import { ContextMenu } from '../src/components/ContextMenu';
import { confirmSignal, settleConfirm } from '../src/stores/confirmStore';
import type { LinkItem } from '../src/types/startpage';

describe('ContextMenu Component', () => {
  const sampleLink: LinkItem = {
    id: 'test_link',
    title: 'Test Link',
    url: 'https://example.com',
    aliases: ['test'],
    category: 'Dev',
  };

  it('renders context menu at cursor position with link title', () => {
    const { container } = render(
      <ContextMenu
        x={100}
        y={200}
        link={sampleLink}
        onClose={() => {}}
        onEdit={() => {}}
        onRemove={() => {}}
      />,
    );

    expect(container.textContent).toContain('Test Link');
    expect(container.textContent).toContain('Edit Link');
    expect(container.textContent).toContain('Remove Link');
    expect(container.textContent).toContain('Move Up');
    expect(container.textContent).toContain('Move Down');
  });

  it('triggers onEdit callback when Edit Link is clicked', () => {
    const onEditSpy = vi.fn();
    const onCloseSpy = vi.fn();

    const { getByText } = render(
      <ContextMenu
        x={100}
        y={200}
        link={sampleLink}
        onClose={onCloseSpy}
        onEdit={onEditSpy}
        onRemove={() => {}}
      />,
    );

    fireEvent.click(getByText('Edit Link'));
    expect(onEditSpy).toHaveBeenCalledWith(sampleLink);
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('opens the themed confirm dialog and triggers onRemove when confirmed', async () => {
    const onRemoveSpy = vi.fn();
    const onCloseSpy = vi.fn();

    const { getByText } = render(
      <ContextMenu
        x={100}
        y={200}
        link={sampleLink}
        onClose={onCloseSpy}
        onEdit={() => {}}
        onRemove={onRemoveSpy}
      />,
    );

    fireEvent.click(getByText('Remove Link'));
    expect(confirmSignal.value).not.toBeNull();
    expect(confirmSignal.value?.danger).toBe(true);

    act(() => settleConfirm(true));
    await Promise.resolve(); // flush the .then chain

    expect(onRemoveSpy).toHaveBeenCalledWith('test_link');
    expect(onCloseSpy).toHaveBeenCalled();
  });

  it('keeps the menu open when the themed confirm is cancelled', async () => {
    const onRemoveSpy = vi.fn();
    const onCloseSpy = vi.fn();

    const { getByText } = render(
      <ContextMenu
        x={100}
        y={200}
        link={sampleLink}
        onClose={onCloseSpy}
        onEdit={() => {}}
        onRemove={onRemoveSpy}
      />,
    );

    fireEvent.click(getByText('Remove Link'));
    act(() => settleConfirm(false));
    await Promise.resolve();

    expect(onRemoveSpy).not.toHaveBeenCalled();
    expect(onCloseSpy).not.toHaveBeenCalled();
  });

  it('closes when the backdrop swallowing layer is clicked', () => {
    const onCloseSpy = vi.fn();
    const { container } = render(
      <ContextMenu
        x={100}
        y={200}
        link={sampleLink}
        onClose={onCloseSpy}
        onEdit={() => {}}
        onRemove={() => {}}
      />,
    );

    const backdrop = container.querySelector('[class*="menuBackdrop"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });

  describe('ARIA menu pattern', () => {
    it('exposes menu/menuitem roles with an accessible name', () => {
      render(
        <ContextMenu
          x={100}
          y={200}
          link={sampleLink}
          onClose={() => {}}
          onEdit={() => {}}
          onRemove={() => {}}
          onReorderColumns={() => {}}
        />,
      );

      const menu = screen.getByRole('menu', { name: 'Actions for Test Link' });
      const items = within(menu).getAllByRole('menuitem');
      expect(items.map(i => i.textContent?.trim())).toEqual([
        'Edit Link',
        'Move Up',
        'Move Down',
        'Move Category...',
        'Reorder Columns...',
        'Remove Link',
      ]);
    });

    it('applies roving tabindex (first item 0, others -1) and focuses the first item on open', () => {
      render(
        <ContextMenu
          x={100}
          y={200}
          link={sampleLink}
          onClose={() => {}}
          onEdit={() => {}}
          onRemove={() => {}}
        />,
      );

      const items = screen.getAllByRole('menuitem');
      expect(items[0]!.tabIndex).toBe(0);
      items.slice(1).forEach(item => expect(item.tabIndex).toBe(-1));
      expect(document.activeElement).toBe(items[0]);
    });

    it('moves focus with ArrowDown/ArrowUp/Home/End (with wrap-around)', () => {
      render(
        <ContextMenu
          x={100}
          y={200}
          link={sampleLink}
          onClose={() => {}}
          onEdit={() => {}}
          onRemove={() => {}}
        />,
      );

      const menu = screen.getByRole('menu', { name: 'Actions for Test Link' });
      const items = within(menu).getAllByRole('menuitem');

      fireEvent.keyDown(menu, { key: 'ArrowDown' });
      expect(document.activeElement).toBe(items[1]);

      fireEvent.keyDown(menu, { key: 'ArrowUp' });
      expect(document.activeElement).toBe(items[0]);

      fireEvent.keyDown(menu, { key: 'End' });
      expect(document.activeElement).toBe(items[items.length - 1]);

      fireEvent.keyDown(menu, { key: 'Home' });
      expect(document.activeElement).toBe(items[0]);

      fireEvent.keyDown(menu, { key: 'ArrowUp' }); // wraps to last
      expect(document.activeElement).toBe(items[items.length - 1]);

      fireEvent.keyDown(menu, { key: 'ArrowDown' }); // wraps to first
      expect(document.activeElement).toBe(items[0]);
    });

    it('submenu trigger declares aria-haspopup=menu and toggles aria-expanded', () => {
      render(
        <ContextMenu
          x={100}
          y={200}
          link={sampleLink}
          onClose={() => {}}
          onEdit={() => {}}
          onRemove={() => {}}
        />,
      );

      const trigger = screen.getByText('Move Category...').closest('button')!;
      expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByRole('menu', { name: 'Move to category' })).toBeNull();

      fireEvent.click(trigger);
      expect(trigger.getAttribute('aria-expanded')).toBe('true');

      const submenu = screen.getByRole('menu', { name: 'Move to category' });
      expect(within(submenu).getAllByRole('menuitem').length).toBeGreaterThan(0);
    });

    it('closes on Escape and restores focus to the invoking element', () => {
      const invoker = document.createElement('button');
      invoker.textContent = 'invoking card';
      document.body.appendChild(invoker);
      invoker.focus();
      expect(document.activeElement).toBe(invoker);

      const onCloseSpy = vi.fn();
      const { unmount } = render(
        <ContextMenu
          x={100}
          y={200}
          link={sampleLink}
          onClose={onCloseSpy}
          onEdit={() => {}}
          onRemove={() => {}}
        />,
      );

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onCloseSpy).toHaveBeenCalledTimes(1);

      // the owning state unmounts the menu → focus returns to the invoker
      unmount();
      expect(document.activeElement).toBe(invoker);
      invoker.remove();
    });
  });
});
