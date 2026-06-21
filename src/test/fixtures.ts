import type { WeatherStackResponse, WeatherStackError } from '../features/weather/types';

export const mockSuccessResponse: WeatherStackResponse = {
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

export const mockErrorResponse: WeatherStackError = {
  success: false,
  error: {
    code: 101,
    type: 'invalid_access_key',
    info: 'You have not supplied a valid API Access Key.',
  },
};
