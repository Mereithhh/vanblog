import { getPublicMeta } from "../api/getAllData";
import { IndexPageProps } from "../pages/index";
import { TagPageProps } from "../pages/tag";
import { TimeLinePageProps } from "../pages/timeline";
import { CategoryPageProps } from "../pages/category";
import { getAuthorCardProps, getLayoutProps } from "./getLayoutProps";
import { washArticlesByKey } from "./washArticles";
import { AboutPageProps } from "../pages/about";
import { TagPagesProps } from "../pages/tag/[tag]";
import { PostPagesProps } from "../pages/post/[id]";
import { PagePagesProps } from "../pages/page/[p]";
import { CategoryPagesProps } from "../pages/category/[category]";
import {
  getArticleByIdOrPathname,
  getArticlesByCategory,
  getArticlesByOption,
  getArticlesByTimeLine,
} from "../api/getArticles";
import { LinkPageProps } from "../pages/link";

export async function getIndexPageProps(): Promise<IndexPageProps> {
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const { articles } = await getArticlesByOption({
    page: 1,
    pageSize: 5,
  });
  return {
    layoutProps,
    articles,
    currPage: 1,
    authorCardProps,
  };
}

export async function getTimeLinePageProps(): Promise<TimeLinePageProps> {
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const sortedArticles = await getArticlesByTimeLine();
  const wordTotal = data.totalWordCount;
  return {
    layoutProps,
    authorCardProps,
    sortedArticles,
    wordTotal,
  };
}
export async function getTagPageProps(): Promise<TagPageProps> {
  const data = await getPublicMeta();
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
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const wordTotal = data.totalWordCount;
  const sortedArticles = await getArticlesByCategory();
  return {
    layoutProps,
    authorCardProps,
    wordTotal,
    sortedArticles,
  };
}
export async function getLinkPageProps(): Promise<LinkPageProps> {
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  return {
    layoutProps,
    authorCardProps,
    links: data.meta.links,
  };
}
export async function getAboutPageProps(): Promise<AboutPageProps> {
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const about = data.meta.about;
  let showDonateInfo: "true" | "false" = "true";
  if (data.meta.siteInfo?.showDonateInfo == "false") {
    showDonateInfo = "false";
  }
  let showDonateInAbout: "true" | "false" = "false";

  if (data.meta.siteInfo?.showDonateInAbout == "true") {
    showDonateInAbout = "true";
  }
  if (data.meta.siteInfo?.showDonateButton == "false") {
    showDonateInAbout = "false";
  }
  const payProps = {
    pay: [
      data.meta.siteInfo?.payAliPay || "",
      data.meta.siteInfo?.payWechat || "",
    ],
    payDark: [
      data.meta.siteInfo?.payAliPayDark || "",
      data.meta.siteInfo?.payWechatDark || "",
    ],
  };
  return {
    showDonateInfo,
    layoutProps,
    authorCardProps,
    about,
    donates: data.meta?.rewards || [],
    showDonateInAbout,
    ...payProps,
  };
}
export async function getTagPagesProps(
  currTag: string
): Promise<TagPagesProps> {
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const {
    articles: articlesInThisTag,
    total,
    totalWordCount,
  } = await getArticlesByOption({
    page: 1,
    pageSize: -1,
    tags: currTag,
    withWordCount: true,
    toListView: true,
  });
  const wordTotal = totalWordCount || 0;
  const curNum = total;
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
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const payProps = {
    pay: [
      data.meta.siteInfo?.payAliPay || "",
      data.meta.siteInfo?.payWechat || "",
    ],
    payDark: [
      data.meta.siteInfo?.payAliPayDark || "",
      data.meta.siteInfo?.payWechatDark || "",
    ],
  };
  const currArticleProps = await getArticleByIdOrPathname(curId);
  const { article } = currArticleProps;
  const author = article?.author || data.meta.siteInfo.author;
  return {
    layoutProps,
    ...currArticleProps,
    ...payProps,
    author,
    showSubMenu: layoutProps.showSubMenu,
  };
}
export async function getPagePagesProps(
  curId: string
): Promise<PagePagesProps> {
  const data = await getPublicMeta();
  const layoutProps = getLayoutProps(data);
  const authorCardProps = getAuthorCardProps(data);
  const currPage = parseInt(curId);
  const { articles } = await getArticlesByOption({
    page: currPage,
    pageSize: 5,
  });
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
  const data = await getPublicMeta();
  const authorCardProps = getAuthorCardProps(data);
  const layoutProps = getLayoutProps(data);
  const {
    articles: articlesInThisCategory,
    total,
    totalWordCount,
  } = await getArticlesByOption({
    page: 1,
    pageSize: -1,
    category: curCategory,
    withWordCount: true,
    toListView: true,
  });

  const wordTotal = totalWordCount as number;
  const curNum = total;
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
