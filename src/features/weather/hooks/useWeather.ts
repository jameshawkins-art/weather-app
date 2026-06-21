import { useState, useCallback, useRef } from 'react';
import { getWeatherByCity } from '../../../services/weatherService';
import type { WeatherStackResponse } from '../types';

export interface UseWeatherReturn {
  weather: WeatherStackResponse | null;
  isLoading: boolean;
  error: string | null;
  lastSearchedCity: string | null;
  fetchWeather: (city: string) => Promise<void>;
  clearError: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherStackResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchedCity, setLastSearchedCity] = useState<string | null>(null);

  const activeRequestRef = useRef<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    if (activeRequestRef.current === city) {
      return;
    }

    activeRequestRef.current = city;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
      setLastSearchedCity(city);
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weather,
    isLoading,
    error,
    lastSearchedCity,
    fetchWeather,
    clearError,
  };
}

