// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchData, AppError } from '../api';

describe('api service', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('resolves with JSON data on a successful response', async () => {
    const mockData = { temp: 20 };
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    } as Response);

    const data = await fetchData('https://api.example.com/test');
    expect(data).toEqual(mockData);
  });

  it('throws an AppError of type API on non-ok HTTP status codes', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    await expect(fetchData('https://api.example.com/test')).rejects.toThrow(
      new AppError('Requested resource not found.', 'API', 404)
    );
  });

  it('throws an AppError of type NETWORK on TypeError (fetch failed)', async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(fetchData('https://api.example.com/test')).rejects.toThrow(
      new AppError(
        'Network connection failed. Please check your internet connection and try again.',
        'NETWORK'
      )
    );
  });

  it('throws an AppError of type TIMEOUT when the request is aborted', async () => {
    const abortError = new DOMException('The user aborted a request.', 'AbortError');
    vi.mocked(fetch).mockRejectedValueOnce(abortError);

    await expect(fetchData('https://api.example.com/test')).rejects.toThrow(
      new AppError('Request timed out. Please try again.', 'TIMEOUT')
    );
  });

  it('aborts the request and throws a TIMEOUT error after 10 seconds of inactivity', async () => {
    vi.mocked(fetch).mockImplementationOnce((_url, options) => {
      return new Promise((_resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            reject(new DOMException('The user aborted a request.', 'AbortError'));
          });
        }
      });
    });

    const fetchPromise = fetchData('https://api.example.com/test');

    vi.advanceTimersByTime(10000);

    await expect(fetchPromise).rejects.toThrow(
      new AppError('Request timed out. Please try again.', 'TIMEOUT')
    );
  });

  it('clears the timeout when the request completes successfully', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    await fetchData('https://api.example.com/test');
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('clears the timeout when a non-ok HTTP status code is received', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Server Error',
    } as Response);

    await expect(fetchData('https://api.example.com/test')).rejects.toThrow();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  it('clears the timeout when fetch throws a network TypeError', async () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(fetchData('https://api.example.com/test')).rejects.toThrow();
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
