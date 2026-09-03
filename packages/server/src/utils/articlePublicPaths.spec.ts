import { getAllArticlePublicPaths, getArticlePublicPaths } from './articlePublicPaths';

describe('getArticlePublicPaths', () => {
  it('always includes the numeric-id URL', () => {
    expect(getArticlePublicPaths({ id: 30 })).toEqual(['/post/30']);
  });

  it('includes both id and custom pathname (#356)', () => {
    expect(getArticlePublicPaths({ id: 30, pathname: 'gitea' })).toEqual([
      '/post/30',
      '/post/gitea',
    ]);
  });

  it('ignores empty or id-equal pathname', () => {
    expect(getArticlePublicPaths({ id: 30, pathname: '   ' })).toEqual(['/post/30']);
    expect(getArticlePublicPaths({ id: 30, pathname: '30' })).toEqual(['/post/30']);
    expect(getArticlePublicPaths({ id: 30, pathname: null })).toEqual(['/post/30']);
  });
});

describe('getAllArticlePublicPaths', () => {
  it('reproduces the old bug: pathname-only list leaves /post/id stale', () => {
    const articles = [{ id: 30, pathname: 'gitea' }];
    const oldUrls = articles.map((a) => `/post/${a.pathname || a.id}`);
    expect(oldUrls).toEqual(['/post/gitea']);
    expect(oldUrls).not.toContain('/post/30');
    expect(getAllArticlePublicPaths(articles)).toEqual(['/post/30', '/post/gitea']);
  });

  it('deduplicates overlapping paths', () => {
    expect(
      getAllArticlePublicPaths([
        { id: 1, pathname: 'hello' },
        { id: 2 },
        { id: 1, pathname: 'hello' },
      ]),
    ).toEqual(['/post/1', '/post/hello', '/post/2']);
  });
});
