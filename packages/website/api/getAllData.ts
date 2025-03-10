import { HeadTag } from "../utils/getLayoutProps";
import { config, logDefaultValueUsage, isBuildTime } from "../utils/loadConfig";
export type SocialType =
  | "bilibili"
  | "email"
  | "github"
  | "wechat"
  | "gitee"
  | "wechat-dark";
export const defaultMenu: MenuItem[] = [
  {
    id: 0,
    name: "首页",
    value: "/",
    level: 0,
  },
  {
    id: 1,
    name: "标签",
    value: "/tag",
    level: 0,
  },
  {
    id: 2,
    name: "分类",
    value: "/category",
    level: 0,
  },
  {
    id: 3,
    name: "时间线",
    value: "/timeline",
    level: 0,
  },
  {
    id: 4,
    name: "友链",
    value: "/link",
    level: 0,
  },
  {
    id: 5,
    name: "关于",
    value: "/about",
    level: 0,
  },
];
export interface CustomPageList {
  name: string;
  path: string;
}
export interface CustomPage extends CustomPageList {
  html: string;
}
export interface SocialItem {
  updatedAt: string;
  type: SocialType;
  value: string;
  dark?: string;
}
export interface MenuItem {
  id: number;
  name: string;
  value: string;
  level: number;
  children?: MenuItem[];
}
export interface DonateItem {
  name: string;
  value: string;
  updatedAt: string;
}
export interface LinkItem {
  name: string;
  desc: string;
  logo: string;
  url: string;
  updatedAt: string;
}
export interface MetaProps {
  links: LinkItem[];
  socials: SocialItem[];
  rewards: DonateItem[];
  categories: string[];
  about: {
    updatedAt: string;
    content: string;
  };
  siteInfo: {
    author: string;
    authorDesc: string;
    authorLogo: string;
    authorLogoDark?: string;
    siteLogo: string;
    favicon: string;
    siteName: string;
    siteDesc: string;
    beianNumber: string;
    beianUrl: string;
    gaBeianNumber: string;
    gaBeianUrl: string;
    gaBeianLogoUrl: string;
    payAliPay: string;
    payWechat: string;
    payAliPayDark?: string;
    payWechatDark?: string;
    since: string;
    baseUrl: string;
    baiduAnalysisId?: string;
    gaAnalysisId?: string;
    siteLogoDark?: string;
    copyrightAggreement: string;
    showSubMenu?: "true" | "false";
    showAdminButton?: "true" | "false";
    headerLeftContent?: "siteLogo" | "siteName";
    subMenuOffset?: number;
    showDonateInfo: "true" | "false";
    showFriends: "true" | "false";
    enableComment: "true" | "false";
    defaultTheme: "auto" | "light" | "dark";
    showDonateInAbout?: "true" | "false";
    enableCustomizing: "true" | "false";
    showDonateButton: "true" | "false";
    showCopyRight: "true" | "false";
    showRSS: "true" | "false";
    openArticleLinksInNewWindow: "true" | "false";
    showExpirationReminder: "true" | "false";
    showEditButton: "true" | "false";
  };
}
export interface PublicMetaProp {
  version: string;
  tags: string[];
  totalArticles: number;
  meta: MetaProps;
  menus: MenuItem[];
  totalWordCount: number;
  layout?: {
    css?: string;
    script?: string;
    html?: string;
    head?: HeadTag[];
  };
}

export const version = process.env["VAN_BLOG_VERSION"] || "dev";

const defaultMeta: MetaProps = {
  categories: [],
  links: [],
  socials: [],
  rewards: [],
  about: {
    updatedAt: new Date().toISOString(),
    content: "",
  },
  siteInfo: {
    author: "作者名字",
    authorDesc: "作者描述",
    authorLogo: "/logo.svg",
    siteLogo: "/logo.svg",
    favicon: "/logo.svg",
    siteName: "VanBlog",
    siteDesc: "Vanblog",
    copyrightAggreement: "",
    beianNumber: "",
    beianUrl: "",
    gaBeianNumber: "",
    gaBeianUrl: "",
    gaBeianLogoUrl: "",
    payAliPay: "",
    payWechat: "",
    payAliPayDark: "",
    payWechatDark: "",
    since: "",
    enableComment: "true",
    baseUrl: "",
    showDonateInfo: "true",
    showFriends: "true",
    showAdminButton: "true",
    defaultTheme: "auto",
    showDonateInAbout: "false",
    enableCustomizing: "true",
    showCopyRight: "true",
    showDonateButton: "true",
    showExpirationReminder: "true",
    showRSS: "true",
    openArticleLinksInNewWindow: "false",
    showEditButton: "false",
  },
};

export const defaultPublicMetaProp: PublicMetaProp = {
  version: "0.0.0",
  tags: [],
  totalArticles: 0,
  totalWordCount: 0,
  menus: [],
  meta: {
    links: [],
    socials: [],
    rewards: [],
    categories: [],
    about: {
      updatedAt: "",
      content: "",
    },
    siteInfo: {
      author: "",
      authorDesc: "",
      authorLogo: "",
      siteLogo: "",
      favicon: "",
      siteName: "",
      siteDesc: "",
      beianNumber: "",
      beianUrl: "",
      gaBeianNumber: "",
      gaBeianUrl: "",
      gaBeianLogoUrl: "",
      payAliPay: "",
      payWechat: "",
      since: "",
      baseUrl: "",
      copyrightAggreement: "",
      showSubMenu: "false",
      showAdminButton: "false",
      headerLeftContent: "siteName",
      showDonateInfo: "false",
      showFriends: "false",
      enableComment: "false",
      defaultTheme: "auto",
      enableCustomizing: "false",
      showDonateButton: "false",
      showCopyRight: "false",
      showRSS: "false",
      openArticleLinksInNewWindow: "false",
      showExpirationReminder: "false",
      showEditButton: "false",
    },
  },
};

// 缓存数据，避免重复请求
let cachedPublicMeta: PublicMetaProp | null = null;
let cachedCustomPages: CustomPageList[] | null = null;

export async function getPublicMeta(): Promise<PublicMetaProp> {
  // 如果已经有缓存数据，直接返回
  if (cachedPublicMeta) {
    return cachedPublicMeta;
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("元数据");
    return defaultPublicMetaProp;
  }
  
  try {
    const url = `${config.baseUrl}api/public/meta`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultPublicMetaProp;
    }
    // 缓存结果
    cachedPublicMeta = data;
    return data;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("元数据");
      return defaultPublicMetaProp;
    } else {
      throw err;
    }
  }
}

export async function getAllCustomPages(): Promise<CustomPageList[]> {
  // 如果已经有缓存数据，直接返回
  if (cachedCustomPages) {
    return cachedCustomPages;
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("自定义页面");
    return [];
  }
  
  try {
    const url = `${config.baseUrl}api/public/customPage/all`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 200) {
      // 缓存结果
      cachedCustomPages = data;
      return data;
    } else {
      return [];
    }
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("自定义页面");
      return [];
    } else {
      throw err;
    }
  }
}

export async function getCustomPageByPath(
  path: string
): Promise<CustomPage | null> {
  try {
    const url = `${config.baseUrl}api/public/customPage?path=${path}`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 200) {
      return data;
    } else {
      return null;
    }
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("自定义页面");
      return null;
    } else {
      throw err;
    }
  }
}
