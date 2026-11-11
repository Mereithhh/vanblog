import { StaticProvider } from './static.provider';
import * as imgCompress from 'src/utils/imgCompress';
import { isAvifBuffer } from 'src/utils/avif';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

jest.mock('src/utils/imgCompress', () => {
  const actual = jest.requireActual('src/utils/imgCompress');
  return {
    ...actual,
    compressImg: jest.fn(async (_buf: Buffer, format: string) => {
      if (format === 'avif') {
        return Buffer.concat([
          Buffer.from([0, 0, 0, 0x18]),
          Buffer.from('ftypavif'),
          Buffer.from('avif'),
        ]);
      }
      return Buffer.concat([Buffer.from('RIFF'), Buffer.from([0, 0, 0, 0]), Buffer.from('WEBP')]);
    }),
  };
});

const mockedCompressImg = imgCompress.compressImg as jest.MockedFunction<typeof imgCompress.compressImg>;

function createProvider(staticSetting: any) {
  const saved: any[] = [];
  const staticModel = {
    findOne: jest.fn(() => ({
      exec: async () => null,
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

const pngFile = {
  originalname: 'shot.png',
  buffer: PNG_1X1,
};

describe('StaticProvider upload compress format (#423)', () => {
  beforeEach(() => {
    mockedCompressImg.mockClear();
  });

  it('stores .webp when compression is on and format is default/omitted', async () => {
    const { provider, localProvider } = createProvider({ enableWebp: true });
    const res = await provider.upload(pngFile, 'img');
    expect(mockedCompressImg).toHaveBeenCalledWith(pngFile.buffer, 'webp');
    const fileName = localProvider.saveFile.mock.calls[0][0];
    expect(fileName).toMatch(/\.shot\.webp$/);
    expect(res.src).toMatch(/\.webp$/);
  });

  it('stores .avif when compression is on and format is avif', async () => {
    const { provider, localProvider, saved } = createProvider({
      enableWebp: true,
      compressFormat: 'avif',
    });
    const res = await provider.upload(pngFile, 'img');
    expect(mockedCompressImg).toHaveBeenCalledWith(pngFile.buffer, 'avif');
    const call = localProvider.saveFile.mock.calls[0];
    expect(call[0]).toMatch(/\.shot\.avif$/);
    expect(isAvifBuffer(call[1])).toBe(true);
    expect(call[2]).toBe('img');
    expect(res.src).toMatch(/\.avif$/);
    expect(saved[0].fileType).toBe('avif');
  });

  it('does not compress when the toggle is off', async () => {
    const { provider, localProvider } = createProvider({
      enableWebp: false,
      compressFormat: 'avif',
    });
    await provider.upload(pngFile, 'img');
    expect(mockedCompressImg).not.toHaveBeenCalled();
    expect(localProvider.saveFile.mock.calls[0][0]).toMatch(/\.shot\.png$/);
    expect(localProvider.saveFile.mock.calls[0][1].equals(PNG_1X1)).toBe(true);
  });

  it('does not keep the original bytes when compression fails', async () => {
    mockedCompressImg.mockRejectedValueOnce(new Error('encode failed'));
    const { provider, localProvider } = createProvider({ enableWebp: true });
    await expect(provider.upload(pngFile, 'img')).rejects.toThrow(/图片处理失败/);
    expect(localProvider.saveFile).not.toHaveBeenCalled();
  });
});
