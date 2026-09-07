import { BadRequestException } from '@nestjs/common';
import {
  normalizeBaseUrl,
  prepareRewriteBases,
  rewriteBaseUrlInDocuments,
  rewriteBaseUrlInText,
} from './rewriteBaseUrl';

describe('normalizeBaseUrl', () => {
  it('trims and strips trailing slashes', () => {
    expect(normalizeBaseUrl(' https://old.example.com/ ')).toBe('https://old.example.com');
    expect(normalizeBaseUrl('https://old.example.com///')).toBe('https://old.example.com');
    expect(normalizeBaseUrl('https://cdn.example.com/blog/')).toBe('https://cdn.example.com/blog');
  });

  it('treats missing values as empty', () => {
    expect(normalizeBaseUrl('')).toBe('');
    expect(normalizeBaseUrl('   ')).toBe('');
    expect(normalizeBaseUrl(undefined)).toBe('');
    expect(normalizeBaseUrl(null)).toBe('');
    expect(normalizeBaseUrl(1 as any)).toBe('');
  });
});

describe('rewriteBaseUrlInText (#475)', () => {
  const markdown = [
    '![cover](https://old.example.com/static/img/cover.webp)',
    '正文里还有 https://old.example.com/static/img/a.png 和一张相对路径 ![](/static/img/keep.webp)',
    '<img src="https://old.example.com/static/img/html.png">',
    '[外链](https://other.example.com/static/img/skip.png)',
    '以及 https://old.example.com.evil.com/phish.webp',
  ].join('\n');

  it('replaces the old base in markdown, HTML, and bare URLs', () => {
    const { text, replacements } = rewriteBaseUrlInText(
      markdown,
      'https://old.example.com',
      'https://new.example.com',
    );

    expect(replacements).toBe(3);
    expect(text).toContain('https://new.example.com/static/img/cover.webp');
    expect(text).toContain('https://new.example.com/static/img/a.png');
    expect(text).toContain('src="https://new.example.com/static/img/html.png"');
    expect(text).toContain('![](/static/img/keep.webp)');
    expect(text).toContain('https://other.example.com/static/img/skip.png');
    expect(text).toContain('https://old.example.com.evil.com/phish.webp');
    expect(text).not.toContain('https://old.example.com/static/');
  });

  it('treats trailing-slash variants of old and new as the same base', () => {
    const content = '![x](https://old.example.com/static/img/x.webp) and https://old.example.com/';
    const a = rewriteBaseUrlInText(
      content,
      'https://old.example.com/',
      'https://new.example.com/',
    );
    const b = rewriteBaseUrlInText(content, 'https://old.example.com', 'https://new.example.com');

    expect(a.replacements).toBe(2);
    expect(b.replacements).toBe(2);
    expect(a.text).toBe(b.text);
    expect(a.text).toBe('![x](https://new.example.com/static/img/x.webp) and https://new.example.com/');
  });

  it('leaves unrelated third-party hosts alone unless they match oldBase', () => {
    const content =
      '![](https://pic.qiniu.com/abc.webp) ![](https://old.example.com/static/img/mine.webp)';
    const { text, replacements } = rewriteBaseUrlInText(
      content,
      'https://old.example.com',
      'https://new.example.com',
    );
    expect(replacements).toBe(1);
    expect(text).toContain('https://pic.qiniu.com/abc.webp');
    expect(text).toContain('https://new.example.com/static/img/mine.webp');
  });

  it('rewrites a picgo/CDN host when that host is the oldBase', () => {
    const content = '![](https://pic.qiniu.com/abc.webp) keep https://old.example.com/static/x.png';
    const { text, replacements } = rewriteBaseUrlInText(
      content,
      'https://pic.qiniu.com',
      'https://cdn.new.com',
    );
    expect(replacements).toBe(1);
    expect(text).toContain('https://cdn.new.com/abc.webp');
    expect(text).toContain('https://old.example.com/static/x.png');
  });

  it('is a no-op when old equals new (including slash variants) or either is missing', () => {
    const content = '![](https://old.example.com/static/img/x.webp)';
    expect(rewriteBaseUrlInText(content, 'https://old.example.com', 'https://old.example.com/')).toEqual({
      text: content,
      replacements: 0,
    });
    expect(rewriteBaseUrlInText(content, '', 'https://new.example.com')).toEqual({
      text: content,
      replacements: 0,
    });
    expect(rewriteBaseUrlInText(content, 'https://old.example.com', '')).toEqual({
      text: content,
      replacements: 0,
    });
    expect(rewriteBaseUrlInText('', 'https://old.example.com', 'https://new.example.com')).toEqual({
      text: '',
      replacements: 0,
    });
  });
});

describe('prepareRewriteBases', () => {
  it('returns null when old or new is missing or they match after normalize', () => {
    expect(prepareRewriteBases('', 'https://new.example.com')).toBeNull();
    expect(prepareRewriteBases('https://old.example.com', '')).toBeNull();
    expect(prepareRewriteBases('https://same.com/', 'https://same.com')).toBeNull();
  });

  it('normalizes trailing slashes when both are valid http(s) URLs', () => {
    expect(prepareRewriteBases('https://old.example.com/', 'http://new.example.com')).toEqual({
      oldBase: 'https://old.example.com',
      newBase: 'http://new.example.com',
    });
  });

  it('rejects a non-empty value that is not an http(s) URL', () => {
    expect(() => prepareRewriteBases('old.example.com', 'https://new.example.com')).toThrow(
      BadRequestException,
    );
    expect(() => prepareRewriteBases('https://old.example.com', 'ftp://new.example.com')).toThrow(
      BadRequestException,
    );
  });
});

describe('rewriteBaseUrlInDocuments', () => {
  it('counts updated documents and replacements, skipping unchanged rows', async () => {
    const docs = [
      { id: 1, content: '![](https://old.example.com/static/a.webp) and https://old.example.com/static/b.png' },
      { id: 2, content: 'no images here' },
      { id: 3, content: '![](https://other.com/x.png)' },
    ];
    const written: Array<{ id: number; content: string }> = [];
    const result = await rewriteBaseUrlInDocuments(
      docs,
      async (id, content) => {
        written.push({ id, content });
      },
      'https://old.example.com',
      'https://new.example.com',
    );

    expect(result).toEqual({ updated: 1, replacements: 2 });
    expect(written).toEqual([
      {
        id: 1,
        content: '![](https://new.example.com/static/a.webp) and https://new.example.com/static/b.png',
      },
    ]);
  });
});
