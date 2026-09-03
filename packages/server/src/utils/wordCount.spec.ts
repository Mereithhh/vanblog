import { wordCount } from './wordCount';

/**
 * Previous site total: every CJK char + every ASCII char (spaces, markdown,
 * URLs). That made 总字数 look like UTF-8 byte counting on Chinese posts.
 */
function legacyAsciiCharCount(text: string): number {
  let iTotal = 0;
  let eTotal = 0;
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    if (c.match(/[\u4e00-\u9fa5]/) || c.match(/[\u9FA6-\u9fcb]/)) {
      iTotal++;
    }
    if (!c.match(/[^\x00-\xff]/)) {
      eTotal++;
    }
  }
  return iTotal + eTotal;
}

describe('wordCount (#293)', () => {
  it('counts CJK as characters, not UTF-8 bytes', () => {
    const cjk = '你好世界';
    expect(cjk.length).toBe(4);
    expect(Buffer.byteLength(cjk, 'utf8')).toBe(12);
    expect(wordCount(cjk)).toBe(4);
    expect(wordCount(cjk)).not.toBe(Buffer.byteLength(cjk, 'utf8'));
  });

  it('matches the ByteMD editor: CJK chars + English words', () => {
    expect(wordCount('hello means 你好')).toBe(4);
    expect(wordCount('hello world')).toBe(2);
    expect(wordCount('')).toBe(0);
    expect(wordCount(undefined)).toBe(0);
  });

  it('does not treat markdown / ASCII punctuation as extra characters', () => {
    const markdown = '# 你好\n\n这是正文。';
    expect(wordCount(markdown)).toBe(6);
    expect(legacyAsciiCharCount(markdown)).toBeGreaterThan(wordCount(markdown));
  });
});
