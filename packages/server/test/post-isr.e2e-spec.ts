import axios from 'axios';
import { ISRProvider } from '../src/provider/isr/isr.provider';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

/**
 * End-to-end of issue #356: after an admin edit, every public URL of the
 * article must show the new content — not only /post/<pathname>.
 */
describe('admin edit refreshes all public post URLs (e2e)', () => {
  it('updates /post/<id> and /post/<pathname> after save', async () => {
    const article = {
      id: 30,
      pathname: 'gitea',
      title: 'Gitea 笔记',
      content: '旧内容：安装步骤',
      hidden: false,
      deleted: false,
    };
    const articles = [article];

    const publicCache = new Map<string, string>();
    const render = () => `${article.title}\n${article.content}`;
    const visit = (path: string) => {
      if (!publicCache.has(path)) {
        publicCache.set(path, render());
      }
      return publicCache.get(path);
    };
    const revalidate = (path: string) => {
      publicCache.set(path, render());
    };

    mockedAxios.get.mockImplementation(async (url: string) => {
      const path = decodeURIComponent(String(url).split('path=')[1] || '');
      if (path.startsWith('/post/')) {
        revalidate(path);
      }
      return { data: { revalidated: true } };
    });

    expect(visit('/post/30')).toContain('旧内容：安装步骤');
    expect(visit('/post/gitea')).toContain('旧内容：安装步骤');

    article.content = '新内容：升级到 1.20';

    expect(visit('/post/30')).toContain('旧内容：安装步骤');
    expect(visit('/post/gitea')).toContain('旧内容：安装步骤');

    const articleProvider = {
      getAll: jest.fn().mockResolvedValue(articles),
      getById: jest.fn(async (id: number) => articles.find((item) => item.id === id) || null),
    };
    const isr = new ISRProvider(
      articleProvider as any,
      { generateRssFeed: jest.fn() } as any,
      {
        getCategoryUrls: async () => [],
        getPageUrls: async () => [],
        getTagUrls: async () => [],
        generateSiteMap: jest.fn(),
      } as any,
      { getISRSetting: async () => ({ mode: 'onDemand' }) } as any,
    );

    await isr.activeAllFn('更新文章触发增量渲染！', {
      postId: 30,
      previousPathname: 'gitea',
    });

    expect(visit('/post/30')).toContain('新内容：升级到 1.20');
    expect(visit('/post/gitea')).toContain('新内容：升级到 1.20');
    expect(visit('/post/30')).not.toContain('旧内容');
    expect(visit('/post/gitea')).not.toContain('旧内容');
  });

  it('old pathname-only ISR leaves the numeric-id page stale', async () => {
    const article = {
      id: 30,
      pathname: 'gitea',
      content: '旧内容',
    };
    const publicCache = new Map<string, string>([
      ['/post/30', '旧内容'],
      ['/post/gitea', '旧内容'],
    ]);
    article.content = '新内容';
    const oldUrls = [`/post/${article.pathname || article.id}`];
    for (const path of oldUrls) {
      publicCache.set(path, article.content);
    }
    expect(publicCache.get('/post/gitea')).toBe('新内容');
    expect(publicCache.get('/post/30')).toBe('旧内容');
  });
});
