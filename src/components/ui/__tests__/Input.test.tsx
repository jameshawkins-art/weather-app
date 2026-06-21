// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Input } from '../Input';

describe('Input component', () => {
  afterEach(cleanup);

  it('renders with placeholder', () => {
    render(<Input placeholder="Search for a city..." />);
    const inputElement = screen.getByPlaceholderText('Search for a city...');
    expect(inputElement).toBeDefined();
  });

  it('calls onSubmit when Enter is pressed with value', () => {
    const onSubmit = vi.fn();
    render(<Input onSubmit={onSubmit} placeholder="Search..." />);
    const inputElement = screen.getByPlaceholderText('Search...') as HTMLInputElement;

    fireEvent.change(inputElement, { target: { value: 'Paris' } });
    expect(inputElement.value).toBe('Paris');

    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).toHaveBeenCalledWith('Paris');
  });

  it('does not call onSubmit when input is empty or only whitespace', () => {
    const onSubmit = vi.fn();
    render(<Input onSubmit={onSubmit} placeholder="Search..." />);
    const inputElement = screen.getByPlaceholderText('Search...') as HTMLInputElement;

    // Default empty
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();

    // Whitespace only
    fireEvent.change(inputElement, { target: { value: '   ' } });
    fireEvent.keyDown(inputElement, { key: 'Enter', code: 'Enter' });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Input placeholder="Search..." className="custom-class-123" />);
    const inputElement = screen.getByPlaceholderText('Search...');
    expect(inputElement.className).toContain('custom-class-123');
  });
});
