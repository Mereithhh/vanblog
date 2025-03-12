import { GetStaticProps } from "next";
import { getArticleByIdOrPathname, getArticlesByCategory, getArticlesByOption, getArticlesByTag, getArticlesByTimeLine, getArticlesByTagName, getArticlesByCategoryName } from "../api/getArticles";
import { getPublicMeta, PublicMetaProp } from "../api/getAllData";
import { IndexPageProps } from "../pages/index";
import { LinkPageProps } from "../pages/link";
import { TagPageProps } from "../pages/tag";
import { PostPagesProps } from "../pages/post/[id]";
import { CategoryPagesProps } from "../pages/category/[category]";
import { PagePagesProps } from "../pages/page/[p]";
import { TimeLinePageProps } from "../pages/timeline";
import { CategoryPageProps } from "../pages/category";
import { getLayoutProps, getLayoutPropsFromData, getAuthorCardProps, LayoutProps, HeadTag } from "./getLayoutProps";
import { washArticlesByKey } from "./washArticles";
import { AboutPageProps } from "../pages/about";
import { Article } from "../types/article";
import { getCustomPage } from "../api/getAllData";
import { config, isBuildTime } from "./loadConfig";
import { TagPagesProps } from "../pages/tag/[tag]";
import { getArticleViewer } from "../api/getArticleViewer";
import { getServerPageview, PageViewData } from "../api/pageview";
import { AuthorCardProps } from "../components/AuthorCard";

const defaultLayoutProps: LayoutProps = {
  description: "",
  ipcNumber: "",
  since: "",
  ipcHref: "",
  gaBeianNumber: "",
  gaBeianUrl: "",
  gaBeianLogoUrl: "",
  copyrightAggreement: "",
  logo: "",
  categories: [],
  favicon: "",
  siteName: "",
  siteDesc: "",
  baiduAnalysisID: "",
  gaAnalysisID: "",
  logoDark: "",
  version: "",
  menus: [],
  showSubMenu: "false",
  showAdminButton: "false",
  showFriends: "false",
  headerLeftContent: "siteName",
  enableComment: "false",
  defaultTheme: "auto",
  enableCustomizing: "false",
  showDonateButton: "false",
  showCopyRight: "false",
  showRSS: "false",
  showExpirationReminder: "false",
  openArticleLinksInNewWindow: "false",
  showEditButton: "false",
  subMenuOffset: 0,
  walineServerURL: "",
};

const defaultAuthorCardProps: AuthorCardProps = {
  author: "Default Author",
  desc: "Default description",
  logo: "/logo.png",
  logoDark: "/logo-dark.png",
  postNum: 0,
  catelogNum: 0,
  tagNum: 0,
  socials: [],
  showSubMenu: "false",
  showRSS: "false"
};

// Add PageViewData to all page props interfaces
export interface CommonPageProps {
  pageViewData: PageViewData;
}

// Helper function to get pageview data
async function getPageViewData(): Promise<PageViewData> {
  if (isBuildTime) {
    return { viewer: 0, visited: 0 };
  }
  
  try {
    return await getServerPageview();
  } catch (error) {
    console.error("[getPageProps] Failed to get pageview data:", error);
    return { viewer: 0, visited: 0 };
  }
}

export async function getIndexPageProps(): Promise<IndexPageProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      articles: [],
      currPage: 1,
      pageViewData: { viewer: 0, visited: 0 }
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
  const authorCardProps = getAuthorCardProps(data);
  const { articles } = await getArticlesByOption({
    page: 1,
    pageSize: 5,
  });
  
  // Fetch pageview data
  const pageViewData = await getPageViewData();
  
  return {
    layoutProps,
    articles,
    currPage: 1,
    authorCardProps,
    pageViewData
  };
}

export async function getTimeLinePageProps(): Promise<TimeLinePageProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      timeLine: [],
      pageViewData: { viewer: 0, visited: 0 }
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
  const authorCardProps = getAuthorCardProps(data);
  
  // Get timeline data (returns Record<string, Article[]>)
  const timelineData = await getArticlesByTimeLine();
  
  // Convert to a flat array of articles
  const timeLine = Object.values(timelineData).flat();
  
  // Fetch pageview data
  const pageViewData = await getPageViewData();
  
  return {
    layoutProps,
    timeLine,
    authorCardProps,
    pageViewData
  };
}

export async function getTagPageProps(): Promise<TagPageProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      tags: [],
      pageViewData: { viewer: 0, visited: 0 }
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
  const authorCardProps = getAuthorCardProps(data);
  
  // Fetch pageview data
  const pageViewData = await getPageViewData();
  
  return {
    layoutProps,
    tags: data.tags,
    authorCardProps,
    pageViewData
  };
}

export async function getCategoryPageProps(): Promise<CategoryPageProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      categories: [],
      articles: [],
      pageViewData: { viewer: 0, visited: 0 }
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
  const authorCardProps = getAuthorCardProps(data);
  
  // Get category data (returns Record<string, Article[]>)
  const categoryData = await getArticlesByCategory();
  
  // Get all categories from meta data
  const categories = data.meta.categories;
  
  // Convert to a flat array of articles
  const articles = Object.values(categoryData).flat();
  
  // Fetch pageview data
  const pageViewData = await getPageViewData();
  
  return {
    layoutProps,
    articles,
    categories,
    authorCardProps,
    pageViewData
  };
}

export async function getLinkPageProps(): Promise<LinkPageProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      links: [],
      pageViewData: { viewer: 0, visited: 0 }
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
  const authorCardProps = getAuthorCardProps(data);
  
  // Fetch pageview data
  const pageViewData = await getPageViewData();
  
  return {
    layoutProps,
    authorCardProps,
    links: data.meta.links,
    pageViewData
  };
}

export async function getAboutPageProps(): Promise<AboutPageProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      showDonateInfo: "false",
      about: { content: "", updatedAt: new Date().toISOString() },
      donates: [],
      showDonateInAbout: "false",
      pay: ["", ""],
      payDark: ["", ""],
      pageViewData: { viewer: 0, visited: 0 }
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
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
  
  // Fetch pageview data
  const pageViewData = await getPageViewData();
  
  return {
    showDonateInfo,
    layoutProps,
    authorCardProps,
    about,
    donates: data.meta?.rewards || [],
    showDonateInAbout,
    ...payProps,
    pageViewData
  };
}

export async function getTagPagesProps(currTag: string): Promise<TagPagesProps> {
  try {
    const data = await getPublicMeta();
    const layoutProps = getLayoutPropsFromData(data);
    const authorCardProps = getAuthorCardProps(data);
    const articles = await getArticlesByTagName(currTag);
    const sortedArticles = washArticlesByKey(articles, article => new Date(article.createdAt).getFullYear().toString(), false);
    const wordTotal = data.totalWordCount;
    
    return {
      layoutProps,
      authorCardProps,
      sortedArticles,
      currTag,
      wordTotal,
      curNum: articles.length,
    };
  } catch (err) {
    console.log(err);
    return {
      layoutProps: await getLayoutProps(),
      authorCardProps: defaultAuthorCardProps,
      sortedArticles: {},
      currTag,
      wordTotal: 0,
      curNum: 0,
    };
  }
}

export async function getPostPagesProps(curId: string): Promise<PostPagesProps> {
  try {
    const data = await getPublicMeta();
    const layoutProps = getLayoutPropsFromData(data);
    const articleData = await getArticleByIdOrPathname(curId);
    const { article } = articleData;
    const author = article?.author || data.meta.siteInfo.author;
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
      layoutProps,
      article,
      ...payProps,
      author,
      showSubMenu: layoutProps.showSubMenu,
      pre: articleData.pre || { id: 0, title: "", pathname: "" },
      next: articleData.next || { id: 0, title: "", pathname: "" },
    };
  } catch (err) {
    // ... error handling ...
    return {
      layoutProps: await getLayoutProps(),
      article: {
        id: 0,
        title: "",
        content: "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: "",
        tags: [],
        private: false,
        top: 0,
      },
      pay: ["", ""],
      payDark: ["", ""],
      author: "",
      showSubMenu: "false",
      pre: { id: 0, title: "", pathname: "" },
      next: { id: 0, title: "", pathname: "" },
    };
  }
}

export async function getPagePagesProps(curId: string): Promise<PagePagesProps> {
  if (isBuildTime) {
    return {
      layoutProps: defaultLayoutProps,
      authorCardProps: defaultAuthorCardProps,
      articles: [],
      currPage: parseInt(curId),
    };
  }

  const data = await getPublicMeta();
  const layoutProps = getLayoutPropsFromData(data);
  const authorCardProps = getAuthorCardProps(data);
  const { articles } = await getArticlesByOption({
    page: parseInt(curId),
    pageSize: 5,
  });
  return {
    layoutProps,
    authorCardProps,
    articles,
    currPage: parseInt(curId),
  };
}

export async function getCategoryPagesProps(curCategory: string): Promise<CategoryPagesProps> {
  try {
    const data = await getPublicMeta();
    const layoutProps = getLayoutPropsFromData(data);
    const authorCardProps = getAuthorCardProps(data);
    const articles = await getArticlesByCategoryName(curCategory);
    const sortedArticles = washArticlesByKey(articles, article => new Date(article.createdAt).getFullYear().toString(), false);
    const wordTotal = data.totalWordCount;
    
    return {
      layoutProps,
      authorCardProps,
      sortedArticles,
      curCategory,
      wordTotal,
      curNum: articles.length,
    };
  } catch (err) {
    console.log(err);
    return {
      layoutProps: await getLayoutProps(),
      authorCardProps: defaultAuthorCardProps,
      sortedArticles: {},
      curCategory,
      wordTotal: 0,
      curNum: 0,
    };
  }
}
