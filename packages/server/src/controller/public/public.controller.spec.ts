import { PublicController } from './public.controller';
import { DEFAULT_ARTICLES_PER_PAGE } from 'src/utils/articlesPerPage';

function createController(siteInfo: Record<string, unknown> = {}) {
  const articleProvider = {
    getByOption: jest.fn().mockResolvedValue({ articles: [{ id: 1 }], total: 12 }),
    getTotalNum: jest.fn().mockResolvedValue(12),
  };
  const categoryProvider = {
    getAllCategories: jest.fn().mockResolvedValue(['life']),
    getPublicCategoryNames: jest.fn().mockResolvedValue(['life']),
    getCategoriesWithArticle: jest.fn().mockResolvedValue({ life: [] }),
  };
  const tagProvider = {
    getAllTags: jest.fn().mockResolvedValue(['tag']),
  };
  const metaProvider = {
    getAll: jest.fn().mockResolvedValue({
      siteInfo,
      _doc: { siteInfo },
    }),
    getArticlesPerPage: jest.fn().mockImplementation(async () => {
      const { sanitizeArticlesPerPage } = require('src/utils/articlesPerPage');
      return sanitizeArticlesPerPage(siteInfo.articlesPerPage);
    }),
    getTotalWords: jest.fn().mockResolvedValue(100),
  };
  const settingProvider = {
    getMenuSetting: jest.fn().mockResolvedValue({ data: [] }),
    getLayoutSetting: jest.fn().mockResolvedValue(null),
    encodeLayoutSetting: jest.fn(),
  };
  const controller = new PublicController(
    articleProvider as any,
    categoryProvider as any,
    tagProvider as any,
    metaProvider as any,
    {} as any,
    settingProvider as any,
    {} as any,
  );
  return { controller, articleProvider, metaProvider, categoryProvider };
}

describe('PublicController article list page size (#346)', () => {
  it('uses the site setting as the default pageSize when the query omits it', async () => {
    const { controller, articleProvider } = createController({ articlesPerPage: 10 });
    await controller.getByOption(1 as any, undefined as any);
    expect(articleProvider.getByOption).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 10 }),
      true,
    );
  });

  it('defaults to 5 when the site has no articlesPerPage setting', async () => {
    const { controller, articleProvider } = createController({});
    await controller.getByOption(1 as any, undefined as any);
    expect(articleProvider.getByOption).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: DEFAULT_ARTICLES_PER_PAGE }),
      true,
    );
  });

  it('clamps a huge configured default so list queries cannot DoS', async () => {
    const { controller, articleProvider } = createController({ articlesPerPage: 9999 });
    await controller.getByOption(2 as any, undefined as any);
    expect(articleProvider.getByOption).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 50 }),
      true,
    );
  });

  it('still honors an explicit pageSize query (including unlimited -1)', async () => {
    const { controller, articleProvider } = createController({ articlesPerPage: 10 });
    await controller.getByOption(1 as any, 8 as any);
    expect(articleProvider.getByOption).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 8 }),
      true,
    );

    articleProvider.getByOption.mockClear();
    await controller.getByOption(1 as any, -1 as any);
    expect(articleProvider.getByOption).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: -1 }),
      true,
    );
  });
});

describe('PublicController.getBuildMeta articlesPerPage (#346)', () => {
  it('exposes a sanitized articlesPerPage on public siteInfo', async () => {
    const { controller } = createController({ siteName: 'demo', articlesPerPage: 12 });
    const result = await controller.getBuildMeta();
    expect(result.statusCode).toBe(200);
    expect(result.data.meta.siteInfo.articlesPerPage).toBe(12);
  });

  it('defaults missing values to 5 and clamps oversized ones', async () => {
    const missing = createController({ siteName: 'demo' });
    expect((await missing.controller.getBuildMeta()).data.meta.siteInfo.articlesPerPage).toBe(5);

    const huge = createController({ siteName: 'demo', articlesPerPage: 999 });
    expect((await huge.controller.getBuildMeta()).data.meta.siteInfo.articlesPerPage).toBe(50);
  });
});

describe('PublicController.getBuildMeta page copy (#373)', () => {
  it('exposes stored friend-link and about copy on public siteInfo', async () => {
    const { controller } = createController({
      siteName: 'demo',
      friendLinkIntro: '这些是朋友们的站点：',
      friendLinkApplyContent: '请发邮件。{{siteName}}',
      aboutTitle: 'About',
    });
    const result = await controller.getBuildMeta();
    expect(result.statusCode).toBe(200);
    expect(result.data.meta.siteInfo.friendLinkIntro).toBe('这些是朋友们的站点：');
    expect(result.data.meta.siteInfo.friendLinkApplyContent).toBe('请发邮件。{{siteName}}');
    expect(result.data.meta.siteInfo.aboutTitle).toBe('About');
  });

  it('omits custom copy when unset so the front can fall back to defaults', async () => {
    const { controller } = createController({ siteName: 'demo' });
    const siteInfo = (await controller.getBuildMeta()).data.meta.siteInfo;
    expect(siteInfo.friendLinkIntro).toBeUndefined();
    expect(siteInfo.friendLinkApplyContent).toBeUndefined();
    expect(siteInfo.aboutTitle).toBeUndefined();
  });
});

describe('PublicController category hide (#359)', () => {
  it('uses public category names for /meta so hidden categories stay out of nav', async () => {
    const { controller, categoryProvider } = createController({ siteName: 'demo' });
    categoryProvider.getPublicCategoryNames.mockResolvedValue(['随笔', '教程']);

    const result = await controller.getBuildMeta();
    expect(categoryProvider.getPublicCategoryNames).toHaveBeenCalled();
    expect(categoryProvider.getAllCategories).not.toHaveBeenCalled();
    expect(result.data.meta.categories).toEqual(['随笔', '教程']);
    expect(result.data.meta.categories).not.toContain('私密');
  });

  it('lists only public categories on /category and keeps visible ones', async () => {
    const { controller, categoryProvider } = createController();
    categoryProvider.getCategoriesWithArticle.mockResolvedValue({
      随笔: [{ id: 1, title: '随笔文' }],
      教程: [{ id: 2, title: '教程文' }],
    });

    const result = await controller.getArticlesByCategory();
    expect(categoryProvider.getCategoriesWithArticle).toHaveBeenCalledWith(false);
    expect(Object.keys(result.data)).toEqual(['随笔', '教程']);
    expect(result.data['私密']).toBeUndefined();
    expect(result.data['随笔']).toHaveLength(1);
  });

  it('preserves custom public category order on /meta and /category', async () => {
    const { controller, categoryProvider } = createController({ siteName: 'demo' });
    categoryProvider.getPublicCategoryNames.mockResolvedValue(['深度学习', 'Linux运维', 'Python']);
    categoryProvider.getCategoriesWithArticle.mockResolvedValue({
      深度学习: [{ id: 1, title: 'DL' }],
      Linux运维: [{ id: 2, title: 'Ops' }],
      Python: [{ id: 3, title: 'Py' }],
    });

    const meta = await controller.getBuildMeta();
    expect(meta.data.meta.categories).toEqual(['深度学习', 'Linux运维', 'Python']);

    const listed = await controller.getArticlesByCategory();
    expect(Object.keys(listed.data)).toEqual(['深度学习', 'Linux运维', 'Python']);
  });
});
