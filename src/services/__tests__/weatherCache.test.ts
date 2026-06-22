import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { weatherCache } from '../weatherCache';
import { mockWeatherData } from '../../test/fixtures';

describe('weatherCache utility', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should successfully store and retrieve items from cache', () => {
    weatherCache.set('Cape Town', mockWeatherData);

    const cached = weatherCache.get('Cape Town');
    expect(cached).toEqual(mockWeatherData);

    // Should be case-insensitive and trim whitespaces
    const cachedCase = weatherCache.get('  cApE ToWn  ');
    expect(cachedCase).toEqual(mockWeatherData);
  });

  it('should return null and remove item from localStorage if TTL has expired', () => {
    vi.useFakeTimers();
    const mockTime = new Date('2026-06-22T07:00:00Z');
    vi.setSystemTime(mockTime);

    weatherCache.set('London', mockWeatherData);
    expect(weatherCache.get('London')).toEqual(mockWeatherData);

    // Advance system time by 16 minutes (TTL is 15 minutes)
    const futureTime = new Date(mockTime.getTime() + 16 * 60 * 1000);
    vi.setSystemTime(futureTime);

    const expiredResult = weatherCache.get('London');
    expect(expiredResult).toBeNull();

    // Key should be evicted from storage
    expect(localStorage.getItem('weather_cache_london')).toBeNull();
  });

  it('should handle corrupted JSON data gracefully by evicting the key and returning null', () => {
    const key = 'weather_cache_tokyo';
    localStorage.setItem(key, '{corrupted-json-data');

    const result = weatherCache.get('Tokyo');
    expect(result).toBeNull();
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should manage last searched city correctly', () => {
    // Initially null
    expect(weatherCache.getLastSearchedCity()).toBeNull();

    weatherCache.setLastSearchedCity('Paris');
    expect(weatherCache.getLastSearchedCity()).toBe('Paris');

    // Setting cache should also update last searched city
    weatherCache.set('Berlin', mockWeatherData);
    expect(weatherCache.getLastSearchedCity()).toBe('Berlin');

    weatherCache.clearLastSearchedCity();
    expect(weatherCache.getLastSearchedCity()).toBeNull();
  });

  it('should handle empty, null, or undefined values gracefully without throwing', () => {
    // Retrieval edge cases
    expect(weatherCache.get('')).toBeNull();
    expect(weatherCache.get(null as any)).toBeNull();
    expect(weatherCache.get(undefined as any)).toBeNull();

    // Storage edge cases
    expect(() => weatherCache.set('', mockWeatherData)).not.toThrow();
    expect(() => weatherCache.set('Berlin', null as any)).not.toThrow();
    expect(() => weatherCache.setLastSearchedCity('')).not.toThrow();
    expect(() => weatherCache.setLastSearchedCity(null as any)).not.toThrow();
  });

  it('should handle localStorage availability failures gracefully', () => {
    const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError: LocalStorage blocked');
    });
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(weatherCache.get('London')).toBeNull();
    expect(() => weatherCache.set('London', mockWeatherData)).not.toThrow();
    expect(() => weatherCache.setLastSearchedCity('Berlin')).not.toThrow();

    getItemSpy.mockRestore();
    setItemSpy.mockRestore();
  });
});
