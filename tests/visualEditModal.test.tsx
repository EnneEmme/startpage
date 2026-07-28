import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/preact';
import { VisualEditModal } from '../src/components/VisualEditModal';
import { h } from 'preact';

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
});
