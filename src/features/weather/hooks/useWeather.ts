import { useState, useCallback, useRef, useEffect } from 'react';
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
  dataSource: 'network' | 'cache' | 'pwa-cache' | null;
  cachedAt: number | null;
  ttlRemaining: number | null;
  revalidationError: string | null;
  isOffline: boolean;
  isPWAActive: boolean;
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

  const [dataSource, setDataSource] = useState<'network' | 'cache' | 'pwa-cache' | null>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    if (lastCity) {
      const info = weatherCache.getCacheInfo(lastCity);
      return info ? 'cache' : null;
    }
    return null;
  });

  const [cachedAt, setCachedAt] = useState<number | null>(() => {
    const lastCity = weatherCache.getLastSearchedCity();
    if (lastCity) {
      const info = weatherCache.getCacheInfo(lastCity);
      return info ? info.timestamp : null;
    }
    return null;
  });

  const [ttlRemaining, setTtlRemaining] = useState<number | null>(null);
  const [revalidationError, setRevalidationError] = useState<string | null>(null);

  const [isOffline, setIsOffline] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined') {
      return !navigator.onLine;
    }
    return false;
  });

  const [isPWAActive, setIsPWAActive] = useState<boolean>(() => {
    if (typeof navigator !== 'undefined' && navigator.serviceWorker) {
      return !!navigator.serviceWorker.controller;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const checkPwa = () => {
      if (navigator.serviceWorker) {
        setIsPWAActive(!!navigator.serviceWorker.controller);
      }
    };
    checkPwa();
    const pwaInterval = setInterval(checkPwa, 2000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(pwaInterval);
    };
  }, []);

  useEffect(() => {
    if (!cachedAt) {
      setTtlRemaining(null);
      return;
    }

    const updateTtl = () => {
      const DEFAULT_TTL = 15 * 60 * 1000;
      const elapsed = Date.now() - cachedAt;
      const remaining = Math.max(0, DEFAULT_TTL - elapsed);
      setTtlRemaining(remaining);
    };

    updateTtl();
    const interval = setInterval(updateTtl, 1000);
    return () => clearInterval(interval);
  }, [cachedAt]);

  const activeRequestRef = useRef<string | null>(null);

  const fetchWeather = useCallback(async (city: string) => {
    if (activeRequestRef.current === city) {
      return;
    }

    activeRequestRef.current = city;
    setError(null);
    setRevalidationError(null);
    setSelectedDay(null);

    const cacheInfo = weatherCache.getCacheInfo(city);
    const hasCache = cacheInfo !== null;

    if (hasCache) {
      setWeather(cacheInfo.data);
      setLastSearchedCity(city);
      weatherCache.setLastSearchedCity(city);
      setIsStale(cacheInfo.isExpired);
      setDataSource('cache');
      setCachedAt(cacheInfo.timestamp);
      setIsLoading(false);

      if (!cacheInfo.isExpired) {
        activeRequestRef.current = null;
        return;
      }
    } else {
      setIsLoading(true);
      setIsStale(false);
      setDataSource(null);
      setCachedAt(null);
    }

    try {
      const data = await getWeatherByCity(city);
      if (activeRequestRef.current === city) {
        setWeather(data);
        setLastSearchedCity(city);
        weatherCache.set(city, data);
        setIsStale(false);
        setRevalidationError(null);
        if (!navigator.onLine) {
          setDataSource('pwa-cache');
        } else {
          setDataSource('network');
        }
        setCachedAt(Date.now());
      }
    } catch (err) {
      if (activeRequestRef.current === city) {
        if (hasCache) {
          setIsStale(true);
          const msg = err instanceof Error ? err.message : String(err);
          setRevalidationError(msg);
          console.warn('Network update failed, displaying stale cache:', err);
          setDataSource('cache');
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
    setRevalidationError(null);
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
    dataSource,
    cachedAt,
    ttlRemaining,
    revalidationError,
    isOffline,
    isPWAActive,
  };
}


