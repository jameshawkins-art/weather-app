// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeatherCard } from '../WeatherCard';
import { mockSuccessResponse } from '../../../../test/fixtures';

describe('WeatherCard component', () => {
  it('renders city name and country', () => {
    render(<WeatherCard data={mockSuccessResponse} />);
    expect(screen.getByText('Cape Town')).toBeDefined();
    expect(screen.getByText(/South Africa/)).toBeDefined();
  });

  it('renders temperature', () => {
    render(<WeatherCard data={mockSuccessResponse} />);
    expect(screen.getByText('18')).toBeDefined();
    expect(screen.getAllByText('°C').length).toBeGreaterThan(0);
  });

  it('renders all weather detail items (humidity, wind, etc.)', () => {
    render(<WeatherCard data={mockSuccessResponse} />);

    expect(screen.getByText('Feels Like')).toBeDefined();
    expect(screen.getByText('17')).toBeDefined();

    expect(screen.getByText('Humidity')).toBeDefined();
    expect(screen.getByText('65')).toBeDefined();

    expect(screen.getByText('Wind')).toBeDefined();
    expect(screen.getByText('15 km/h')).toBeDefined();

    expect(screen.getByText('UV Index')).toBeDefined();
    expect(screen.getByText('4')).toBeDefined();

    expect(screen.getByText('Visibility')).toBeDefined();
    expect(screen.getByText('10')).toBeDefined();

    expect(screen.getByText('Pressure')).toBeDefined();
    expect(screen.getByText('1015')).toBeDefined();
  });

  it('renders day title when present', () => {
    const mockWithDayTitle = {
      ...mockSuccessResponse,
      current: {
        ...mockSuccessResponse.current,
        day_title: 'Tomorrow',
      },
    };
    render(<WeatherCard data={mockWithDayTitle} />);
    expect(screen.getByText('Tomorrow')).toBeDefined();
  });

  it('does not render day title tag when day_title is absent', () => {
    render(<WeatherCard data={mockSuccessResponse} />);
    expect(screen.queryByTestId('weather-card-day-title')).toBeNull();
  });
});
