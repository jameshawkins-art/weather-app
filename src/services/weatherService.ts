/**
 * @module services/weatherService
 * WeatherStack API integration.
 * Wraps the generic fetch layer with WeatherStack-specific URL construction,
 * response discrimination (success vs. error), and typed return values.
 */

import { config, WEATHERSTACK_BASE_URL } from '../config';
import { fetchData, AppError } from './api';
import type {
  WeatherStackAPIResponse,
  WeatherStackError,
  WeatherStackResponse,
} from '../features/weather/types';

export function isWeatherStackError(
  data: WeatherStackAPIResponse,
): data is WeatherStackError {
  return 'success' in data && data.success === false;
}

/**
 * Fetches current weather data for a given city from the WeatherStack API.
 *
 * @param city - City name (or comma-separated lat,lon).
 * @returns Parsed successful weather response.
 * @throws {Error | AppError} On invalid input, network failure, HTTP error, or WeatherStack API error.
 */
export async function getWeatherByCity(
  city: string,
): Promise<WeatherStackResponse> {
  if (!city) {
    throw new Error('City name cannot be empty.');
  }

  const isProd = import.meta.env.PROD;
  const url = isProd
    ? `${config.proxyUrl}/api/weather?city=${encodeURIComponent(city)}`
    : `${WEATHERSTACK_BASE_URL}/current` +
      `?access_key=${config.weatherstackApiKey}` +
      `&query=${encodeURIComponent(city)}`;

  const data = await fetchData<WeatherStackAPIResponse>(url);

  if (isWeatherStackError(data)) {
    let message = data.error.info;
    switch (data.error.code) {
      case 615:
        message = 'City not found. Please check the spelling.';
        break;
      case 105:
        message = 'API usage limit reached. Please try again later.';
        break;
      case 101:
        message = 'Invalid API key. Please check your configuration.';
        break;
    }
    throw new AppError(message, 'API');
  }

  return data;
}

