import { Article } from "../types/article";
import { sortArticleWithTop } from "./sortArticles";
import { wordCount } from "./wordCount";

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

export function getTotalCount(articles: any[]) {
  let wordTotal = 0;
  articles.forEach((a) => {
    wordTotal = wordTotal + wordCount(a.content);
  });
  return wordTotal;
}

export function getArticlesByNum(
  articles: Article[],
  curPage: number,
  num: number
) {
  const sortedArticles = sortArticleWithTop(articles);
  const toReturn = [];
  // 前面的不要
  for (let j = 0; j < curPage - 1; j++) {
    for (let i = 0; i < 5; i++) {
      sortedArticles.pop();
    }
  }
  //后面的要num个。
  for (let i = 0; i < num; i++) {
    const a = sortedArticles.pop();
    if (a) {
      toReturn.push(a);
    }
  }
  return toReturn;
}

export function getCurrArticleProps(allArticles: Article[], rawId: string) {
  const id = parseInt(rawId);
  const sortedArticle = allArticles.sort(
    (a, b) => new Date(b.createdAt).valueOf() - new Date(a.createdAt).valueOf()
  );
  const article = allArticles.find((each) => {
    return each.id == id;
  }) as Article;
  const curIndex = sortedArticle.indexOf(article as Article);
  let pre = {} as any;
  let next = {} as any;
  if (curIndex > 0) {
    next["id"] = sortedArticle[curIndex - 1].id;
    next["title"] = sortedArticle[curIndex - 1].title;
  }
  if (curIndex < sortedArticle.length - 1) {
    pre["id"] = sortedArticle[curIndex + 1].id;
    pre["title"] = sortedArticle[curIndex + 1].title;
  }
  return {
    article,
    pre,
    next,
  };
}
