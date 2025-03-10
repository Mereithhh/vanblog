import { Article } from "../types/article";
import { encodeQuerystring } from "../utils/encode";
import { config, logDefaultValueUsage } from "../utils/loadConfig";
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

// 创建默认的文章列表返回值
export const defaultArticleListResult = {
  articles: [],
  total: 0,
  totalWordCount: 0
};

// 创建默认的单篇文章返回值
export const defaultSingleArticleResult = {
  article: {
    id: 0,
    title: "示例文章",
    content: "这是一个示例文章，在构建过程中生成。",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    category: "默认分类",
    tags: ["示例标签"],
  }
};

// 创建默认的分类或时间线返回值
export const defaultCategoryOrTimelineResult = {};

export const getArticlesByOption = async (
  option: GetArticleOption
): Promise<{ articles: Article[]; total: number; totalWordCount?: number }> => {
  // 如果是Docker构建环境，直接返回默认值
  if (process.env.DOCKER_BUILD === "true") {
    logDefaultValueUsage("文章列表");
    return defaultArticleListResult;
  }

  let queryString = "";
  for (const [k, v] of Object.entries(option)) {
    queryString += `${k}=${v}&`;
  }
  queryString = queryString.substring(0, queryString.length - 1);
  queryString = encodeQuerystring(queryString);
  try {
    const url = `${config.baseUrl}api/public/article?${queryString}`;
    const res = await fetch(url);
    const { statusCode, data } = await res.json();
    if (statusCode == 233) {
      return defaultArticleListResult;
    }
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("文章列表");
      return defaultArticleListResult;
    } else {
      throw err;
    }
  }
};

export const getArticlesByTimeLine = async () => {
  // 如果是Docker构建环境，直接返回默认值
  if (process.env.DOCKER_BUILD === "true") {
    logDefaultValueUsage("时间线");
    return defaultCategoryOrTimelineResult;
  }

  try {
    const url = `${config.baseUrl}api/public/timeline`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("时间线");
      return defaultCategoryOrTimelineResult;
    } else {
      throw err;
    }
  }
};

export const getArticlesByCategory = async () => {
  // 如果是Docker构建环境，直接返回默认值
  if (process.env.DOCKER_BUILD === "true") {
    logDefaultValueUsage("分类");
    return defaultCategoryOrTimelineResult;
  }
  
  try {
    const url = `${config.baseUrl}api/public/category`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("分类");
      return defaultCategoryOrTimelineResult;
    } else {
      throw err;
    }
  }
};

export const getArticlesByTag = async (tagName: string) => {
  // 如果是Docker构建环境，直接返回默认值
  if (process.env.DOCKER_BUILD === "true") {
    logDefaultValueUsage("标签");
    return defaultCategoryOrTimelineResult;
  }
  
  try {
    const url = `${config.baseUrl}api/public/tag`;
    const res = await fetch(url);
    const { data } = await res.json();
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("标签");
      return defaultCategoryOrTimelineResult;
    } else {
      throw err;
    }
  }
};

export const getArticleByIdOrPathname = async (id: string) => {
  // 如果是Docker构建环境，直接返回默认值
  if (process.env.DOCKER_BUILD === "true") {
    logDefaultValueUsage("文章详情");
    return defaultSingleArticleResult;
  }

  try {
    const url = `${config.baseUrl}api/public/article/${id}`;
    const res = await fetch(url);
    const { data } = await res.json();
    const { article, pre, next } = data;
    const r: any = { article };
    if (pre) {
      r.pre = { title: pre.title, id: pre.id, pathname: pre.pathname };
    }
    if (next) {
      r.next = { title: next.title, id: next.id, pathname: next.pathname };
    }
    return r;
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("文章详情");
      return defaultSingleArticleResult;
    } else {
      // console.log(err);
      return defaultSingleArticleResult;
    }
  }
};

export const getArticleByIdOrPathnameWithPassword = async (
  id: number | string,
  password: string
) => {
  // 如果是Docker构建环境，直接返回默认值
  if (process.env.DOCKER_BUILD === "true") {
    logDefaultValueUsage("加密文章");
    return defaultSingleArticleResult;
  }
  
  try {
    const url = `/api/public/article/${id}`;
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });
    const { data } = await res.json();
    return data;
  } catch (err) {
    if (process.env.isBuild == "t") {
      logDefaultValueUsage("加密文章");
      return defaultSingleArticleResult;
    } else {
      throw err;
    }
  }
};
