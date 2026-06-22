import { useState, useCallback, useRef } from 'react';
import { getWeatherByCity, weatherCache } from '../../../services';
import type { ExtendedWeatherResponse, DailyWeatherData } from '../types';

export interface UseWeatherReturn {
  weather: ExtendedWeatherResponse | null;
  isLoading: boolean;
  error: string | null;
  lastSearchedCity: string | null;
  selectedDay: DailyWeatherData | null;
  fetchWeather: (city: string) => Promise<void>;
  selectDay: (day: DailyWeatherData | null) => void;
  clearError: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<ExtendedWeatherResponse | null>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    return lastCity ? weatherCache.get(lastCity) : null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string | null>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    if (lastCity) {
      const cached = weatherCache.get(lastCity);
      return cached ? lastCity : null;
    }
    return null;
  });
  const [selectedDay, setSelectedDay] = useState<DailyWeatherData | null>(null);

  const activeRequestRef = useRef<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    if (activeRequestRef.current === city) {
      return;
    }

    activeRequestRef.current = city;
    setIsLoading(true);
    setError(null);
    setSelectedDay(null);

    // Check localStorage cache
    const cached = weatherCache.get(city);
    if (cached) {
      setWeather(cached);
      setLastSearchedCity(city);
      weatherCache.setLastSearchedCity(city);
      setIsLoading(false);
      activeRequestRef.current = null;
      return;
    }

    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
      setLastSearchedCity(city);
      weatherCache.set(city, data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching weather data.');
      }
    } finally {
      if (activeRequestRef.current === city) {
        activeRequestRef.current = null;
        setIsLoading(false);
      }
    }
  }, []);

  const selectDay = useCallback((day: DailyWeatherData | null) => {
    setSelectedDay(day);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weather,
    isLoading,
    error,
    lastSearchedCity,
    selectedDay,
    fetchWeather,
    selectDay,
    clearError,
  };
}


