import axios from 'axios';
import { ISRProvider } from './isr.provider';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function createProvider(articles: Array<{ id: number; pathname?: string }>) {
  const articleProvider = {
    getAll: jest.fn().mockResolvedValue(articles),
    getById: jest.fn(async (id: number) => articles.find((item) => item.id === id) || null),
  };
  const settingProvider = {
    getISRSetting: jest.fn().mockResolvedValue({ mode: 'onDemand' }),
  };
  const sitemapProvider = {
    getCategoryUrls: jest.fn().mockResolvedValue([]),
    getPageUrls: jest.fn().mockResolvedValue([]),
    getTagUrls: jest.fn().mockResolvedValue([]),
    generateSiteMap: jest.fn(),
  };
  const rssProvider = {
    generateRssFeed: jest.fn(),
  };
  const provider = new ISRProvider(
    articleProvider as any,
    rssProvider as any,
    sitemapProvider as any,
    settingProvider as any,
  );
  return { provider, articleProvider, settingProvider };
}

describe('ISRProvider', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
    mockedAxios.get.mockResolvedValue({ data: { revalidated: true } });
  });

  it('getArticleUrls returns id and pathname for the same post', async () => {
    const { provider } = createProvider([{ id: 30, pathname: 'gitea' }]);
    await expect(provider.getArticleUrls()).resolves.toEqual(['/post/30', '/post/gitea']);
  });

  it('on-demand ISR revalidates both public URLs after an admin edit (#356)', async () => {
    const { provider } = createProvider([
      { id: 30, pathname: 'gitea' },
      { id: 2 },
    ]);

    await provider.activeAllFn('更新文章触发增量渲染！', { postId: 30 });

    const revalidated = mockedAxios.get.mock.calls.map((call) => {
      const url = String(call[0]);
      return decodeURIComponent(url.split('path=')[1] || '');
    });

    expect(revalidated).toContain('/post/30');
    expect(revalidated).toContain('/post/gitea');
    expect(revalidated.indexOf('/post/30')).toBeLessThan(revalidated.indexOf('/post/2'));
    expect(revalidated.indexOf('/post/gitea')).toBeLessThan(revalidated.indexOf('/post/2'));
  });

  it('revalidates the previous pathname when it changes', async () => {
    const { provider } = createProvider([{ id: 30, pathname: 'new-path' }]);

    await provider.activeAllFn('更新文章触发增量渲染！', {
      postId: 30,
      previousPathname: 'gitea',
    });

    const revalidated = mockedAxios.get.mock.calls.map((call) => {
      const url = String(call[0]);
      return decodeURIComponent(url.split('path=')[1] || '');
    });
    expect(revalidated).toEqual(expect.arrayContaining(['/post/30', '/post/new-path', '/post/gitea']));
  });

  it('skips on-demand ISR in delay mode unless forced', async () => {
    const { provider, settingProvider } = createProvider([{ id: 30, pathname: 'gitea' }]);
    settingProvider.getISRSetting.mockResolvedValue({ mode: 'delay' });

    await provider.activeAllFn('更新文章触发增量渲染！', { postId: 30 });
    expect(mockedAxios.get).not.toHaveBeenCalled();

    await provider.activeAllFn('手动触发 ISR', { postId: 30, forceActice: true });
    const revalidated = mockedAxios.get.mock.calls.map((call) => {
      const url = String(call[0]);
      return decodeURIComponent(url.split('path=')[1] || '');
    });
    expect(revalidated).toEqual(expect.arrayContaining(['/post/30', '/post/gitea']));
  });
});
