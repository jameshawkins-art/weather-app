// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useWeather } from '../useWeather';
import { getWeatherByCity } from '../../../../services/weatherService';
import { mockSuccessResponse } from '../../../../test/fixtures';
import type { ExtendedWeatherResponse } from '../../types';

vi.mock('../../../../services/weatherService', () => ({
  getWeatherByCity: vi.fn(),
}));

describe('useWeather hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default states', () => {
    const { result } = renderHook(() => useWeather());

    expect(result.current.weather).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastSearchedCity).toBeNull();
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

    rerender();

    expect(result.current.fetchWeather).toBe(firstFetch);
    expect(result.current.clearError).toBe(firstClear);
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
});

