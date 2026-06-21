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
  ExtendedWeatherResponse,
  DailyWeatherData,
  WeatherCurrent,
} from '../features/weather/types';

export function isWeatherStackError(
  data: WeatherStackAPIResponse,
): data is WeatherStackError {
  return 'success' in data && data.success === false;
}

/**
 * Generates mock forecast and historical data based on current weather.
 */
export function generateExtendedData(
  current: WeatherCurrent,
  localtime: string,
): { forecast: DailyWeatherData[]; history: DailyWeatherData[] } {
  const parts = localtime.split(' ')[0].split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const formatDate = (d: Date): string => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dateDay = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dateDay}`;
  };

  const getDayName = (d: Date, today: Date): string => {
    const diff = d.getTime() - today.getTime();
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays === -1) return 'Yesterday';
    
    return d.toLocaleDateString('en-US', { weekday: 'long' });
  };

  const today = new Date(year, month, day);

  const forecast: DailyWeatherData[] = [];
  const history: DailyWeatherData[] = [];

  // Generate next 3 days (Forecast)
  for (let i = 1; i <= 3; i++) {
    const d = new Date(year, month, day + i);
    const tempOffset = Math.round(Math.sin(i) * 3); // -3 to +3 variation
    const humidityOffset = Math.round(Math.cos(i) * 10); // -10 to +10 variation
    
    forecast.push({
      date: formatDate(d),
      dayName: getDayName(d, today),
      temperature: Math.max(0, current.temperature + tempOffset),
      weather_descriptions: current.weather_descriptions,
      weather_icons: current.weather_icons,
      wind_speed: Math.max(0, current.wind_speed + tempOffset),
      wind_dir: current.wind_dir,
      humidity: Math.min(100, Math.max(0, current.humidity + humidityOffset)),
      feelslike: Math.max(0, current.feelslike + tempOffset),
      uv_index: Math.max(1, current.uv_index + Math.round(tempOffset / 2)),
      visibility: current.visibility,
      pressure: current.pressure + Math.round(tempOffset),
    });
  }

  // Generate past 3 days (History)
  for (let i = 1; i <= 3; i++) {
    const d = new Date(year, month, day - i);
    const tempOffset = Math.round(Math.sin(-i) * 3); // -3 to +3 variation
    const humidityOffset = Math.round(Math.cos(-i) * 10);
    
    history.unshift({
      date: formatDate(d),
      dayName: getDayName(d, today),
      temperature: Math.max(0, current.temperature + tempOffset),
      weather_descriptions: current.weather_descriptions,
      weather_icons: current.weather_icons,
      wind_speed: Math.max(0, current.wind_speed + tempOffset),
      wind_dir: current.wind_dir,
      humidity: Math.min(100, Math.max(0, current.humidity + humidityOffset)),
      feelslike: Math.max(0, current.feelslike + tempOffset),
      uv_index: Math.max(1, current.uv_index + Math.round(tempOffset / 2)),
      visibility: current.visibility,
      pressure: current.pressure + Math.round(tempOffset),
    });
  }

  return { forecast, history };
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
): Promise<ExtendedWeatherResponse> {
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

  const { forecast, history } = generateExtendedData(data.current, data.location.localtime);

  return {
    ...data,
    forecast,
    history,
  };
}
