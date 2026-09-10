import { SiteMapProvider } from './sitemap.provider';

function createProvider(total: number, articlesPerPage: number) {
  const articleProvider = {
    getTotalNum: jest.fn().mockResolvedValue(total),
  };
  const metaProvider = {
    getArticlesPerPage: jest.fn().mockResolvedValue(articlesPerPage),
  };
  const provider = new SiteMapProvider(
    articleProvider as any,
    {} as any,
    {} as any,
    {} as any,
    metaProvider as any,
  );
  return { provider, articleProvider, metaProvider };
}

describe('SiteMapProvider.getCategoryUrls (#359)', () => {
  it('omits hidden categories from sitemap paths', async () => {
    const categoryProvider = {
      getPublicCategoryNames: jest.fn().mockResolvedValue(['随笔', '教程']),
    };
    const provider = new SiteMapProvider(
      { getTotalNum: jest.fn() } as any,
      categoryProvider as any,
      {} as any,
      {} as any,
      { getArticlesPerPage: jest.fn() } as any,
    );

    await expect(provider.getCategoryUrls()).resolves.toEqual([
      '/category/随笔',
      '/category/教程',
    ]);
    expect(categoryProvider.getPublicCategoryNames).toHaveBeenCalled();
  });
});

describe('SiteMapProvider.getPageUrls (#346)', () => {
  it('builds /page/n paths using the configured articles-per-page size', async () => {
    const { provider } = createProvider(23, 10);
    await expect(provider.getPageUrls()).resolves.toEqual(['/page/1', '/page/2', '/page/3']);
  });

  it('keeps a single page when total fits in the default size of 5', async () => {
    const { provider } = createProvider(5, 5);
    await expect(provider.getPageUrls()).resolves.toEqual(['/page/1']);
  });
});
