/**
 * @module services/weatherCache
 * LocalStorage caching utility for weather queries with TTL invalidation.
 */

import type { ExtendedWeatherResponse } from '../features/weather/types';

interface CachedItem {
  data: ExtendedWeatherResponse;
  timestamp: number;
}

const CACHE_PREFIX = 'weather_cache_';
const DEFAULT_TTL = 15 * 60 * 1000;
const LAST_SEARCHED_KEY = 'weather_last_searched_city';

export const weatherCache = {

  getCacheInfo(city: string): { data: ExtendedWeatherResponse; isExpired: boolean; timestamp: number } | null {
    if (!city) return null;
    const key = `${CACHE_PREFIX}${city.toLowerCase().trim()}`;
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return null;

      const item: CachedItem = JSON.parse(itemStr);
      const isExpired = Date.now() - item.timestamp > DEFAULT_TTL;

      return { data: item.data, isExpired, timestamp: item.timestamp };
    } catch {
      try {
        localStorage.removeItem(key);
      } catch {
        // noop
      }
      return null;
    }
  },

  get(city: string): ExtendedWeatherResponse | null {
    const info = this.getCacheInfo(city);
    if (!info) return null;

    if (info.isExpired) {
      const key = `${CACHE_PREFIX}${city.toLowerCase().trim()}`;
      try {
        localStorage.removeItem(key);
      } catch {
        // noop
      }
      return null;
    }

    return info.data;
  },

  set(city: string, data: ExtendedWeatherResponse): void {
    if (!city || !data) return;
    const cleanCity = city.trim();
    const key = `${CACHE_PREFIX}${cleanCity.toLowerCase()}`;
    try {
      const item: CachedItem = {
        data,
        timestamp: Date.now(),
      };
      localStorage.setItem(key, JSON.stringify(item));
      this.setLastSearchedCity(cleanCity);
    } catch (e) {
      console.warn('LocalStorage quota exceeded or disabled:', e);
    }
  },

  getLastSearchedCity(): string | null {
    try {
      return localStorage.getItem(LAST_SEARCHED_KEY);
    } catch {
      return null;
    }
  },

  setLastSearchedCity(city: string): void {
    if (!city) return;
    try {
      localStorage.setItem(LAST_SEARCHED_KEY, city.trim());
    } catch (e) {
      console.warn('LocalStorage disabled or quota exceeded:', e);
    }
  },

  clearLastSearchedCity(): void {
    try {
      localStorage.removeItem(LAST_SEARCHED_KEY);
    } catch {
      // noop
    }
  }
};
