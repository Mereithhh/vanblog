import { GetArticleOption, ArticleResponse, ArticleDetail } from '../types/api';
import { Article } from '../types/article';
import { apiService } from './service';

// Re-export types for backward compatibility
export type { GetArticleOption, SortOrder } from '../types/api';

// Articles
export const getArticlesByOption = async (option: GetArticleOption): Promise<ArticleResponse> => {
  return apiService.getArticles(option);
};

export const getArticlesByTimeLine = async (): Promise<Record<string, Article[]>> => {
  return apiService.getTimeline();
};

export const getArticlesByCategory = async (): Promise<Record<string, Article[]>> => {
  return apiService.getCategories();
};

export const getArticlesByTag = async (): Promise<Record<string, Article[]>> => {
  return apiService.getTags();
};

export const getArticleByIdOrPathname = async (
  idOrPathname: string | number
): Promise<ArticleDetail> => {
  return apiService.getArticleByIdOrPathname(idOrPathname);
};

export const getEncryptedArticleByIdOrPathname = async (
  idOrPathname: string | number,
  password: string
): Promise<ArticleDetail> => {
  return apiService.getEncryptedArticle(idOrPathname, password);
};

// This function is for getting articles by a specific tag
export const getArticlesByTagName = async (tag: string): Promise<Article[]> => {
  return apiService.getArticlesByTag(tag);
};

// This function is for getting articles by a specific category
export const getArticlesByCategoryName = async (category: string): Promise<Article[]> => {
  // Since there's no direct endpoint for getting articles by category name,
  // we'll get all categories and filter the one we need
  const allCategories = await apiService.getCategories();
  return allCategories[category] || [];
};

// Search
export const getArticlesBySearch = async (value: string): Promise<ArticleResponse> => {
  return apiService.searchArticles(value);
};