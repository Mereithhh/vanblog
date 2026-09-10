import { BadRequestException } from '@nestjs/common';
import { spawnSync } from 'child_process';
import {
  applyStaticAssetHeaders,
  compressExt,
  compressImg,
  compressMime,
  contentTypeForExt,
  DEFAULT_COMPRESS_FORMAT,
  parseCompressFormat,
  resolveCompressFormat,
} from './imgCompress';
import { isAvifBuffer, tryLoadSharp } from './avif';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const actualSpawnSync = jest.requireActual<typeof import('child_process')>('child_process').spawnSync;

jest.mock('child_process', () => {
  const actual = jest.requireActual<typeof import('child_process')>('child_process');
  return {
    ...actual,
    spawnSync: jest.fn((command: string, args?: readonly string[], options?: any) => {
      return actual.spawnSync(command, args as string[], options);
    }),
  };
});

const mockedSpawnSync = spawnSync as jest.MockedFunction<typeof spawnSync>;

function isWebpBuffer(buf: Buffer): boolean {
  return (
    buf.length >= 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' &&
    buf.toString('ascii', 8, 12) === 'WEBP'
  );
}

describe('parseCompressFormat', () => {
  it('defaults missing values to webp', () => {
    expect(parseCompressFormat(undefined)).toBe('webp');
    expect(parseCompressFormat(null)).toBe('webp');
    expect(parseCompressFormat('')).toBe('webp');
    expect(DEFAULT_COMPRESS_FORMAT).toBe('webp');
  });

  it('accepts webp and avif (case-insensitive)', () => {
    expect(parseCompressFormat('webp')).toBe('webp');
    expect(parseCompressFormat('AVIF')).toBe('avif');
    expect(parseCompressFormat(' Avif ')).toBe('avif');
  });

  it('resolves corrupt stored values to webp on read', () => {
    expect(resolveCompressFormat('jpeg')).toBe('webp');
    expect(resolveCompressFormat('avif')).toBe('avif');
  });

  it('rejects invalid format values', () => {
    expect(() => parseCompressFormat('jpeg')).toThrow(BadRequestException);
    expect(() => parseCompressFormat('png')).toThrow(BadRequestException);
    expect(() => parseCompressFormat('webp2')).toThrow(BadRequestException);
    expect(() => parseCompressFormat(1)).toThrow(BadRequestException);
    expect(() => parseCompressFormat('heic')).toThrow(/webp 或 avif/);
  });

  it('maps extension and Content-Type for each format', () => {
    expect(compressExt('webp')).toBe('webp');
    expect(compressExt('avif')).toBe('avif');
    expect(compressMime('webp')).toBe('image/webp');
    expect(compressMime('avif')).toBe('image/avif');
    expect(contentTypeForExt('.avif')).toBe('image/avif');
    expect(contentTypeForExt('webp')).toBe('image/webp');
    const headers: Record<string, string> = {};
    applyStaticAssetHeaders(
      { setHeader: (name, value) => (headers[name] = value) },
      '/app/static/img/cover.avif',
    );
    expect(headers['Content-Type']).toBe('image/avif');
  });
});

describe('compressImg encoder', () => {
  beforeEach(() => {
    mockedSpawnSync.mockImplementation((command, args, options) => {
      return actualSpawnSync(command as string, args as string[], options);
    });
  });

  it('produces AVIF when avif is selected (#423)', async () => {
    const sharp = tryLoadSharp();
    expect(sharp).toBeTruthy();
    const buf = await compressImg(PNG_1X1, 'avif');
    expect(isAvifBuffer(buf)).toBe(true);
    expect(isWebpBuffer(buf)).toBe(false);
  });

  it('produces WebP when format is omitted (default) (#423)', async () => {
    const sharp = tryLoadSharp();
    expect(sharp).toBeTruthy();
    const viaDefault = await compressImg(PNG_1X1);
    const viaWebp = await compressImg(PNG_1X1, 'webp');
    expect(isWebpBuffer(viaDefault)).toBe(true);
    expect(isWebpBuffer(viaWebp)).toBe(true);
    expect(isAvifBuffer(viaDefault)).toBe(false);
  });
});
