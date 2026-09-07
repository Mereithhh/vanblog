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
