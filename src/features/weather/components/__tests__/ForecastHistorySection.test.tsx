// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ForecastHistorySection } from '../ForecastHistorySection';
import { mockForecast, mockHistory, mockWeatherData } from '../../../../test/fixtures';

describe('ForecastHistorySection Component', () => {
  it('renders all section headers and tiles with labels and temperatures', () => {
    render(
      <ForecastHistorySection
        weather={mockWeatherData}
        selectedDay={null}
        onSelectDay={() => {}}
      />
    );

    // Verify sections headers
    expect(screen.getByText('3-Day History')).toBeDefined();
    expect(screen.getByText('3-Day Forecast')).toBeDefined();
    expect(screen.getByText('Current')).toBeDefined();

    // Verify Today/Current tile renders
    expect(screen.getByText('Today')).toBeDefined();
    expect(screen.getByText('18°C')).toBeDefined();

    // Verify all history tiles render
    expect(screen.getByText('Yesterday')).toBeDefined();
    expect(screen.getByText('2 Days Ago')).toBeDefined();
    expect(screen.getByText('3 Days Ago')).toBeDefined();
    expect(screen.getByText('17°C')).toBeDefined();
    expect(screen.getByText('16°C')).toBeDefined();
    expect(screen.getByText('15°C')).toBeDefined();

    // Verify all forecast tiles render
    expect(screen.getByText('Tomorrow')).toBeDefined();
    expect(screen.getByText('Monday')).toBeDefined();
    expect(screen.getByText('Tuesday')).toBeDefined();
    expect(screen.getByText('20°C')).toBeDefined();
    expect(screen.getByText('22°C')).toBeDefined();
    expect(screen.getByText('21°C')).toBeDefined();
  });

  it('triggers selection callback with correct data when history or forecast tiles are clicked', () => {
    const onSelectDay = vi.fn();
    render(
      <ForecastHistorySection
        weather={mockWeatherData}
        selectedDay={null}
        onSelectDay={onSelectDay}
      />
    );

    // Click "Tomorrow" tile (which is first in forecast)
    const tomorrowTile = screen.getByLabelText(/Weather for Tomorrow/i);
    fireEvent.click(tomorrowTile);

    expect(onSelectDay).toHaveBeenCalledTimes(1);
    expect(onSelectDay).toHaveBeenCalledWith(mockForecast[0]);

    // Click "Yesterday" tile (which is first in history)
    const yesterdayTile = screen.getByLabelText(/Weather for Yesterday/i);
    fireEvent.click(yesterdayTile);

    expect(onSelectDay).toHaveBeenCalledTimes(2);
    expect(onSelectDay).toHaveBeenCalledWith(mockHistory[0]);
  });

  it('triggers selection callback with null when Today (Current) reset tile is clicked', () => {
    const onSelectDay = vi.fn();
    
    // Start with a selected day (Tomorrow)
    render(
      <ForecastHistorySection
        weather={mockWeatherData}
        selectedDay={mockForecast[0]}
        onSelectDay={onSelectDay}
      />
    );

    // Click Today/Current tile
    const currentTile = screen.getByLabelText(/Current weather/i);
    fireEvent.click(currentTile);

    expect(onSelectDay).toHaveBeenCalledTimes(1);
    expect(onSelectDay).toHaveBeenCalledWith(null);
  });
});
