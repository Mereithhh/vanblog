import axios from 'axios';
import { MetaController } from './meta.controller';
import { refreshVersionCache, resetVersionCache } from 'src/utils/getVersion';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createController() {
  const metaProvider = {
    getAll: jest.fn().mockResolvedValue({
      siteInfo: { baseUrl: 'https://blog.example.com', enableComment: 'true' },
    }),
  };
  return {
    controller: new MetaController(metaProvider as any),
    metaProvider,
  };
}

describe('MetaController.getAllMeta', () => {
  beforeEach(() => {
    resetVersionCache();
    mockedAxios.get.mockReset();
  });

  it('returns immediately when the remote version API never responds (#343)', async () => {
    mockedAxios.get.mockImplementation(() => new Promise(() => undefined));
    const { controller } = createController();

    const started = Date.now();
    const result = await controller.getAllMeta({ user: { name: 'admin' } } as any);
    expect(Date.now() - started).toBeLessThan(200);
    expect(result.statusCode).toBe(200);
    expect(result.data.latestVersion).toBe(result.data.version);
    expect(result.data.baseUrl).toBe('https://blog.example.com');
  });

  it('surfaces the cached update hint after a background refresh', async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { version: '0.99.0', updatedAt: '2024-01-01T00:00:00.000Z' } },
    });
    const { controller } = createController();
    await refreshVersionCache();

    const result = await controller.getAllMeta({ user: { name: 'admin' } } as any);
    expect(result.data.latestVersion).toBe('0.99.0');
    expect(result.data.updatedAt).toBe('2024-01-01T00:00:00.000Z');
  });

  it('old await-on-request-path would stall for the remote delay', async () => {
    const remoteDelayMs = 400;
    mockedAxios.get.mockImplementation(() =>
      delay(remoteDelayMs).then(() => ({
        data: { data: { version: '0.99.0' } },
      })),
    );

    const started = Date.now();
    await axios.get('https://api.mereith.com/vanblog/version');
    expect(Date.now() - started).toBeGreaterThanOrEqual(remoteDelayMs);
  });
});
