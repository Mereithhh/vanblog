import { BadRequestException } from '@nestjs/common';

/**
 * Article/draft ids are sequential integers. parseInt/Number of a missing
 * query value becomes NaN, and mongoose then throws CastError on path "id".
 */
export function parseNumericId(id: unknown): number {
  if (typeof id === 'number' && Number.isInteger(id)) {
    return id;
  }
  if (typeof id === 'string' && id.trim() !== '') {
    const parsed = Number(id);
    if (Number.isInteger(parsed)) {
      return parsed;
    }
  }
  throw new BadRequestException(`Invalid id: ${String(id)}`);
}

export function tryParseNumericId(id: unknown): number | null {
  try {
    return parseNumericId(id);
  } catch {
    return null;
  }
}
