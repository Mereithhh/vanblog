import { HeadTag } from "../utils/getLayoutProps";
import { logDefaultValueUsage, isBuildTime } from "../utils/loadConfig";
import { apiService } from "./service";
import { PageViewData } from "./types";

// Re-export types used in public interface
export type SocialType =
  | "bilibili"
  | "email"
  | "github"
  | "wechat"
  | "gitee"
  | "wechat-dark";

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

// Default menu items
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
  walineConfig?: {
    serverURL?: string;
  };
}

/**
 * Get public metadata
 */
export const getPublicMeta = async (): Promise<PublicMetaProp> => {
  try {
    return await apiService.getMeta();
  } catch (err) {
    console.error('Error fetching public meta:', err);
    
    if (isBuildTime) {
      logDefaultValueUsage('getPublicMeta');
    }
    
    // Return a basic structure with empty values
    return {
      version: '1.0.0',
      tags: [],
      totalArticles: 0,
      totalWordCount: 0,
      meta: {
        links: [],
        socials: [],
        rewards: [],
        categories: [],
        about: {
          updatedAt: new Date().toISOString(),
          content: ''
        },
        siteInfo: {
          author: 'Author',
          authorDesc: '',
          authorLogo: '',
          siteLogo: '',
          favicon: '/favicon.ico',
          siteName: 'Blog',
          siteDesc: 'A VanBlog site',
          beianNumber: '',
          beianUrl: '',
          gaBeianNumber: '',
          gaBeianUrl: '',
          gaBeianLogoUrl: '',
          payAliPay: '',
          payWechat: '',
          since: new Date().getFullYear().toString(),
          baseUrl: 'http://localhost:3000',
          copyrightAggreement: '',
          showDonateInfo: 'false',
          showFriends: 'false',
          enableComment: 'false',
          defaultTheme: 'light',
          enableCustomizing: 'false',
          showDonateButton: 'false',
          showCopyRight: 'false',
          showRSS: 'false',
          openArticleLinksInNewWindow: 'false',
          showExpirationReminder: 'false',
          showEditButton: 'false',
        }
      },
      menus: defaultMenu
    };
  }
};

/**
 * Get all custom pages
 */
export const getAllCustomPages = async (): Promise<CustomPageList[]> => {
  try {
    return await apiService.getAllCustomPages();
  } catch (err) {
    console.error('Error fetching custom pages:', err);
    return [];
  }
};

/**
 * Get a specific custom page by path
 */
export const getCustomPage = async (path: string): Promise<CustomPage | null> => {
  try {
    return await apiService.getCustomPage(path);
  } catch (err) {
    console.error(`Error fetching custom page (${path}):`, err);
    return null;
  }
};

/**
 * Get article viewer statistics by article ID
 */
export const getArticleViewer = async (id: number | string): Promise<PageViewData> => {
  if(isBuildTime) {
    return {
      viewer: 0,
      visited: 0
    };
  }

  return apiService.getArticleViewer(id);
};

