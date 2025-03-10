import { Article } from "../types/article";
import { config, logDefaultValueUsage, isBuildTime } from "../utils/loadConfig";
import { encodeQuerystring } from "../utils/encode";

export type SortOrder = "asc" | "desc";
export interface GetArticleOption {
  page: number;
  pageSize: number;
  toListView?: boolean;
  category?: string;
  tags?: string;
  sortCreatedAt?: SortOrder;
  sortTop?: SortOrder;
  withWordCount?: boolean;
}

// 缓存数据，避免重复请求
const articleCache = new Map<string, any>();

// 生成缓存键
const getCacheKey = (endpoint: string, queryString: string = "") => {
  return `${endpoint}:${queryString}`;
};

// 创建默认的文章列表返回值
const defaultArticleListResult = {
  articles: [],
  total: 0,
  totalWordCount: 0
};

// 创建默认的单篇文章返回值
const defaultSingleArticleResult = {
  article: {
    title: "示例文章",
    content: "这是一篇示例文章，由于无法连接到服务器，显示此默认内容。",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tags: [],
    category: "默认分类",
    id: 0,
    pathname: "default",
    private: false,
  },
};

// 创建默认的分类或时间线返回值
const defaultCategoryOrTimelineResult = {};

export const getArticlesByOption = async (
  option: GetArticleOption
): Promise<{ articles: Article[]; total: number; totalWordCount?: number }> => {
  // 构建查询字符串
  let queryString = "";
  for (const [k, v] of Object.entries(option)) {
    queryString += `${k}=${v}&`;
  }
  queryString = queryString.substring(0, queryString.length - 1);
  queryString = encodeQuerystring(queryString);
  
  // 检查缓存
  const cacheKey = getCacheKey("article", queryString);
  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey);
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("文章列表");
    return defaultArticleListResult;
  }

  try {
    const url = `${config.baseUrl}api/public/article?${queryString}`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultArticleListResult;
    }
    // 缓存结果
    articleCache.set(cacheKey, data);
    return data;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("文章列表");
      return defaultArticleListResult;
    } else {
      throw err;
    }
  }
};

export const getArticlesByTimeLine = async () => {
  // 检查缓存
  const cacheKey = getCacheKey("timeline");
  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey);
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("时间线");
    return defaultCategoryOrTimelineResult;
  }
  
  try {
    const url = `${config.baseUrl}api/public/article/timeline`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultCategoryOrTimelineResult;
    }
    // 缓存结果
    articleCache.set(cacheKey, data);
    return data;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("时间线");
      return defaultCategoryOrTimelineResult;
    } else {
      throw err;
    }
  }
};

export const getArticlesByCategory = async () => {
  // 检查缓存
  const cacheKey = getCacheKey("category");
  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey);
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("分类");
    return defaultCategoryOrTimelineResult;
  }
  
  try {
    const url = `${config.baseUrl}api/public/article/category`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultCategoryOrTimelineResult;
    }
    // 缓存结果
    articleCache.set(cacheKey, data);
    return data;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("分类");
      return defaultCategoryOrTimelineResult;
    } else {
      throw err;
    }
  }
};

export const getArticlesByTag = async (tagName: string) => {
  // 检查缓存
  const cacheKey = getCacheKey("tag", tagName);
  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey);
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("标签");
    return defaultCategoryOrTimelineResult;
  }
  
  try {
    const url = `${config.baseUrl}api/public/article/tag?tag=${tagName}`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultCategoryOrTimelineResult;
    }
    // 缓存结果
    articleCache.set(cacheKey, data);
    return data;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("标签");
      return defaultCategoryOrTimelineResult;
    } else {
      throw err;
    }
  }
};

export const getArticleByIdOrPathname = async (
  idOrPathname: string | number
): Promise<{ 
  article: Article; 
  pre?: { id: number; title: string; pathname?: string };
  next?: { id: number; title: string; pathname?: string };
}> => {
  // 检查缓存
  const cacheKey = getCacheKey("article-detail", idOrPathname.toString());
  if (articleCache.has(cacheKey)) {
    return articleCache.get(cacheKey);
  }
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("文章详情");
    return {
      article: defaultSingleArticleResult.article,
      pre: { id: 0, title: "", pathname: "" },
      next: { id: 0, title: "", pathname: "" }
    };
  }
  
  try {
    const url = `${config.baseUrl}api/public/article/${idOrPathname}`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return {
        article: defaultSingleArticleResult.article,
        pre: { id: 0, title: "", pathname: "" },
        next: { id: 0, title: "", pathname: "" }
      };
    }
    
    // 处理返回数据，确保包含pre和next
    const result = {
      article: data.article,
      pre: data.pre ? { 
        id: data.pre.id, 
        title: data.pre.title, 
        pathname: data.pre.pathname 
      } : undefined,
      next: data.next ? { 
        id: data.next.id, 
        title: data.next.title, 
        pathname: data.next.pathname 
      } : undefined
    };
    
    // 缓存结果
    articleCache.set(cacheKey, result);
    return result;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("文章详情");
      return {
        article: defaultSingleArticleResult.article,
        pre: { id: 0, title: "", pathname: "" },
        next: { id: 0, title: "", pathname: "" }
      };
    } else {
      throw err;
    }
  }
};

export const getEncryptedArticleByIdOrPathname = async (
  idOrPathname: string | number,
  password: string
): Promise<{ article: Article }> => {
  // 检查缓存 - 对于加密文章，不使用缓存
  
  // 如果是构建环境，直接返回默认值
  if (isBuildTime) {
    logDefaultValueUsage("加密文章");
    return defaultSingleArticleResult;
  }
  
  try {
    const url = `${config.baseUrl}api/public/article/${idOrPathname}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        password,
      }),
    });
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultSingleArticleResult;
    }
    return data;
  } catch (err) {
    if (isBuildTime) {
      logDefaultValueUsage("加密文章");
      return defaultSingleArticleResult;
    } else {
      throw err;
    }
  }
};
