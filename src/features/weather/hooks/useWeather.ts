import { useState, useCallback, useRef } from 'react';
import { getWeatherByCity, weatherCache } from '../../../services';
import type { ExtendedWeatherResponse, DailyWeatherData } from '../types';

export interface UseWeatherReturn {
  weather: ExtendedWeatherResponse | null;
  isLoading: boolean;
  error: string | null;
  lastSearchedCity: string | null;
  selectedDay: DailyWeatherData | null;
  isStale: boolean;
  fetchWeather: (city: string) => Promise<void>;
  selectDay: (day: DailyWeatherData | null) => void;
  clearError: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<ExtendedWeatherResponse | null>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    if (lastCity) {
      const info = weatherCache.getCacheInfo(lastCity);
      return info ? info.data : null;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string | null>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    if (lastCity) {
      const info = weatherCache.getCacheInfo(lastCity);
      return info ? lastCity : null;
    }
    return null;
  });
  const [selectedDay, setSelectedDay] = useState<DailyWeatherData | null>(null);
  const [isStale, setIsStale] = useState<boolean>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    if (lastCity) {
      const info = weatherCache.getCacheInfo(lastCity);
      return info ? info.isExpired : false;
    }
    return false;
  });

  const activeRequestRef = useRef<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    if (activeRequestRef.current === city) {
      return;
    }

    activeRequestRef.current = city;
    setError(null);
    setSelectedDay(null);

    const cacheInfo = weatherCache.getCacheInfo(city);
    const hasCache = cacheInfo !== null;

    if (hasCache) {
      setWeather(cacheInfo.data);
      setLastSearchedCity(city);
      weatherCache.setLastSearchedCity(city);
      setIsStale(cacheInfo.isExpired);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      setIsStale(false);
    }

    try {
      const data = await getWeatherByCity(city);
      if (activeRequestRef.current === city) {
        setWeather(data);
        setLastSearchedCity(city);
        weatherCache.set(city, data);
        setIsStale(false);
      }
    } catch (err) {
      if (activeRequestRef.current === city) {
        if (hasCache) {
          setIsStale(true);
          console.warn('Network update failed, displaying stale cache:', err);
        } else {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('An unexpected error occurred while fetching weather data.');
          }
        }
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
    isStale,
    fetchWeather,
    selectDay,
    clearError,
  };
}


