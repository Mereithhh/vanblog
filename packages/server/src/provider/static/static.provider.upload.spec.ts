import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import sharp from 'sharp';
import { config } from 'src/config';
import { LocalProvider } from './local.provider';
import { StaticProvider } from './static.provider';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

function truncatedGif(): Buffer {
  return Buffer.concat([
    Buffer.from('GIF89a'),
    Buffer.from([0x01, 0x00, 0x01, 0x00]),
    Buffer.from('<html><body>marker</body></html>'),
  ]);
}

function createProvider(staticSetting: any, localProvider: LocalProvider, picgoProvider: any = {}) {
  const saved: any[] = [];
  const staticModel = {
    findOne: jest.fn(() => ({
      exec: async () => null,
    })),
  };
  const provider = new StaticProvider(
    staticModel as any,
    { getStaticSetting: async () => staticSetting } as any,
    localProvider,
    picgoProvider,
    {} as any,
  );
  (provider as any).createInDB = async (dto: any) => {
    saved.push(dto);
    return dto;
  };
  return { provider, saved };
}

describe('StaticProvider image upload validation', () => {
  let tmp: string;
  let prevStatic: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-upload-'));
    prevStatic = config.staticPath;
    config.staticPath = tmp;
    fs.mkdirSync(path.join(tmp, 'img'), { recursive: true });
    fs.mkdirSync(path.join(tmp, 'tmp'), { recursive: true });
  });

  afterEach(() => {
    config.staticPath = prevStatic;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('stores a png named .html as png when compression is off', async () => {
    const local = new LocalProvider();
    const { provider } = createProvider({ enableWebp: false, storageType: 'local' }, local);
    const res = await provider.upload(
      { originalname: 'proof.html', buffer: PNG_1X1 },
      'img',
    );
    expect(res.src).toMatch(/\.proof\.png$/);
    expect(res.src.endsWith('.html')).toBe(false);
    const names = fs.readdirSync(path.join(tmp, 'img'));
    expect(names.some((name) => name.endsWith('.html'))).toBe(false);
    expect(names.some((name) => name.endsWith('.png'))).toBe(true);
    const stored = fs.readFileSync(path.join(tmp, 'img', names[0]));
    expect(stored.equals(PNG_1X1)).toBe(true);
  });

  it('compresses a gif to webp when compression is on', async () => {
    const gif = await sharp(PNG_1X1).gif().toBuffer();
    const local = new LocalProvider();
    const { provider } = createProvider({ enableWebp: true, storageType: 'local' }, local);
    const res = await provider.upload({ originalname: 'anim.gif', buffer: gif }, 'img');
    expect(res.src).toMatch(/\.anim\.webp$/);
    const storedName = fs.readdirSync(path.join(tmp, 'img'))[0];
    const stored = fs.readFileSync(path.join(tmp, 'img', storedName));
    expect(stored.slice(0, 4).toString()).toBe('RIFF');
    expect(stored.slice(8, 12).toString()).toBe('WEBP');
  });

  it('stores jpeg bytes with a jpg extension', async () => {
    const jpeg = await sharp(PNG_1X1).jpeg().toBuffer();
    const local = new LocalProvider();
    const { provider } = createProvider({ enableWebp: false, storageType: 'local' }, local);
    const res = await provider.upload({ originalname: 'scan.html', buffer: jpeg }, 'img');
    expect(res.src).toMatch(/\.scan\.jpg$/);
  });

  it('rejects a short GIF header and does not write it', async () => {
    const local = new LocalProvider();
    const { provider } = createProvider({ enableWebp: false, storageType: 'local' }, local);
    await expect(
      provider.upload({ originalname: 'proof.html', buffer: truncatedGif() }, 'img'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(fs.readdirSync(path.join(tmp, 'img'))).toEqual([]);
  });

  it('keeps a traversal name inside the image directory', async () => {
    const local = new LocalProvider();
    const { provider } = createProvider({ enableWebp: false, storageType: 'local' }, local);
    const res = await provider.upload(
      { originalname: '../../tmp/proof.html', buffer: PNG_1X1 },
      'img',
    );
    expect(res.src.startsWith('/static/img/')).toBe(true);
    expect(res.src.includes('..')).toBe(false);
    expect(fs.readdirSync(path.join(tmp, 'tmp'))).toEqual([]);
    expect(fs.readdirSync(path.join(tmp, 'img')).length).toBe(1);
  });

  it('does not send a rejected upload to picgo', async () => {
    const picgo = { saveFile: jest.fn() };
    const { provider } = createProvider(
      { enableWebp: false, storageType: 'picgo' },
      new LocalProvider(),
      picgo,
    );
    await expect(
      provider.upload({ originalname: 'proof.html', buffer: truncatedGif() }, 'img'),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(picgo.saveFile).not.toHaveBeenCalled();
  });

  it('sends picgo a decoded extension instead of the caller extension', async () => {
    const picgo = {
      saveFile: jest.fn(async (fileName: string, buffer: Buffer) => ({
        realPath: `https://img.example/${fileName}`,
        meta: { type: 'png', width: 1, height: 1, size: '1 B' },
        buffer,
      })),
    };
    const { provider } = createProvider(
      { enableWebp: false, storageType: 'picgo' },
      new LocalProvider(),
      picgo,
    );
    const res = await provider.upload({ originalname: 'proof.html', buffer: PNG_1X1 }, 'img');
    expect(picgo.saveFile).toHaveBeenCalledTimes(1);
    const [fileName, buffer] = picgo.saveFile.mock.calls[0];
    expect(fileName).toMatch(/\.proof\.png$/);
    expect(String(fileName).endsWith('.html')).toBe(false);
    expect(buffer.equals(PNG_1X1)).toBe(true);
    expect(res.src).toMatch(/\.png$/);
  });
});
