import { BadRequestException } from '@nestjs/common';
import { parseNumericId, tryParseNumericId } from './numericId';

describe('parseNumericId', () => {
  it('accepts positive integers and numeric strings', () => {
    expect(parseNumericId(7)).toBe(7);
    expect(parseNumericId('12')).toBe(12);
  });

  it('rejects missing, NaN, and non-numeric values (#427)', () => {
    expect(() => parseNumericId(undefined)).toThrow(BadRequestException);
    expect(() => parseNumericId(null)).toThrow(BadRequestException);
    expect(() => parseNumericId(NaN)).toThrow(BadRequestException);
    expect(() => parseNumericId('NaN')).toThrow(BadRequestException);
    expect(() => parseNumericId('undefined')).toThrow(BadRequestException);
    expect(() => parseNumericId('')).toThrow(BadRequestException);
    expect(() => parseNumericId('draft')).toThrow(BadRequestException);
    expect(tryParseNumericId(NaN)).toBeNull();
    expect(tryParseNumericId('hello')).toBeNull();
  });
});
