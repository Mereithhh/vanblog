export type ArticlePathSource = {
  id: number | string;
  pathname?: string | null;
};

/**
 * Public URLs that Next.js ISR caches independently for one article.
 * A custom pathname does not replace the numeric-id route — both stay valid.
 */
export function getArticlePublicPaths(article: ArticlePathSource): string[] {
  const paths = [`/post/${article.id}`];
  const pathname = typeof article.pathname === 'string' ? article.pathname.trim() : '';
  if (pathname && pathname !== String(article.id)) {
    paths.push(`/post/${pathname}`);
  }
  return paths;
}

export function getAllArticlePublicPaths(articles: ArticlePathSource[]): string[] {
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const article of articles) {
    for (const path of getArticlePublicPaths(article)) {
      if (seen.has(path)) {
        continue;
      }
      seen.add(path);
      urls.push(path);
    }
  }
  return urls;
}
