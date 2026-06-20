import { useState, useCallback } from 'react';
import { getWeatherByCity } from '../../../services/weatherService';
import type { WeatherStackResponse } from '../types';

export interface UseWeatherReturn {
  weather: WeatherStackResponse | null;
  isLoading: boolean;
  error: string | null;
  fetchWeather: (city: string) => Promise<void>;
  clearError: () => void;
}

export function useWeather(): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherStackResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getWeatherByCity(city);
      setWeather(data);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred while fetching weather data.');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    weather,
    isLoading,
    error,
    fetchWeather,
    clearError,
  };
}
