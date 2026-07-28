import { describe, it, expect, vi } from 'vitest';
import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import { ContextMenu } from '../src/components/ContextMenu';
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

  it('triggers onRemove callback when Remove Link is confirmed in English', () => {
    const onRemoveSpy = vi.fn();
    const onCloseSpy = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

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
    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to remove this link?');
    expect(onRemoveSpy).toHaveBeenCalledWith('test_link');
    expect(onCloseSpy).toHaveBeenCalled();

    vi.restoreAllMocks();
  });

  it('keeps the menu open when removal confirm is cancelled', () => {
    const onRemoveSpy = vi.fn();
    const onCloseSpy = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(false);

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
    expect(onRemoveSpy).not.toHaveBeenCalled();
    expect(onCloseSpy).not.toHaveBeenCalled();

    vi.restoreAllMocks();
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
