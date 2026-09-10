import { fallbackTypeFromName, safeImageSize } from './imageMeta';
import { compressImgToAvif, isAvifBuffer } from './avif';

const PNG_1X1 = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

describe('safeImageSize', () => {
  it('reads a normal PNG', () => {
    const meta = safeImageSize(PNG_1X1, 'png');
    expect(meta.type).toBe('png');
    expect(meta.width).toBe(1);
    expect(meta.height).toBe(1);
  });

  it('records type avif for sharp-encoded AVIF that image-size cannot parse', async () => {
    const buf = await compressImgToAvif(PNG_1X1);
    expect(isAvifBuffer(buf)).toBe(true);
    expect(() => {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const detect = require('image-size');
      const fn = typeof detect === 'function' ? detect : detect.imageSize;
      fn(buf);
    }).toThrow(/unsupported file type/);
    const meta = safeImageSize(buf, 'png');
    expect(meta.type).toBe('avif');
  });

  it('uses the filename extension when the buffer is unknown', () => {
    expect(fallbackTypeFromName('abc.shot.avif')).toBe('avif');
    expect(safeImageSize(Buffer.from('not-an-image'), 'avif').type).toBe('avif');
    expect(() => safeImageSize(Buffer.from('not-an-image'))).toThrow(/unsupported file type/);
  });
});
