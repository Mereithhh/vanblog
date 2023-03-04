export const washArticlesByKey = (
  rawArticles: any[],
  getValueFn: (val: any) => any,
  isKeyArray: boolean
) => {
  const articles = {} as any;

  const dates = Array.from(
    new Set(
      isKeyArray
        ? rawArticles.flatMap((a) => getValueFn(a))
        : rawArticles.map((a) => getValueFn(a))
    )
  );

  for (const date of dates) {
    const curArticles = rawArticles
      .filter((each) =>
        isKeyArray ? getValueFn(each).includes(date) : getValueFn(each) == date
      )
      .map((each) => ({
        title: each.title,
        id: each.id,
        createdAt: each.createdAt,
        updatedAt: each.updatedAt,
      }))
      .sort(
        (prev, next) =>
          new Date(next.createdAt).getTime() -
          new Date(prev.createdAt).getTime()
      );

    articles[String(date)] = curArticles;
  }

  return articles;
};
