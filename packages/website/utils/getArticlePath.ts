import { Article } from "../types/article";

export const getArticlePath = (
  article: Article | { id: number; pathname?: string }
) => {
  const { id, pathname } = article;
  return `${pathname ? pathname : id}`;
};
