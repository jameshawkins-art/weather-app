/**
 * @module config
 * Application-wide configuration derived from environment variables and constants.
 * Centralizes all external configuration to avoid scattered `import.meta.env` calls.
 */

export const WEATHERSTACK_BASE_URL = 'http://api.weatherstack.com' as const;

export const config = Object.freeze({
  weatherstackApiKey: import.meta.env.VITE_WEATHERSTACK_API_KEY ?? '',
  weatherstackBaseUrl: WEATHERSTACK_BASE_URL,
  proxyUrl: import.meta.env.VITE_PROXY_URL ?? '',
});
