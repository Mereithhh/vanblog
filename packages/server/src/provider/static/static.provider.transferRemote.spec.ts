import { StaticProvider } from './static.provider';
import * as imgCompress from 'src/utils/imgCompress';

jest.mock('src/utils/imgCompress', () => {
  const actual = jest.requireActual('src/utils/imgCompress');
  return {
    ...actual,
    compressImg: jest.fn(async (_buf: Buffer, format: string) => {
      if (format === 'avif') {
        return Buffer.from('AVIF-ENCODED');
      }
      return Buffer.from('WEBP-ENCODED');
    }),
  };
});

const mockedCompressImg = imgCompress.compressImg as jest.MockedFunction<
  typeof imgCompress.compressImg
>;

function createProvider(staticSetting: any, stored: Array<{ realPath: string }> = []) {
  const saved: any[] = [];
  const staticModel = {
    findOne: jest.fn(() => ({
      exec: async () => null,
    })),
    find: jest.fn(() => ({
      exec: async () => stored,
    })),
  };
  const settingProvider = {
    getStaticSetting: async () => staticSetting,
  };
  const localProvider = {
    saveFile: jest.fn(async (fileName: string, buffer: Buffer, type: string) => ({
      realPath: `/static/img/${fileName}`,
      meta: { type: fileName.split('.').pop(), width: 1, height: 1, size: '1 B' },
      type,
    })),
  };
  const provider = new StaticProvider(
    staticModel as any,
    settingProvider as any,
    localProvider as any,
    {} as any,
    {} as any,
  );
  (provider as any).createInDB = async (dto: any) => {
    saved.push(dto);
    return dto;
  };
  return { provider, localProvider, saved };
}

const remotePng = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);

describe('StaticProvider.transferRemoteImages (#434)', () => {
  beforeEach(() => {
    mockedCompressImg.mockClear();
  });

  it('downloads remote markdown/HTML images, uploads through the static pipeline, and rewrites URLs', async () => {
    const { provider, localProvider } = createProvider({ enableWebp: true });
    provider.fetchRemoteImage = jest.fn(async (link: string) => {
      if (link.includes('csdn')) {
        return { buffer: remotePng, contentType: 'image/png' };
      }
      return null;
    });

    const content = [
      '![cover](https://img-blog.csdnimg.cn/shot.png)',
      '<img src="https://img-blog.csdnimg.cn/shot.png">',
      '![keep](/static/img/keep.webp)',
    ].join('\n');

    const res = await provider.transferRemoteImages(content, {
      siteHosts: ['blog.example.com'],
    });

    expect(provider.fetchRemoteImage).toHaveBeenCalledTimes(1);
    expect(localProvider.saveFile).toHaveBeenCalledTimes(1);
    expect(mockedCompressImg).toHaveBeenCalledWith(remotePng, 'webp');
    expect(res.transferred).toHaveLength(1);
    expect(res.transferred[0].from).toBe('https://img-blog.csdnimg.cn/shot.png');
    expect(res.transferred[0].to).toMatch(/\/static\/img\/.+\.shot\.webp$/);
    expect(res.content).toContain(res.transferred[0].to);
    expect(res.content).not.toContain('https://img-blog.csdnimg.cn/shot.png');
    expect(res.content).toContain('![keep](/static/img/keep.webp)');
    expect(res.skipped.some((item) => item.url === '/static/img/keep.webp')).toBe(true);
    expect(res.failed).toEqual([]);
  });

  it('skips local, same-origin, and already-stored picgo URLs', async () => {
    const { provider, localProvider } = createProvider(
      { enableWebp: true },
      [{ realPath: 'https://pic.qiniu.com/already.webp' }],
    );
    provider.fetchRemoteImage = jest.fn();

    const content = [
      '![rel](/static/img/keep.webp)',
      '![site](https://blog.example.com/static/img/mine.webp)',
      '![picgo](https://pic.qiniu.com/already.webp)',
      '![data](data:image/png;base64,abc)',
    ].join('\n');

    const res = await provider.transferRemoteImages(content, {
      siteBaseUrl: 'https://blog.example.com/',
    });

    expect(provider.fetchRemoteImage).not.toHaveBeenCalled();
    expect(localProvider.saveFile).not.toHaveBeenCalled();
    expect(res.content).toBe(content);
    expect(res.transferred).toEqual([]);
    expect(res.skipped.map((item) => item.reason).sort()).toEqual([
      'already-stored',
      'data-url',
      'relative',
      'same-origin',
    ]);
  });

  it('applies compressFormat when compression is enabled', async () => {
    const { provider, localProvider } = createProvider({
      enableWebp: true,
      compressFormat: 'avif',
    });
    provider.fetchRemoteImage = jest.fn(async () => ({
      buffer: remotePng,
      contentType: 'image/png',
    }));

    const res = await provider.transferRemoteImages(
      '![a](https://cdn.other.com/photo.png)',
      { siteHosts: ['blog.example.com'] },
    );

    expect(mockedCompressImg).toHaveBeenCalledWith(remotePng, 'avif');
    expect(localProvider.saveFile.mock.calls[0][0]).toMatch(/\.photo\.avif$/);
    expect(res.transferred[0].to).toMatch(/\.avif$/);
  });

  it('leaves the original URL when download fails', async () => {
    const { provider } = createProvider({ enableWebp: true });
    provider.fetchRemoteImage = jest.fn(async () => null);

    const content = '![bad](https://cdn.other.com/missing.png)';
    const res = await provider.transferRemoteImages(content, {
      siteHosts: ['blog.example.com'],
    });

    expect(res.content).toBe(content);
    expect(res.transferred).toEqual([]);
    expect(res.failed).toEqual([{ url: 'https://cdn.other.com/missing.png', reason: 'download-failed' }]);
  });
});
