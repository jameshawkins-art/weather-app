// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ErrorMessage } from '../ErrorMessage';

describe('ErrorMessage component', () => {
  afterEach(cleanup);
  it('renders a string message correctly', () => {
    render(<ErrorMessage message="Simple error message" />);
    expect(screen.getByText('Simple error message')).toBeDefined();
  });

  it('renders an Error object correctly', () => {
    const error = new Error('Error object message');
    render(<ErrorMessage message={error} />);
    expect(screen.getByText('Error object message')).toBeDefined();
  });

  it('renders a raw object with message or info property', () => {
    render(<ErrorMessage message={{ message: 'Nested message error' }} />);
    expect(screen.getByText('Nested message error')).toBeDefined();

    render(<ErrorMessage message={{ info: 'WeatherStack info error' }} />);
    expect(screen.getByText('WeatherStack info error')).toBeDefined();
  });

  it('sanitizes stack traces or multi-line messages to display only the first line', () => {
    const multiLineMessage = 'First line message\nStack trace: at line 45\n at line 90';
    render(<ErrorMessage message={multiLineMessage} />);
    expect(screen.getByText('First line message')).toBeDefined();
    expect(screen.queryByText(/Stack trace:/)).toBeNull();
  });

  it('renders default message for null, undefined, or empty object', () => {
    const { rerender } = render(<ErrorMessage message={null} />);
    expect(screen.getByText('An unexpected error occurred.')).toBeDefined();

    rerender(<ErrorMessage message={undefined} />);
    expect(screen.getByText('An unexpected error occurred.')).toBeDefined();

    rerender(<ErrorMessage message={{}} />);
    expect(screen.getByText('An unexpected error occurred.')).toBeDefined();
  });

  it('converts numbers and booleans to string representations', () => {
    const { rerender } = render(<ErrorMessage message={404} />);
    expect(screen.getByText('404')).toBeDefined();

    rerender(<ErrorMessage message={true} />);
    expect(screen.getByText('true')).toBeDefined();
  });

  it('calls onDismiss when the dismiss button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorMessage message="Some error" onDismiss={onDismiss} />);
    
    const button = screen.getByRole('button', { name: /dismiss error/i });
    expect(button).toBeDefined();
    
    fireEvent.click(button);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not render the dismiss button when onDismiss is not provided', () => {
    render(<ErrorMessage message="Some error" />);
    const button = screen.queryByRole('button', { name: /dismiss error/i });
    expect(button).toBeNull();
  });
});

