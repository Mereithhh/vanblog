import { imageSize } from 'image-size';
import { isAvifBuffer } from './avif';

export function fallbackTypeFromName(fileName?: string): string | undefined {
  if (!fileName) {
    return undefined;
  }
  const ext = String(fileName).split('.').pop();
  return ext && ext !== fileName ? ext.toLowerCase() : undefined;
}

/**
 * image-size@1.0.2 does not understand AVIF. After AVIF encode, still
 * record type/size so saveFile does not throw.
 */
export function safeImageSize(buffer: Buffer, fallbackType?: string) {
  try {
    return imageSize(buffer);
  } catch {
    if (isAvifBuffer(buffer)) {
      return { type: 'avif', width: undefined, height: undefined };
    }
    if (fallbackType) {
      return { type: fallbackType, width: undefined, height: undefined };
    }
    throw new TypeError('unsupported file type');
  }
}
