import { ImgController } from './img.controller';
import { config } from 'src/config';

describe('ImgController.transferRemote (#434)', () => {
  const originalDemo = config.demo;

  afterEach(() => {
    config.demo = originalDemo;
  });

  function createController() {
    const staticProvider = {
      transferRemoteImages: jest.fn().mockResolvedValue({
        content: '![a](/static/img/a.webp)',
        transferred: [{ from: 'https://cdn.other.com/a.png', to: '/static/img/a.webp' }],
        skipped: [{ url: '/static/img/keep.webp', reason: 'relative' }],
        failed: [],
      }),
    };
    const metaProvider = {
      getSiteInfo: jest.fn().mockResolvedValue({ baseUrl: 'https://blog.example.com/' }),
    };
    const controller = new ImgController(
      staticProvider as any,
      {} as any,
      {} as any,
      {} as any,
      metaProvider as any,
    );
    return { controller, staticProvider, metaProvider };
  }

  it('rewrites the submitted markdown through the static transfer pipeline', async () => {
    const { controller, staticProvider, metaProvider } = createController();
    const result = await controller.transferRemote({
      content: '![a](https://cdn.other.com/a.png)',
      siteHost: 'blog.example.com',
    });

    expect(metaProvider.getSiteInfo).toHaveBeenCalled();
    expect(staticProvider.transferRemoteImages).toHaveBeenCalledWith(
      '![a](https://cdn.other.com/a.png)',
      {
        siteBaseUrl: 'https://blog.example.com/',
        siteHosts: ['blog.example.com'],
      },
    );
    expect(result).toEqual({
      statusCode: 200,
      data: {
        content: '![a](/static/img/a.webp)',
        transferred: [{ from: 'https://cdn.other.com/a.png', to: '/static/img/a.webp' }],
        skipped: [{ url: '/static/img/keep.webp', reason: 'relative' }],
        failed: [],
      },
    });
  });

  it('blocks the transfer on the demo site', async () => {
    config.demo = 'true';
    const { controller, staticProvider } = createController();
    const result = await controller.transferRemote({
      content: '![a](https://cdn.other.com/a.png)',
    });
    expect(result).toEqual({ statusCode: 401, message: '演示站禁止修改此项！' });
    expect(staticProvider.transferRemoteImages).not.toHaveBeenCalled();
  });
});
