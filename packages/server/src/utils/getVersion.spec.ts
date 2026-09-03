import axios from 'axios';
import {
  VERSION_CACHE_TTL_MS,
  VERSION_FETCH_TIMEOUT_MS,
  fetchVersionFromServer,
  getCachedVersionFromServer,
  getVersionFromServer,
  refreshVersionCache,
  resetVersionCache,
} from './getVersion';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe('getVersion', () => {
  beforeEach(() => {
    resetVersionCache();
    mockedAxios.get.mockReset();
  });

  it('times out / fail-opens instead of throwing', async () => {
    mockedAxios.get.mockRejectedValue(new Error('timeout of 1500ms exceeded'));
    await expect(fetchVersionFromServer()).resolves.toBeNull();
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/vanblog/version'),
      expect.objectContaining({ timeout: VERSION_FETCH_TIMEOUT_MS }),
    );
  });

  it('returns cache immediately while the remote version API is still pending', async () => {
    let resolveFetch: (value: unknown) => void = () => undefined;
    mockedAxios.get.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        }),
    );

    const started = Date.now();
    const first = getCachedVersionFromServer();
    expect(Date.now() - started).toBeLessThan(50);
    expect(first).toBeNull();

    resolveFetch({
      data: { data: { version: '0.99.0', updatedAt: '2024-01-01T00:00:00.000Z' } },
    });
    await delay(0);

    expect(getCachedVersionFromServer()?.version).toBe('0.99.0');
  });

  it('shares one in-flight request and does not refetch a fresh cache', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { version: '0.98.0', updatedAt: '2024-02-01T00:00:00.000Z' } },
    });

    await Promise.all([refreshVersionCache(), refreshVersionCache()]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    mockedAxios.get.mockClear();
    expect(getCachedVersionFromServer()?.version).toBe('0.98.0');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('returns stale cache immediately and refreshes in the background', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { version: '0.90.0', updatedAt: '2023-01-01T00:00:00.000Z' } },
    });
    await refreshVersionCache();

    const nowSpy = jest.spyOn(Date, 'now');
    nowSpy.mockReturnValue(Date.now() + VERSION_CACHE_TTL_MS + 1);

    let resolveRefresh: (value: unknown) => void = () => undefined;
    mockedAxios.get.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const started = Date.now();
    const stale = getCachedVersionFromServer();
    expect(Date.now() - started).toBeLessThan(50);
    expect(stale?.version).toBe('0.90.0');

    resolveRefresh({
      data: { data: { version: '0.99.0', updatedAt: '2024-01-01T00:00:00.000Z' } },
    });
    await delay(0);
    nowSpy.mockRestore();

    expect(getCachedVersionFromServer()?.version).toBe('0.99.0');
  });

  it('keeps the last good version when a later fetch fails', async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { version: '0.90.0', updatedAt: '2023-01-01T00:00:00.000Z' } },
    });
    await refreshVersionCache();
    mockedAxios.get.mockRejectedValueOnce(new Error('timeout of 1500ms exceeded'));
    await expect(refreshVersionCache()).resolves.toEqual({
      version: '0.90.0',
      updatedAt: '2023-01-01T00:00:00.000Z',
    });
    expect(getCachedVersionFromServer()?.version).toBe('0.90.0');
  });

  it('getVersionFromServer no longer waits on the remote API', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => undefined));
    const started = Date.now();
    await expect(getVersionFromServer()).resolves.toBeNull();
    expect(Date.now() - started).toBeLessThan(50);
  });
});
