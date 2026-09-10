import { ImgController } from './img.controller';
import { config } from 'src/config';

describe('ImgController.rewriteBaseUrl (#475)', () => {
  const originalDemo = config.demo;

  afterEach(() => {
    config.demo = originalDemo;
  });

  function createController() {
    const articleProvider = {
      rewriteBaseUrl: jest.fn().mockResolvedValue({ updated: 2, replacements: 5 }),
    };
    const draftProvider = {
      rewriteBaseUrl: jest.fn().mockResolvedValue({ updated: 1, replacements: 2 }),
    };
    const isrProvider = { activeAll: jest.fn() };
    const controller = new ImgController(
      {} as any,
      articleProvider as any,
      draftProvider as any,
      isrProvider as any,
      {} as any,
    );
    return { controller, articleProvider, draftProvider, isrProvider };
  }

  it('rewrites articles and drafts then triggers ISR when articles changed', async () => {
    const { controller, articleProvider, draftProvider, isrProvider } = createController();
    const result = await controller.rewriteBaseUrl({
      oldBase: 'https://old.example.com/',
      newBase: 'https://new.example.com',
    });

    expect(articleProvider.rewriteBaseUrl).toHaveBeenCalledWith(
      'https://old.example.com/',
      'https://new.example.com',
    );
    expect(draftProvider.rewriteBaseUrl).toHaveBeenCalledWith(
      'https://old.example.com/',
      'https://new.example.com',
    );
    expect(isrProvider.activeAll).toHaveBeenCalledWith('域名改写触发增量渲染！');
    expect(result).toEqual({
      statusCode: 200,
      data: { articlesUpdated: 2, draftsUpdated: 1, replacements: 7 },
    });
  });

  it('does not trigger ISR when no published article was updated', async () => {
    const { controller, articleProvider, isrProvider } = createController();
    articleProvider.rewriteBaseUrl.mockResolvedValue({ updated: 0, replacements: 0 });
    const result = await controller.rewriteBaseUrl({
      oldBase: 'https://old.example.com',
      newBase: 'https://new.example.com',
    });
    expect(isrProvider.activeAll).not.toHaveBeenCalled();
    expect(result.data).toEqual({ articlesUpdated: 0, draftsUpdated: 1, replacements: 2 });
  });

  it('blocks the rewrite on the demo site', async () => {
    config.demo = 'true';
    const { controller, articleProvider, isrProvider } = createController();
    const result = await controller.rewriteBaseUrl({
      oldBase: 'https://old.example.com',
      newBase: 'https://new.example.com',
    });
    expect(result).toEqual({ statusCode: 401, message: '演示站禁止修改此项！' });
    expect(articleProvider.rewriteBaseUrl).not.toHaveBeenCalled();
    expect(isrProvider.activeAll).not.toHaveBeenCalled();
  });
});
