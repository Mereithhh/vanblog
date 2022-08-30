export function washArticlesByKey(
  rawArticles: any[],
  getValueFn: (val: any) => any,
  isKeyArray: boolean
) {
  const articles = {} as any;
  let dates = [];
  if (isKeyArray) {
    dates = Array.from(new Set(rawArticles.flatMap((a) => getValueFn(a))));
  } else {
    dates = Array.from(new Set(rawArticles.map((a) => getValueFn(a))));
  }
  for (const date of dates) {
    let curArticles = rawArticles
      .filter((each) => {
        if (isKeyArray) {
          return getValueFn(each).includes(date);
        } else {
          return getValueFn(each) == date;
        }
      })
      .map((each) => {
        return {
          title: each.title,
          id: each.id,
          createdAt: each.createdAt,
          updatedAt: each.updatedAt,
        };
      });
    curArticles = curArticles.sort(
      (a, b) =>
        new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
    );
    articles[String(date)] = curArticles;
  }
  return articles;
}
