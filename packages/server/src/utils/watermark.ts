import Jimp from 'jimp';

const WATERMARK_MIN_WIDTH = 500;
const WATERMARK_HEIGHT = 150;
const LOGO_MARGIN_PERCENTAGE = 5 / 100;

export const addWaterMarkToIMG = async (srcImage: Buffer, waterMarkText: string) => {
  let logo = await generateWaterMark(waterMarkText);
  const image = await Jimp.read(srcImage);

  const xMargin = image.bitmap.width * LOGO_MARGIN_PERCENTAGE;
  const yMargin = image.bitmap.width * LOGO_MARGIN_PERCENTAGE;
  const maxLogoWidth = image.bitmap.width - 2 * xMargin;
  if (maxLogoWidth > 0 && logo.bitmap.width > maxLogoWidth) {
    logo = logo.resize(maxLogoWidth, Jimp.AUTO);
  }

  const X = image.bitmap.width - logo.bitmap.width - xMargin;
  const Y = image.bitmap.height - logo.bitmap.height - yMargin;

  //@ts-ignore
  const newImage = image.composite(logo, X, Y, [
    {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 0.8,
      opacityDest: 1,
    },
  ]);

  return await newImage.getBufferAsync(newImage.getMIME());
};

export const generateWaterMark: any = async (waterMark: string) => {
  const font = await Jimp.loadFont(Jimp.FONT_SANS_128_WHITE);
  // Jimp print() wraps when maxWidth is set. A single word wider than that
  // width is pushed onto a second line at y=lineHeight (143). The old 500x150
  // canvas then clips that line, so domain text like "example.com" vanishes.
  const textWidth = Jimp.measureText(font, waterMark);
  const width = Math.max(WATERMARK_MIN_WIDTH, Math.ceil(textWidth));
  const logo = await Jimp.read(width, WATERMARK_HEIGHT, 0x00000000);
  logo.print(font, 0, 0, waterMark);
  //@ts-ignore
  logo.color([{ apply: 'mix', params: ['#a7a7a7', 100] }]);
  return logo;
};
