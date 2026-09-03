import Jimp from 'jimp';
import { addWaterMarkToIMG, generateWaterMark } from './watermark';

const TEXT_WITHOUT_DOT = 'VanBlog';
const TEXT_WITH_DOT_SHORT = 'site.com';
const TEXT_WITH_DOT_DOMAIN = 'example.com';

function countOpaquePixels(image: Jimp): number {
  let opaque = 0;
  image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
    if (this.bitmap.data[idx + 3] > 0) {
      opaque += 1;
    }
  });
  return opaque;
}

function countChangedPixels(a: Jimp, b: Jimp): number {
  let changed = 0;
  const dataA = a.bitmap.data;
  const dataB = b.bitmap.data;
  for (let i = 0; i < dataA.length; i += 4) {
    if (dataA[i] !== dataB[i] || dataA[i + 1] !== dataB[i + 1] || dataA[i + 2] !== dataB[i + 2]) {
      changed += 1;
    }
  }
  return changed;
}

function changedPixelBounds(original: Jimp, marked: Jimp) {
  let minX = marked.bitmap.width;
  let minY = marked.bitmap.height;
  let maxX = 0;
  let maxY = 0;
  marked.scan(0, 0, marked.bitmap.width, marked.bitmap.height, function (x, y, idx) {
    const o = original.bitmap.data;
    const m = this.bitmap.data;
    if (o[idx] !== m[idx] || o[idx + 1] !== m[idx + 1] || o[idx + 2] !== m[idx + 2]) {
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  });
  return { minX, minY, maxX, maxY };
}

async function solidSource(width = 800, height = 600, color = 0x202020ff) {
  const image = await Jimp.read(width, height, color);
  return image.getBufferAsync(Jimp.MIME_PNG);
}

describe('generateWaterMark', () => {
  it('renders watermark text without a dot', async () => {
    const logo = await generateWaterMark(TEXT_WITHOUT_DOT);
    expect(logo.bitmap.width).toBe(500);
    expect(logo.bitmap.height).toBe(150);
    expect(countOpaquePixels(logo)).toBeGreaterThan(1000);
  });

  it('renders watermark text that contains a dot (#322)', async () => {
    const short = await generateWaterMark(TEXT_WITH_DOT_SHORT);
    expect(short.bitmap.width).toBe(500);
    expect(short.bitmap.height).toBe(150);
    expect(countOpaquePixels(short)).toBeGreaterThan(1000);

    const domain = await generateWaterMark(TEXT_WITH_DOT_DOMAIN);
    expect(domain.bitmap.width).toBeGreaterThan(500);
    expect(domain.bitmap.height).toBe(150);
    expect(countOpaquePixels(domain)).toBeGreaterThan(1000);
  });

  it('does not drop a domain-length word onto a clipped second line', async () => {
    const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
    const textWidth = Jimp.measureText(font, TEXT_WITH_DOT_DOMAIN);
    expect(textWidth).toBeGreaterThan(500);

    const clipped = await Jimp.read(500, 150, 0x00000000);
    clipped.print(font, 0, 0, TEXT_WITH_DOT_DOMAIN, 500);
    expect(countOpaquePixels(clipped)).toBe(0);

    const logo = await generateWaterMark(TEXT_WITH_DOT_DOMAIN);
    expect(countOpaquePixels(logo)).toBeGreaterThan(1000);
  });
});

describe('addWaterMarkToIMG', () => {
  it('composites text without a dot at the bottom-right', async () => {
    const srcBuf = await solidSource();
    const original = await Jimp.read(srcBuf);
    const marked = await Jimp.read(await addWaterMarkToIMG(srcBuf, TEXT_WITHOUT_DOT));

    expect(countChangedPixels(original, marked)).toBeGreaterThan(1000);
    const bounds = changedPixelBounds(original, marked);
    expect(bounds.maxX).toBeGreaterThan(original.bitmap.width * 0.5);
    expect(bounds.maxY).toBeGreaterThan(original.bitmap.height * 0.5);
    expect(bounds.minX).toBeGreaterThan(original.bitmap.width * 0.2);
  });

  it('composites text with a dot the same way (#322)', async () => {
    const srcBuf = await solidSource();
    const original = await Jimp.read(srcBuf);

    const withDot = await Jimp.read(await addWaterMarkToIMG(srcBuf, TEXT_WITH_DOT_DOMAIN));
    const withoutDot = await Jimp.read(await addWaterMarkToIMG(srcBuf, TEXT_WITHOUT_DOT));

    expect(countChangedPixels(original, withDot)).toBeGreaterThan(1000);
    expect(countChangedPixels(original, withoutDot)).toBeGreaterThan(1000);

    const dottedBounds = changedPixelBounds(original, withDot);
    const controlBounds = changedPixelBounds(original, withoutDot);
    expect(dottedBounds.maxX).toBeGreaterThan(original.bitmap.width * 0.5);
    expect(dottedBounds.maxY).toBeGreaterThan(original.bitmap.height * 0.5);
    expect(Math.abs(dottedBounds.maxY - controlBounds.maxY)).toBeLessThan(30);
  });
});
