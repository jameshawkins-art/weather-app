/**
 * @module services/weatherService
 * WeatherStack API integration.
 * Wraps the generic fetch layer with WeatherStack-specific URL construction,
 * response discrimination (success vs. error), and typed return values.
 */

import { config, WEATHERSTACK_BASE_URL } from '../config';
import { fetchData } from './api';
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
 * @throws {Error} On network failure, HTTP error, or WeatherStack API error.
 */
export async function getWeatherByCity(
  city: string,
): Promise<WeatherStackResponse> {
  const url =
    `${WEATHERSTACK_BASE_URL}/current` +
    `?access_key=${config.weatherstackApiKey}` +
    `&query=${encodeURIComponent(city)}`;

  const data = await fetchData<WeatherStackAPIResponse>(url);

  if (isWeatherStackError(data)) {
    throw new Error(
      `WeatherStack API error ${data.error.code.toString()}: ${data.error.info}`,
    );
  }

  return data;
}
