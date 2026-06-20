/**
 * @module config
 * Application-wide configuration derived from environment variables and constants.
 * Centralizes all external configuration to avoid scattered `import.meta.env` calls.
 */

// TODO: Handle production API KEY
interface ImportMetaEnv {
  readonly VITE_WEATHERSTACK_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const WEATHERSTACK_BASE_URL = 'http://api.weatherstack.com' as const;

export const config = Object.freeze({
  weatherstackApiKey: import.meta.env.VITE_WEATHERSTACK_API_KEY ?? '',
  weatherstackBaseUrl: WEATHERSTACK_BASE_URL,
});
