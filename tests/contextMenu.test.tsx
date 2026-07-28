import { describe, it, expect, vi } from 'vitest';
import { h } from 'preact';
import { render, fireEvent, act } from '@testing-library/preact';
import { ContextMenu } from '../src/components/ContextMenu';
import { confirmSignal, settleConfirm } from '../src/stores/confirmStore';
import { LinkItem } from '../src/types/startpage';

describe('ContextMenu Component', () => {
  const sampleLink: LinkItem = {
    id: 'test_link',
    title: 'Test Link',
    url: 'https://example.com',
    aliases: ['test'],
    category: 'Dev'
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
        onConfigChanged={() => {}}
      />
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
        onConfigChanged={() => {}}
      />
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
        onConfigChanged={() => {}}
      />
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
        onConfigChanged={() => {}}
      />
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
        onConfigChanged={() => {}}
      />
    );

    const backdrop = container.querySelector('[class*="menuBackdrop"]');
    expect(backdrop).not.toBeNull();
    fireEvent.click(backdrop!);
    expect(onCloseSpy).toHaveBeenCalledTimes(1);
  });
});
