export function sortArticleWithTop(data: any[]) {
  let sortedArticles = data.sort(
    (a, b) => new Date(a.createdAt).valueOf() - new Date(b.createdAt).valueOf()
  );
  // 把 顶置的按顺序提前
  let topedArticles = data.filter((article) => {
    if (article.top && article.top != 0) {
      return true;
    }
    return false;
  });
  // console.log(topedArticles.map((a) => a.title));
  // 不顶置的
  const notTopedArticles = data.filter((article) => {
    if (article.top && article.top != 0) {
      return false;
    }
    return true;
  });
  // 排序顶置的
  topedArticles = topedArticles.sort((a, b) => {
    return a.top - b.top;
  });
  sortedArticles = [...notTopedArticles, ...topedArticles];
  return sortedArticles;
}
