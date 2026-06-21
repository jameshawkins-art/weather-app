import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isWeatherStackError, getWeatherByCity } from '../weatherService';
import type {
  WeatherStackResponse,
  WeatherStackError,
  WeatherStackAPIResponse,
} from '../../features/weather/types';

vi.mock('../api', () => {
  class AppError extends Error {
    public readonly code: string;
    public readonly statusCode?: number;

    constructor(
      message: string,
      code: string,
      statusCode?: number
    ) {
      super(message);
      this.name = 'AppError';
      this.code = code;
      this.statusCode = statusCode;
    }
  }
  return {
    fetchData: vi.fn(),
    AppError,
  };
});

import { fetchData } from '../api';
const mockFetchData = vi.mocked(fetchData);

const successResponse: WeatherStackResponse = {
  request: {
    type: 'City',
    query: 'Cape Town, South Africa',
    language: 'en',
    unit: 'm',
  },
  location: {
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Cape Town, Western Cape',
    lat: '-33.933',
    lon: '18.417',
    localtime: '2026-06-20 10:00',
  },
  current: {
    temperature: 18,
    weather_descriptions: ['Partly cloudy'],
    weather_icons: ['https://assets.weatherstack.com/images/wsymbols01_sobj/day/partly_cloudy.png'],
    wind_speed: 15,
    wind_dir: 'SW',
    humidity: 65,
    feelslike: 17,
    uv_index: 4,
    visibility: 10,
    pressure: 1015,
    cloudcover: 50,
    precip: 0,
  },
};

const errorResponse: WeatherStackError = {
  success: false,
  error: {
    code: 101,
    type: 'invalid_access_key',
    info: 'You have not supplied a valid API Access Key.',
  },
};

describe('isWeatherStackError', () => {
  it('returns true for an error response', () => {
    expect(isWeatherStackError(errorResponse)).toBe(true);
  });

  it('returns false for a successful response', () => {
    expect(isWeatherStackError(successResponse)).toBe(false);
  });

  it('returns false when "success" key is absent', () => {
    const ambiguous = { location: {}, current: {} } as unknown as WeatherStackAPIResponse;
    expect(isWeatherStackError(ambiguous)).toBe(false);
  });
});

describe('getWeatherByCity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns weather data for a valid city', async () => {
    mockFetchData.mockResolvedValueOnce(successResponse);

    const result = await getWeatherByCity('Cape Town');

    expect(result).toEqual(successResponse);
    expect(result.location.name).toBe('Cape Town');
    expect(result.current.temperature).toBe(18);
  });

  it('constructs the correct URL with encoded city name', async () => {
    mockFetchData.mockResolvedValueOnce(successResponse);

    await getWeatherByCity('Cape Town');

    expect(mockFetchData).toHaveBeenCalledOnce();
    const calledUrl = mockFetchData.mock.calls[0][0];
    expect(calledUrl).toContain('query=Cape%20Town');
    expect(calledUrl).toContain('/current');
    expect(calledUrl).toContain('access_key=');
  });

  it('throws a mapped user-friendly error for WeatherStack error code 101', async () => {
    mockFetchData.mockResolvedValueOnce(errorResponse);

    await expect(getWeatherByCity('Cape Town')).rejects.toThrow(
      'Invalid API key. Please check your configuration.',
    );
  });

  it('throws a mapped user-friendly error for WeatherStack error code 615', async () => {
    mockFetchData.mockResolvedValueOnce({
      success: false,
      error: {
        code: 615,
        type: 'request_failed',
        info: 'City not found.',
      },
    });

    await expect(getWeatherByCity('UnknownCity')).rejects.toThrow(
      'City not found. Please check the spelling.',
    );
  });

  it('throws a mapped user-friendly error for WeatherStack error code 105', async () => {
    mockFetchData.mockResolvedValueOnce({
      success: false,
      error: {
        code: 105,
        type: 'usage_limit_reached',
        info: 'Usage limit reached.',
      },
    });

    await expect(getWeatherByCity('London')).rejects.toThrow(
      'API usage limit reached. Please try again later.',
    );
  });

  it('throws standard error.info for unmapped WeatherStack error codes', async () => {
    mockFetchData.mockResolvedValueOnce({
      success: false,
      error: {
        code: 999,
        type: 'unknown_error',
        info: 'Some obscure error info.',
      },
    });

    await expect(getWeatherByCity('London')).rejects.toThrow(
      'Some obscure error info.',
    );
  });

  it('throws validation error for empty or whitespace-only city name', async () => {
    await expect(getWeatherByCity('')).rejects.toThrow('City name cannot be empty.');
    await expect(getWeatherByCity('   ')).rejects.toThrow('City name cannot be empty.');
  });

  it('propagates network / fetch errors from fetchData', async () => {
    mockFetchData.mockRejectedValueOnce(
      new Error('API request failed: 500 Internal Server Error — http://api.weatherstack.com/current'),
    );

    await expect(getWeatherByCity('Cape Town')).rejects.toThrow(
      'API request failed: 500 Internal Server Error',
    );
  });

  it('encodes special characters in the city name', async () => {
    mockFetchData.mockResolvedValueOnce(successResponse);

    await getWeatherByCity('São Paulo');

    const calledUrl = mockFetchData.mock.calls[0][0];
    expect(calledUrl).toContain('query=S%C3%A3o%20Paulo');
  });
});
