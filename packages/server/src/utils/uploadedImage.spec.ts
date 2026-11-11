import { BadRequestException } from '@nestjs/common';
import { imageSize } from 'image-size';
import * as avif from './avif';
import { decodeUploadedImage, sanitizeImageBaseName } from './uploadedImage';

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

describe('decodeUploadedImage', () => {
  it('reads png, jpeg, gif, webp, and avif', async () => {
    const sharp = avif.tryLoadSharp() as any;
    expect(sharp).toBeTruthy();
    const jpeg = await sharp(PNG_1X1).jpeg().toBuffer();
    const gif = await sharp(PNG_1X1).gif().toBuffer();
    const webp = await sharp(PNG_1X1).webp().toBuffer();
    const avifBuf = await sharp(PNG_1X1).avif().toBuffer();

    expect((await decodeUploadedImage(PNG_1X1)).format).toBe('png');
    expect((await decodeUploadedImage(jpeg)).ext).toBe('jpg');
    expect((await decodeUploadedImage(gif)).format).toBe('gif');
    expect((await decodeUploadedImage(webp)).format).toBe('webp');
    expect((await decodeUploadedImage(avifBuf)).format).toBe('avif');
  });

  it('rejects a short GIF signature that image-size still calls a gif', async () => {
    const payload = truncatedGif();
    expect(imageSize(payload).type).toBe('gif');
    await expect(decodeUploadedImage(payload)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects svg markup', async () => {
    const svg = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8"/></svg>',
    );
    await expect(decodeUploadedImage(svg)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('decodes png with jimp when sharp is unavailable, and still rejects the short GIF', async () => {
    const spy = jest.spyOn(avif, 'tryLoadSharp').mockReturnValue(null);
    try {
      const decoded = await decodeUploadedImage(PNG_1X1);
      expect(decoded.format).toBe('png');
      expect(decoded.ext).toBe('png');
      await expect(decodeUploadedImage(truncatedGif())).rejects.toBeInstanceOf(BadRequestException);
    } finally {
      spy.mockRestore();
    }
  });
});

describe('sanitizeImageBaseName', () => {
  it('drops the caller extension and path segments', () => {
    expect(sanitizeImageBaseName('shot.png')).toBe('shot');
    expect(sanitizeImageBaseName('proof.html')).toBe('proof');
    expect(sanitizeImageBaseName('../../tmp/proof.html')).toBe('proof');
    expect(sanitizeImageBaseName('封面.png')).toBe('封面');
  });
});
