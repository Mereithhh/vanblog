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
    saveFile: jest.fn(async (fileName: string, buffer: Buffer) => ({
      realPath: `/static/img/${fileName}`,
      meta: { type: fileName.split('.').pop(), width: 1, height: 1, size: '1 B' },
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
  buffer: Buffer.from('fake-png'),
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
    const [fileName, buffer, type] = localProvider.saveFile.mock.calls[0];
    expect(fileName).toMatch(/\.shot\.avif$/);
    expect(buffer.equals(Buffer.from('AVIF-ENCODED'))).toBe(true);
    expect(type).toBe('img');
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
  });
});
