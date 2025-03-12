import { HeadTag } from "../utils/getLayoutProps";
import { config, logDefaultValueUsage, isBuildTime } from "../utils/loadConfig";
import { apiClient } from "./client";

// Cache data to avoid repeated requests
const metaCache = new Map<string, any>();

// Generate cache key
const getCacheKey = (endpoint: string, queryString: string = "") => {
  return `${endpoint}:${queryString}`;
};

// Helper function for delayed retry
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add error types
export interface ApiError extends Error {
  status?: number;
  endpoint?: string;
  details?: any;
}

// Helper function to create API error
const createApiError = (message: string, status?: number, endpoint?: string, details?: any): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.endpoint = endpoint;
  error.details = details;
  return error;
};

// Helper function to handle API errors
const handleApiError = (err: any, context: string, defaultValue: any) => {
  const errorDetails = {
    context,
    error: err.message,
    status: err.status,
    endpoint: err.endpoint,
    details: err.details,
  };
  
  console.error(`[WebsiteProvider] Error in ${context}:`, errorDetails);
  
  if (isBuildTime) {
    logDefaultValueUsage(context);
  }
  return defaultValue;
};

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Update fetchWithRetry with better error handling and environment detection
const fetchWithRetry = async (url: string, options?: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
  // Check if we're in the browser (frontend) environment
  const isBrowser = typeof window !== 'undefined';
  
  // If you want to run only in frontend, uncomment this:
  if (!isBrowser) return new Response(null, { status: 404 });
  
  // If you want to run only in backend, uncomment this:
  // if (isBrowser) return new Response(null, { status: 404 });

  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw createApiError(
        `HTTP error, fetching ${url}! status: ${response.status}`,
        response.status,
        url,
        { method: options?.method || 'GET' }
      );
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`[WebsiteProvider] Retrying fetch to ${url}, ${retries} attempts remaining`);
      await wait(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

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
  walineConfig?: {
    serverURL?: string;
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

export const getPublicMeta = async () => {
  try {
    if (isBuildTime) {
      logDefaultValueUsage("元信息");
      return defaultPublicMetaProp;
    }
    
    const endpoint = '/api/public/meta';
    const response = await apiClient.get<{ statusCode: number; data: PublicMetaProp }>(
      endpoint, 
      undefined, 
      'getPublicMeta'
    );
    
    if (response.statusCode == 233) {
      console.warn('[WebsiteProvider] Invalid meta data received, using default');
      return defaultPublicMetaProp;
    }
    
    return response.data;
  } catch (err) {
    console.error('[WebsiteProvider] Error in 获取元信息:', err);
    if (isBuildTime) {
      logDefaultValueUsage("元信息");
    }
    return defaultPublicMetaProp;
  }
};

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
    const endpoint = '/api/public/customPage/all';
    const response = await apiClient.get<{ statusCode: number; data: CustomPageList[] }>(
      endpoint, 
      undefined, 
      'getAllCustomPages'
    );
    
    if (response.statusCode == 200) {
      // 缓存结果
      cachedCustomPages = response.data;
      return response.data;
    } else {
      return [];
    }
  } catch (err) {
    console.error('[WebsiteProvider] Error in 获取自定义页面:', err);
    if (isBuildTime) {
      logDefaultValueUsage("自定义页面");
    }
    return [];
  }
}

export async function getCustomPage(
  path: string
): Promise<CustomPage | null> {
  try {
    const endpoint = '/api/public/customPage';
    const params = { path };
    const response = await apiClient.get<{ statusCode: number; data: CustomPage }>(
      endpoint, 
      params, 
      'getCustomPage'
    );
    
    if (response.statusCode == 200) {
      return response.data;
    }
    return null;
  } catch (err) {
    console.error("Error fetching custom page:", err);
    return null;
  }
}
