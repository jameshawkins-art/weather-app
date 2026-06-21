/**
 * @module services/api
 * Base fetch wrapper providing a typed, generic HTTP client.
 * All network requests should flow through this layer for consistent
 * error handling and response parsing.
 */

export class AppError extends Error {
  public readonly code: 'NETWORK' | 'TIMEOUT' | 'API' | 'UNKNOWN';
  public readonly statusCode?: number;

  constructor(
    message: string,
    code: 'NETWORK' | 'TIMEOUT' | 'API' | 'UNKNOWN',
    statusCode?: number
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Performs a GET request and returns the parsed JSON response typed as `T`.
 *
 * @typeParam T - The expected shape of the JSON response body.
 * @param url  - Fully-qualified URL to fetch.
 * @returns      Parsed JSON response.
 * @throws {AppError} On network failure, timeout, HTTP error, or other API issues.
 */
export async function fetchData<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      let statusMessage = response.statusText || 'API Error';
      if (response.status === 404) {
        statusMessage = 'Requested resource not found.';
      } else if (response.status === 401 || response.status === 403) {
        statusMessage = 'Unauthorized request. Please check your credentials.';
      } else if (response.status >= 500) {
        statusMessage = 'Internal server error. Please try again later.';
      } else {
        statusMessage = `HTTP Error ${response.status}: ${statusMessage}`;
      }
      throw new AppError(statusMessage, 'API', response.status);
    }

    return (await response.json()) as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof AppError) {
      throw err;
    }

    const name = err?.name;
    const message = err?.message || 'An unknown error occurred.';

    if (name === 'AbortError') {
      throw new AppError('Request timed out. Please try again.', 'TIMEOUT');
    }

    if (err instanceof TypeError || name === 'TypeError') {
      throw new AppError(
        'Network connection failed. Please check your internet connection and try again.',
        'NETWORK'
      );
    }

    throw new AppError(message, 'UNKNOWN');
  }
}

