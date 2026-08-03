import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, fireEvent, screen, act } from '@testing-library/preact';
import { ImportExportModal } from '../src/components/ImportExportModal';
import { appActions, linksSignal } from '../src/stores';
import { confirmSignal, settleConfirm } from '../src/stores/confirmStore';
import { dataStore } from '../src/engine/dataStore';
import { rankStorage } from '../src/engine/rankStorage';

// NOTE merge-stability: import payloads in this suite contain ONLY plain
// links (never isScript / javascript: URLs) so the tests stay green when the
// parallel security branch starts stripping scripts on import.
const PLAIN_LINK = {
  id: 'imported-link-1',
  title: 'Imported Test Link',
  url: 'https://imported.example.com',
  aliases: ['itl'],
  category: 'ImportedCat'
};

const validBackupJson = () =>
  JSON.stringify({
    config: { commands: [PLAIN_LINK] },
    categoryOrder: ['ImportedCat'],
    ranks: {}
  });

describe('ImportExportModal', () => {
  beforeEach(() => {
    dataStore.resetToDefault();
    rankStorage.clear();
    act(() => settleConfirm(false)); // settle any dangling confirm from a previous test
  });

  it('renders the dialog with export controls and the JSON textarea when open', () => {
    render(<ImportExportModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByRole('dialog', { name: 'Data Management: Backup & Restore' })).not.toBeNull();
    expect(screen.getByRole('textbox')).not.toBeNull(); // the JSON textarea
    expect(screen.getByRole('button', { name: 'Export JSON' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Apply & Import JSON' })).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Reset Default' })).not.toBeNull();
  });

  it('renders nothing when closed', () => {
    const { container } = render(<ImportExportModal isOpen={false} onClose={vi.fn()} />);
    expect(container.firstChild).toBeNull();
  });

  it('Export JSON fills the textarea with config.commands and ranks', () => {
    render(<ImportExportModal isOpen={true} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole('button', { name: 'Export JSON' }));

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    const exported = JSON.parse(textarea.value);
    expect(Array.isArray(exported.config.commands)).toBe(true);
    expect(exported.config.commands.length).toBeGreaterThan(0);
    expect(exported).toHaveProperty('ranks');
    expect(typeof exported.ranks).toBe('object');
    // Success feedback shown to the user
    expect(screen.getByText('Configuration exported successfully!')).not.toBeNull();
  });

  it('importing valid JSON (plain links) makes the new link visible in linksSignal', () => {
    render(<ImportExportModal isOpen={true} onClose={vi.fn()} />);
    expect(linksSignal.value.some(l => l.title === 'Imported Test Link')).toBe(false);

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: validBackupJson() } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply & Import JSON' }));

    expect(screen.getByText('Configuration imported and applied successfully!')).not.toBeNull();
    const imported = linksSignal.value.find(l => l.title === 'Imported Test Link');
    expect(imported).toBeDefined();
    expect(imported!.url).toBe('https://imported.example.com');
    expect(imported!.category).toBe('ImportedCat');
  });

  it('importing malformed JSON shows an error banner and leaves links untouched', () => {
    render(<ImportExportModal isOpen={true} onClose={vi.fn()} />);
    const before = linksSignal.value.map(l => l.id).join(',');

    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.input(textarea, { target: { value: '{{{not valid json' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply & Import JSON' }));

    expect(screen.getByText('Failed to parse JSON. Please check JSON syntax.')).not.toBeNull();
    expect(linksSignal.value.map(l => l.id).join(',')).toBe(before);
  });

  it('Reset Default requires the themed confirm, then restores defaults (no window.confirm)', async () => {
    appActions.addLink({
      id: 'custom-pre-reset',
      title: 'Custom Pre Reset',
      url: 'https://custom.example.com',
      aliases: [],
      category: 'Social'
    });
    expect(linksSignal.value.some(l => l.id === 'custom-pre-reset')).toBe(true);

    render(<ImportExportModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset Default' }));

    // Themed confirm through confirmStore: data is NOT reset before confirming
    expect(confirmSignal.value).not.toBeNull();
    expect(confirmSignal.value?.title).toBe('Reset to defaults');
    expect(confirmSignal.value?.danger).toBe(true);
    expect(linksSignal.value.some(l => l.id === 'custom-pre-reset')).toBe(true);

    act(() => settleConfirm(true));
    await Promise.resolve(); // flush the confirm .then chain

    expect(linksSignal.value.some(l => l.id === 'custom-pre-reset')).toBe(false);
    expect(dataStore.getLinks().some(l => l.id === 'mail')).toBe(true);
  });

  it('cancelling the reset confirm keeps the current links', async () => {
    render(<ImportExportModal isOpen={true} onClose={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Reset Default' }));

    act(() => settleConfirm(false));
    await Promise.resolve();

    // Defaults still in place, no reset happened, no success banner appeared
    expect(dataStore.getLinks().some(l => l.id === 'mail')).toBe(true);
    expect(screen.queryByText('Reset to default configuration complete.')).toBeNull();
  });
});
