// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from '../SearchBar';

describe('SearchBar component', () => {
  it('renders input with accessibility features', () => {
    render(<SearchBar onSearch={() => { }} isLoading={false} />);

    const searchForm = screen.getByRole('search');
    expect(searchForm).toBeDefined();

    const input = screen.getByLabelText('Search for a city') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.placeholder).toBe('Search for a city...');
  });

  it('trims whitespace and submits non-empty city name', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);
    const input = screen.getByLabelText('Search for a city') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '  London  ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('London');
  });

  it('does not submit empty city names', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);
    const input = screen.getByLabelText('Search for a city') as HTMLInputElement;

    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not submit whitespace-only city names', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={false} />);
    const input = screen.getByLabelText('Search for a city') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '    ' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not submit if isLoading is true', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} isLoading={true} />);
    const input = screen.getByLabelText('Search for a city') as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'Paris' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
    expect(onSearch).not.toHaveBeenCalled();
  });
});
