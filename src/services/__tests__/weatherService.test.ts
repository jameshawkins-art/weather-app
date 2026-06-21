import { describe, it, expect, vi, beforeEach } from 'vitest';
import { isWeatherStackError, getWeatherByCity } from '../weatherService';
import type { WeatherStackAPIResponse } from '../../features/weather/types';
import { mockSuccessResponse, mockErrorResponse } from '../../test/fixtures';

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

describe('isWeatherStackError', () => {
  it('returns true for an error response', () => {
    expect(isWeatherStackError(mockErrorResponse)).toBe(true);
  });

  it('returns false for a successful response', () => {
    expect(isWeatherStackError(mockSuccessResponse)).toBe(false);
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
    mockFetchData.mockResolvedValueOnce(mockSuccessResponse);

    const result = await getWeatherByCity('Cape Town');

    expect(result).toEqual(expect.objectContaining({
      ...mockSuccessResponse,
      forecast: expect.any(Array),
      history: expect.any(Array),
    }));
    expect(result.location.name).toBe('Cape Town');
    expect(result.current.temperature).toBe(18);
  });

  it('constructs the correct URL with encoded city name', async () => {
    mockFetchData.mockResolvedValueOnce(mockSuccessResponse);

    await getWeatherByCity('Cape Town');

    expect(mockFetchData).toHaveBeenCalledOnce();
    const calledUrl = mockFetchData.mock.calls[0][0];
    expect(calledUrl).toContain('query=Cape%20Town');
    expect(calledUrl).toContain('/current');
    expect(calledUrl).toContain('access_key=');
  });

  it('throws a mapped user-friendly error for WeatherStack error code 101', async () => {
    mockFetchData.mockResolvedValueOnce(mockErrorResponse);

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

  it('throws validation error for empty city name', async () => {
    await expect(getWeatherByCity('')).rejects.toThrow('City name cannot be empty.');
  });

  it('does not validate/trim whitespace-only city names at the service layer', async () => {
    mockFetchData.mockResolvedValueOnce(mockSuccessResponse);

    await getWeatherByCity('   ');

    expect(mockFetchData).toHaveBeenCalledOnce();
    const calledUrl = mockFetchData.mock.calls[0][0];
    expect(calledUrl).toContain('query=%20%20%20');
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
    mockFetchData.mockResolvedValueOnce(mockSuccessResponse);

    await getWeatherByCity('São Paulo');

    const calledUrl = mockFetchData.mock.calls[0][0];
    expect(calledUrl).toContain('query=S%C3%A3o%20Paulo');
  });
});
