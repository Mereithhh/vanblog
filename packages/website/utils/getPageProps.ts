import { getPublicAll } from "../api/getAllData";
import { IndexPageProps } from "../pages/index";
import { TagPageProps } from "../pages/tag";
import { TimeLinePageProps } from "../pages/timeline";
import { CategoryPageProps } from "../pages/category";
import { getAuthorCardProps, getLayoutProps } from "./getLayoutProps";
import {
  getArticlesByNum,
  getCurrArticleProps,
  getTotalCount,
  washArticlesByKey,
} from "./washArticles";
import { AboutPageProps } from "../pages/about";
import { TagPagesProps } from "../pages/tag/[tag]";
import { PostPagesProps } from "../pages/post/[id]";
import { Article } from "../types/article";
import { PagePagesProps } from "../pages/page/[p]";
import { CategoryPagesProps } from "../pages/category/[category]";

export async function getIndexPageProps(): Promise<IndexPageProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const articles = getArticlesByNum(data.articles, 1, 5);
  return {
    layoutProps,
    articles,
    currPage: 1,
    authorCardProps,
  };
}

export async function getTimeLinePageProps(): Promise<TimeLinePageProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const sortedArticles = washArticlesByKey(
    data.articles,
    (each) => new Date(each.createdAt).getFullYear(),
    false
  );
  const wordTotal = getTotalCount(data.articles);
  return {
    layoutProps,
    authorCardProps,
    sortedArticles,
    wordTotal,
  };
}
export async function getTagPageProps(): Promise<TagPageProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const tags = data.tags;
  return {
    layoutProps,
    authorCardProps,
    tags,
  };
}
export async function getCategoryPageProps(): Promise<CategoryPageProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const wordTotal = getTotalCount(data.articles);
  const sortedArticles = washArticlesByKey(
    data.articles,
    (each) => each.category,
    false
  );
  return {
    layoutProps,
    authorCardProps,
    wordTotal,
    sortedArticles,
  };
}
export async function getAboutPageProps(): Promise<AboutPageProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const about = data.meta.about;
  return {
    layoutProps,
    authorCardProps,
    about,
  };
}
export async function getTagPagesProps(
  currTag: string
): Promise<TagPagesProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const articlesInThisTag = data.articles.filter((item) => {
    return item.tags.includes(currTag);
  });
  const wordTotal = getTotalCount(articlesInThisTag);
  const curNum = articlesInThisTag.length;
  const sortedArticles = washArticlesByKey(
    articlesInThisTag,
    (each) => new Date(each.createdAt).getFullYear(),
    false
  );
  return {
    layoutProps,
    authorCardProps,
    currTag,
    sortedArticles,
    curNum,
    wordTotal,
  };
}

export async function getPostPagesProps(
  curId: string
): Promise<PostPagesProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const payProps = {
    pay: [data.meta.siteInfo.payAliPay, data.meta.siteInfo.payWechat],
    payDark: [
      data.meta.siteInfo?.payAliPayDark || "",
      data.meta.siteInfo?.payWechatDark || "",
    ],
  };
  const currArticleProps = getCurrArticleProps(data.articles, curId);
  return {
    layoutProps,
    ...currArticleProps,
    ...payProps,
    author: data.meta.siteInfo.author,
  };
}
export async function getPagePagesProps(
  curId: string
): Promise<PagePagesProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const currPage = parseInt(curId);
  const articles = getArticlesByNum(data.articles, currPage, 5);
  return {
    layoutProps,
    articles,
    currPage,
    authorCardProps,
  };
}
export async function getCategoryPagesProps(
  curCategory: string
): Promise<CategoryPagesProps> {
  const data = await getPublicAll();
  const layoutProps = getLayoutProps(data);
  const articlesInThisCategory = data.articles.filter((item) => {
    return item.category == curCategory;
  });
  const authorCardProps = getAuthorCardProps(data);
  const wordTotal = getTotalCount(articlesInThisCategory);
  const curNum = articlesInThisCategory.length;
  const sortedArticles = washArticlesByKey(
    articlesInThisCategory,
    (each) => each.category,
    false
  );
  return {
    layoutProps,
    curCategory,
    sortedArticles,
    authorCardProps,
    wordTotal,
    curNum,
  };
}
