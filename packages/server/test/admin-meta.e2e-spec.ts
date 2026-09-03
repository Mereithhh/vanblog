import axios from 'axios';
import { MetaController } from '../src/controller/admin/meta/meta.controller';
import { getCachedVersionFromServer, refreshVersionCache, resetVersionCache } from '../src/utils/getVersion';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * End-to-end of issue #343: /api/admin/meta must stay fast when the
 * remote version API is delayed or unreachable.
 */
describe('admin meta stays fast when version API is slow (e2e)', () => {
  beforeEach(() => {
    resetVersionCache();
    mockedAxios.get.mockReset();
  });

  it('old synchronous version lookup blocks for the remote delay', async () => {
    const remoteDelayMs = 400;
    mockedAxios.get.mockImplementation(() =>
      delay(remoteDelayMs).then(() => ({
        data: { data: { version: '0.99.0', updatedAt: '2024-01-01T00:00:00.000Z' } },
      })),
    );

    const started = Date.now();
    const { data } = await axios.get('https://api.mereith.com/vanblog/version');
    const elapsed = Date.now() - started;
    expect(elapsed).toBeGreaterThanOrEqual(remoteDelayMs);
    expect(data?.data?.version).toBe('0.99.0');
  });

  it('GET /api/admin/meta returns quickly even if version API hangs', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => undefined));

    const metaProvider = {
      getAll: jest.fn().mockResolvedValue({
        siteInfo: { baseUrl: 'https://blog.example.com', enableComment: 'true' },
      }),
    };
    const controller = new MetaController(metaProvider as any);

    const started = Date.now();
    const result = await controller.getAllMeta({
      user: { name: 'admin' },
    } as any);
    const elapsed = Date.now() - started;

    expect(elapsed).toBeLessThan(200);
    expect(result.statusCode).toBe(200);
    expect(result.data.user).toEqual({ name: 'admin' });
    expect(result.data.latestVersion).toBe(result.data.version);
    expect(getCachedVersionFromServer()).toBeNull();
  });

  it('update hint appears from cache after a background refresh', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { version: '0.99.0', updatedAt: '2024-01-01T00:00:00.000Z' } },
    });

    const metaProvider = {
      getAll: jest.fn().mockResolvedValue({
        siteInfo: { baseUrl: 'https://blog.example.com', enableComment: 'true' },
      }),
    };
    const controller = new MetaController(metaProvider as any);
    await refreshVersionCache();

    const result = await controller.getAllMeta({ user: { name: 'admin' } } as any);
    expect(result.data.latestVersion).toBe('0.99.0');
    expect(result.data.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });
});
