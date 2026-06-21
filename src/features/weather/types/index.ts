/**
 * @module features/weather/types
 * TypeScript types and interfaces specific to the weather feature,
 * including API response shapes and component prop types.
 */

export interface WeatherLocation {
  name: string;
  country: string;
  region: string;
  lat: string;
  lon: string;
  localtime: string;
}

export interface WeatherCurrent {
  temperature: number;
  weather_descriptions: string[];
  weather_icons: string[];
  wind_speed: number;
  wind_dir: string;
  humidity: number;
  feelslike: number;
  uv_index: number;
  visibility: number;
  pressure: number;
  cloudcover: number;
  precip: number;
  day_title?: string;
}

export interface WeatherStackResponse {
  request: { type: string; query: string; language: string; unit: string };
  location: WeatherLocation;
  current: WeatherCurrent;
}

export interface WeatherStackError {
  success: false;
  error: { code: number; type: string; info: string };
}

export type WeatherStackAPIResponse = WeatherStackResponse | WeatherStackError;

export interface DailyWeatherData {
  date: string;                  // YYYY-MM-DD format
  dayName: string;               // e.g. "Monday", "Yesterday", "Tomorrow"
  temperature: number;
  weather_descriptions: string[];
  weather_icons: string[];
  wind_speed: number;
  wind_dir: string;
  humidity: number;
  feelslike: number;
  uv_index: number;
  visibility: number;
  pressure: number;
}

export interface ExtendedWeatherResponse extends WeatherStackResponse {
  forecast: DailyWeatherData[];
  history: DailyWeatherData[];
}
