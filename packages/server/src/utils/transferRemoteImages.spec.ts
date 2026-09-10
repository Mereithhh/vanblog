import {
  applyImageUrlMap,
  classifyImageUrl,
  collectSiteHosts,
  extractImageRefs,
  filenameFromRemote,
  looksLikeImage,
} from './transferRemoteImages';

describe('extractImageRefs (#434)', () => {
  const markdown = [
    '![cover](https://img-blog.csdnimg.cn/a.png)',
    '![local](/static/img/keep.webp)',
    '![site](https://blog.example.com/static/img/mine.webp "封面")',
    '<img src="https://cdn.csdn.net/c.jpg">',
    "<img alt='x' src='data:image/png;base64,abc'>",
    '![rel](./pic.png)',
    '[not image](https://csdn.net/page.png)',
    '![titled](https://example.com/d.png "title")',
  ].join('\n');

  it('finds markdown and HTML image URLs without regular links', () => {
    const urls = extractImageRefs(markdown).map((ref) => ref.url);
    expect(urls).toEqual([
      'https://img-blog.csdnimg.cn/a.png',
      '/static/img/keep.webp',
      'https://blog.example.com/static/img/mine.webp',
      'https://cdn.csdn.net/c.jpg',
      'data:image/png;base64,abc',
      './pic.png',
      'https://example.com/d.png',
    ]);
    expect(urls).not.toContain('https://csdn.net/page.png');
  });
});

describe('classifyImageUrl (#434)', () => {
  const siteHosts = ['blog.example.com'];
  const knownRealPaths = ['https://pic.qiniu.com/already.webp', '/static/img/db.webp'];

  it('skips data URLs, relative paths, and same-origin static hosts', () => {
    expect(classifyImageUrl('data:image/png;base64,abc').kind).toBe('skip');
    expect(classifyImageUrl('/static/img/keep.webp').reason).toBe('relative');
    expect(classifyImageUrl('./pic.png').reason).toBe('relative');
    expect(
      classifyImageUrl('https://blog.example.com/static/img/mine.webp', { siteHosts }).reason,
    ).toBe('same-origin');
    expect(classifyImageUrl('https://blog.example.com/post/1', { siteHosts }).reason).toBe(
      'same-origin',
    );
  });

  it('skips URLs already stored on this site picgo/local realPath', () => {
    expect(
      classifyImageUrl('https://pic.qiniu.com/already.webp', { siteHosts, knownRealPaths }).reason,
    ).toBe('already-stored');
  });

  it('marks third-party http(s) images as remote', () => {
    expect(classifyImageUrl('https://img-blog.csdnimg.cn/a.png', { siteHosts, knownRealPaths })).toEqual(
      { kind: 'remote' },
    );
    expect(classifyImageUrl('http://cdn.other.com/b.jpg', { siteHosts })).toEqual({ kind: 'remote' });
  });
});

describe('collectSiteHosts', () => {
  it('normalizes baseUrl and extra host:port values', () => {
    expect(
      collectSiteHosts('https://blog.example.com/', ['blog.example.com:443', 'https://cdn.example.com']),
    ).toEqual(['blog.example.com', 'cdn.example.com']);
  });
});

describe('applyImageUrlMap (#434)', () => {
  it('rewrites only image URLs and leaves regular links and skipped images', () => {
    const content = [
      '![a](https://img-blog.csdnimg.cn/a.png)',
      '<img src="https://cdn.csdn.net/c.jpg">',
      '![keep](/static/img/keep.webp)',
      '[page](https://img-blog.csdnimg.cn/a.png)',
    ].join('\n');
    const next = applyImageUrlMap(
      content,
      new Map([
        ['https://img-blog.csdnimg.cn/a.png', '/static/img/a.webp'],
        ['https://cdn.csdn.net/c.jpg', '/static/img/c.webp'],
      ]),
    );
    expect(next).toContain('![a](/static/img/a.webp)');
    expect(next).toContain('src="/static/img/c.webp"');
    expect(next).toContain('![keep](/static/img/keep.webp)');
    expect(next).toContain('[page](https://img-blog.csdnimg.cn/a.png)');
  });
});

describe('filenameFromRemote / looksLikeImage', () => {
  it('uses the last path segment and strips query/hash', () => {
    expect(filenameFromRemote('https://img-blog.csdnimg.cn/shot.png?x-oss-process=1#pic')).toBe(
      'shot.png',
    );
    expect(filenameFromRemote('https://cdn.example.com/img_convert/abc', 'image/jpeg')).toBe('abc.jpg');
  });

  it('detects common image magic bytes', () => {
    expect(looksLikeImage(Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'application/octet-stream')).toBe(
      true,
    );
    expect(looksLikeImage(Buffer.from('<html>not-an-image'), 'text/html')).toBe(false);
    expect(looksLikeImage(Buffer.from('xxxx'), 'image/webp')).toBe(true);
  });
});
