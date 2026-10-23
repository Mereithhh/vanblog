import { BadRequestException } from '@nestjs/common';
import { ArticleController } from './article.controller';

function createController() {
  const articleProvider = {
    getByOption: jest.fn().mockResolvedValue({ articles: [], total: 0 }),
  };
  const controller = new ArticleController(
    articleProvider as any,
    {} as any,
    {} as any,
  );
  return { controller, articleProvider };
}

describe('ArticleController.getByOption (#400)', () => {
  it('passes a normal page through to the provider', async () => {
    const { controller, articleProvider } = createController();
    await controller.getByOption(2 as any, 10 as any);
    expect(articleProvider.getByOption).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 10 }),
      false,
    );
  });

  it('does not forward NaN / negative / overflow page as a Mongo skip', async () => {
    const hostilePages = [
      undefined,
      NaN,
      'NaN',
      '',
      'abc',
      -1,
      0,
      '-9223372036854775808',
      Infinity,
      Number.MAX_VALUE,
    ];
    for (const page of hostilePages) {
      const { controller, articleProvider } = createController();
      await controller.getByOption(page as any, 10 as any);
      const option = articleProvider.getByOption.mock.calls[0][0];
      const skip = (option.page - 1) * option.pageSize;
      expect(Number.isFinite(option.page)).toBe(true);
      expect(option.page).toBeGreaterThanOrEqual(1);
      expect(Number.isFinite(option.pageSize)).toBe(true);
      expect(option.pageSize).toBeGreaterThanOrEqual(1);
      expect(Number.isFinite(skip)).toBe(true);
      expect(skip).toBeGreaterThanOrEqual(0);
    }
  });

  it('replaces an invalid pageSize so skip stays non-negative', async () => {
    const { controller, articleProvider } = createController();
    await controller.getByOption(1 as any, 'not-a-size' as any);
    const option = articleProvider.getByOption.mock.calls[0][0];
    expect(option.pageSize).toBeGreaterThanOrEqual(1);
    expect((option.page - 1) * option.pageSize).toBe(0);
  });
});

describe('ArticleController.create pathname (#383)', () => {
  it('forwards the same optional pathname as create-article', async () => {
    const articleProvider = {
      create: jest.fn().mockResolvedValue({ id: 42, pathname: 'cb933e30' }),
    };
    const isrProvider = { activeAll: jest.fn() };
    const pipelineProvider = { dispatchEvent: jest.fn().mockResolvedValue([]) };
    const controller = new ArticleController(
      articleProvider as any,
      isrProvider as any,
      pipelineProvider as any,
    );

    const result = await controller.create({ user: { nickname: 'admin' } }, {
      title: 'Hexo 迁移',
      category: '测试',
      pathname: 'cb933e30',
      content: 'body',
    } as any);

    expect(articleProvider.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Hexo 迁移',
        category: '测试',
        pathname: 'cb933e30',
        author: 'admin',
      }),
    );
    expect(result).toEqual({ statusCode: 200, data: { id: 42, pathname: 'cb933e30' } });
  });
});

describe('ArticleController.create/update cover (#288)', () => {
  it('forwards optional cover on create and update', async () => {
    const articleProvider = {
      create: jest.fn().mockResolvedValue({ id: 288, cover: '/static/img/hero.webp' }),
      getById: jest.fn().mockResolvedValue({ id: 288, pathname: 'cover-test' }),
      updateById: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const isrProvider = { activeAll: jest.fn() };
    const pipelineProvider = { dispatchEvent: jest.fn().mockResolvedValue([]) };
    const controller = new ArticleController(
      articleProvider as any,
      isrProvider as any,
      pipelineProvider as any,
    );

    await controller.create({ user: { nickname: 'admin' } }, {
      title: '题头图',
      category: '测试',
      cover: '/static/img/hero.webp',
    } as any);
    expect(articleProvider.create).toHaveBeenCalledWith(
      expect.objectContaining({ cover: '/static/img/hero.webp' }),
    );

    await controller.update(288 as any, { cover: '' } as any);
    expect(articleProvider.updateById).toHaveBeenCalledWith(288, expect.objectContaining({ cover: '' }));
  });
});

describe('ArticleController private password', () => {
  function build(articleProvider: any, pipelineProvider?: any) {
    return new ArticleController(
      articleProvider,
      { activeAll: jest.fn() } as any,
      pipelineProvider || ({ dispatchEvent: jest.fn().mockResolvedValue([]) } as any),
    );
  }

  it('rejects creating a private article without a password', async () => {
    const articleProvider = { create: jest.fn() };
    const controller = build(articleProvider);
    await expect(
      controller.create({ user: { nickname: 'admin' } }, {
        title: '秘密',
        category: '随笔',
        private: true,
        password: '  ',
      } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(articleProvider.create).not.toHaveBeenCalled();
  });

  it('creates a private article when the password is set', async () => {
    const articleProvider = { create: jest.fn().mockResolvedValue({ id: 9 }) };
    const controller = build(articleProvider);
    await controller.create({ user: { nickname: 'admin' } }, {
      title: '秘密',
      category: '随笔',
      private: true,
      password: 'pw',
    } as any);
    expect(articleProvider.create).toHaveBeenCalledWith(
      expect.objectContaining({ private: true, password: 'pw' }),
    );
  });

  it('rejects a pipeline result that turns on private and clears the password', async () => {
    const articleProvider = { create: jest.fn() };
    const pipelineProvider = {
      dispatchEvent: jest.fn().mockResolvedValue([
        { output: { title: '秘密', category: '随笔', private: true, password: '' } },
      ]),
    };
    const controller = build(articleProvider, pipelineProvider);
    await expect(
      controller.create({ user: {} }, { title: '秘密', category: '随笔', password: 'pw' } as any),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(articleProvider.create).not.toHaveBeenCalled();
  });

  it('rejects making an article private when no password is stored', async () => {
    const articleProvider = {
      getById: jest.fn().mockResolvedValue({ id: 1, private: false, password: '', pathname: 'a' }),
      updateById: jest.fn(),
    };
    const controller = build(articleProvider);
    await expect(controller.update(1 as any, { private: true } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(articleProvider.updateById).not.toHaveBeenCalled();
  });

  it('allows a content-only save of a legacy private article that has no password', async () => {
    const articleProvider = {
      getById: jest.fn().mockResolvedValue({ id: 1, private: true, password: '', pathname: 'a' }),
      updateById: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const controller = build(articleProvider);
    await controller.update(1 as any, { content: 'still editing' } as any);
    expect(articleProvider.updateById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ content: 'still editing' }),
    );
  });

  it('allows private when a password is already stored and rejects clearing it', async () => {
    const articleProvider = {
      getById: jest.fn().mockResolvedValue({ id: 1, private: true, password: 'pw', pathname: 'a' }),
      updateById: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    };
    const controller = build(articleProvider);
    await controller.update(1 as any, { private: true } as any);
    expect(articleProvider.updateById).toHaveBeenCalled();

    articleProvider.updateById.mockClear();
    await expect(controller.update(1 as any, { password: '' } as any)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(articleProvider.updateById).not.toHaveBeenCalled();
  });
});

