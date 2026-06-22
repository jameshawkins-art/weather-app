// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeather } from '../useWeather';
import { getWeatherByCity } from '../../../../services/weatherService';
import { mockSuccessResponse } from '../../../../test/fixtures';
import type { ExtendedWeatherResponse, DailyWeatherData } from '../../types';

vi.mock('../../../../services/weatherService', () => ({
  getWeatherByCity: vi.fn(),
}));

describe('useWeather hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.weather).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastSearchedCity).toBeNull();
    expect(result.current.selectedDay).toBeNull();
  });

  it('should handle successful weather fetching', async () => {
    vi.mocked(getWeatherByCity).mockResolvedValueOnce(mockSuccessResponse);

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather('Cape Town');
    });

    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastSearchedCity).toBe('Cape Town');
    expect(getWeatherByCity).toHaveBeenCalledWith('Cape Town');
  });

  it('should handle API errors and set error state', async () => {
    const apiErrorMessage = 'WeatherStack API error 101: You have not supplied a valid API Access Key.';
    vi.mocked(getWeatherByCity).mockRejectedValueOnce(new Error(apiErrorMessage));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather('InvalidCity');
    });

    expect(result.current.weather).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(apiErrorMessage);
    expect(result.current.lastSearchedCity).toBeNull();
    expect(getWeatherByCity).toHaveBeenCalledWith('InvalidCity');
  });

  it('should handle generic errors and set generic message', async () => {
    vi.mocked(getWeatherByCity).mockRejectedValueOnce('Some string error');

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather('SomeCity');
    });

    expect(result.current.weather).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('An unexpected error occurred while fetching weather data.');
    expect(result.current.lastSearchedCity).toBeNull();
  });

  it('should clear the error state when clearError is called', async () => {
    vi.mocked(getWeatherByCity).mockRejectedValueOnce(new Error('Some error'));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather('SomeCity');
    });

    expect(result.current.error).toBe('Some error');

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('should maintain stable function references across rerenders', () => {
    const { result, rerender } = renderHook(() => useWeather());

    const firstFetch = result.current.fetchWeather;
    const firstClear = result.current.clearError;
    const firstSelect = result.current.selectDay;

    rerender();

    expect(result.current.fetchWeather).toBe(firstFetch);
    expect(result.current.clearError).toBe(firstClear);
    expect(result.current.selectDay).toBe(firstSelect);
  });

  it('should prevent duplicate concurrent requests for the same city', async () => {
    let resolvePromise: (value: ExtendedWeatherResponse) => void = () => { };
    const delayPromise = new Promise<ExtendedWeatherResponse>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(getWeatherByCity).mockReturnValue(delayPromise);

    const { result } = renderHook(() => useWeather());

    let firstCall: Promise<void>;
    let secondCall: Promise<void>;

    act(() => {
      firstCall = result.current.fetchWeather('Johannesburg');
      secondCall = result.current.fetchWeather('Johannesburg');
    });

    await act(async () => {
      resolvePromise(mockSuccessResponse);
      await Promise.all([firstCall, secondCall]);
    });

    expect(getWeatherByCity).toHaveBeenCalledTimes(1);
  });

  it('should preserve previous weather and lastSearchedCity when a subsequent search fails', async () => {
    vi.mocked(getWeatherByCity)
      .mockResolvedValueOnce(mockSuccessResponse)
      .mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWeather());

    // 1. Successful search
    await act(async () => {
      await result.current.fetchWeather('Cape Town');
    });
    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.lastSearchedCity).toBe('Cape Town');
    expect(result.current.error).toBeNull();

    // 2. Failed search
    await act(async () => {
      await result.current.fetchWeather('FailedCity');
    });
    // weather and lastSearchedCity should be preserved from the previous success
    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.lastSearchedCity).toBe('Cape Town');
    expect(result.current.error).toBe('Network error');
  });

  it('should update selectedDay when selectDay is called', () => {
    const { result } = renderHook(() => useWeather());
    
    const mockDay: DailyWeatherData = {
      date: '2026-06-22',
      dayName: 'Tomorrow',
      temperature: 25,
      weather_descriptions: ['Sunny'],
      weather_icons: ['https://example.com/icon.png'],
      wind_speed: 10,
      wind_dir: 'ENE',
      humidity: 50,
      feelslike: 24,
      uv_index: 5,
      visibility: 10,
      pressure: 1012,
    };

    act(() => {
      result.current.selectDay(mockDay);
    });

    expect(result.current.selectedDay).toEqual(mockDay);

    act(() => {
      result.current.selectDay(null);
    });

    expect(result.current.selectedDay).toBeNull();
  });

  it('should reset selectedDay to null when fetchWeather is called', async () => {
    vi.mocked(getWeatherByCity).mockResolvedValueOnce(mockSuccessResponse);

    const { result } = renderHook(() => useWeather());
    
    const mockDay: DailyWeatherData = {
      date: '2026-06-22',
      dayName: 'Tomorrow',
      temperature: 25,
      weather_descriptions: ['Sunny'],
      weather_icons: ['https://example.com/icon.png'],
      wind_speed: 10,
      wind_dir: 'ENE',
      humidity: 50,
      feelslike: 24,
      uv_index: 5,
      visibility: 10,
      pressure: 1012,
    };

    act(() => {
      result.current.selectDay(mockDay);
    });
    expect(result.current.selectedDay).toEqual(mockDay);

    await act(async () => {
      await result.current.fetchWeather('London');
    });

    expect(result.current.selectedDay).toBeNull();
  });

  it('should hydrate weather and lastSearchedCity from cache on mount', () => {
    const cachedItem = {
      data: mockSuccessResponse,
      timestamp: Date.now(),
    };
    localStorage.setItem('weather_last_searched_city', 'Cape Town');
    localStorage.setItem('weather_cache_cape town', JSON.stringify(cachedItem));

    const { result } = renderHook(() => useWeather());

    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.lastSearchedCity).toBe('Cape Town');
    expect(result.current.isStale).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should return cached data immediately on cache hit without calling API', async () => {
    const cachedItem = {
      data: mockSuccessResponse,
      timestamp: Date.now(),
    };
    localStorage.setItem('weather_cache_cape town', JSON.stringify(cachedItem));

    const { result } = renderHook(() => useWeather());

    await act(async () => {
      await result.current.fetchWeather('Cape Town');
    });

    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.isStale).toBe(false);
    expect(getWeatherByCity).not.toHaveBeenCalled();
  });

  it('should return stale data immediately, then update with fresh data on revalidation', async () => {
    const expiredTime = Date.now() - 20 * 60 * 1000; // 20 minutes ago
    const cachedItem = {
      data: mockSuccessResponse,
      timestamp: expiredTime,
    };
    localStorage.setItem('weather_cache_cape town', JSON.stringify(cachedItem));

    const freshResponse = {
      ...mockSuccessResponse,
      current: {
        ...mockSuccessResponse.current,
        temperature: 25,
      },
    };
    vi.mocked(getWeatherByCity).mockResolvedValueOnce(freshResponse);

    const { result } = renderHook(() => useWeather());

    let fetchPromise: Promise<void>;
    act(() => {
      fetchPromise = result.current.fetchWeather('Cape Town');
    });

    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.isStale).toBe(true);
    expect(result.current.isLoading).toBe(false);

    await act(async () => {
      await fetchPromise;
    });

    expect(result.current.weather).toEqual(freshResponse);
    expect(result.current.isStale).toBe(false);
    expect(getWeatherByCity).toHaveBeenCalledWith('Cape Town');
  });

  it('should retain stale cached data if background revalidation fails', async () => {
    const expiredTime = Date.now() - 20 * 60 * 1000;
    const cachedItem = {
      data: mockSuccessResponse,
      timestamp: expiredTime,
    };
    localStorage.setItem('weather_cache_cape town', JSON.stringify(cachedItem));

    vi.mocked(getWeatherByCity).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useWeather());

    let fetchPromise: Promise<void>;
    act(() => {
      fetchPromise = result.current.fetchWeather('Cape Town');
    });

    await act(async () => {
      await fetchPromise;
    });

    expect(result.current.weather).toEqual(mockSuccessResponse);
    expect(result.current.isStale).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should ignore revalidation response from a previous search if query changes', async () => {
    const expiredTime = Date.now() - 20 * 60 * 1000;
    const cachedParis = {
      data: {
        ...mockSuccessResponse,
        location: { ...mockSuccessResponse.location, name: 'Paris' },
      },
      timestamp: expiredTime,
    };
    localStorage.setItem('weather_cache_paris', JSON.stringify(cachedParis));

    let resolveParis: (value: any) => void = () => {};
    const parisPromise = new Promise<any>((resolve) => {
      resolveParis = resolve;
    });

    const berlinResponse = {
      ...mockSuccessResponse,
      location: { ...mockSuccessResponse.location, name: 'Berlin' },
    };

    vi.mocked(getWeatherByCity)
      .mockReturnValueOnce(parisPromise)
      .mockResolvedValueOnce(berlinResponse);

    const { result } = renderHook(() => useWeather());

    let firstSearch: Promise<void>;
    let secondSearch: Promise<void>;

    act(() => {
      firstSearch = result.current.fetchWeather('Paris');
    });
    expect(result.current.weather?.location.name).toBe('Paris');

    act(() => {
      secondSearch = result.current.fetchWeather('Berlin');
    });
    await act(async () => {
      await secondSearch;
    });
    expect(result.current.weather?.location.name).toBe('Berlin');

    await act(async () => {
      resolveParis({
        ...mockSuccessResponse,
        location: { ...mockSuccessResponse.location, name: 'Paris' },
        current: { ...mockSuccessResponse.current, temperature: 30 },
      });
      await firstSearch;
    });

    expect(result.current.weather?.location.name).toBe('Berlin');
  });
});

