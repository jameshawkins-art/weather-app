/**
 * @module services/api
 * Base fetch wrapper providing a typed, generic HTTP client.
 * All network requests should flow through this layer for consistent
 * error handling and response parsing.
 */

/**
 * Performs a GET request and returns the parsed JSON response typed as `T`.
 *
 * @typeParam T - The expected shape of the JSON response body.
 * @param url  - Fully-qualified URL to fetch.
 * @returns      Parsed JSON response.
 * @throws {Error} When the response status is not OK (non-2xx).
 */
export async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `API request failed: ${response.status.toString()} ${response.statusText} — ${url}`,
    );
  }

  return (await response.json()) as T;
}
