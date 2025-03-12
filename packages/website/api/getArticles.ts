import { GetArticleOption, ArticleResponse, ArticleDetail } from '../types/api';
import { Article } from '../types/article';
import { apiClient } from './client';

// Re-export types for backward compatibility
export type { GetArticleOption, SortOrder } from '../types/api';

// Articles
export const getArticlesByOption = async (option: GetArticleOption): Promise<ArticleResponse> => {
  const response = await apiClient.get<{ statusCode: number; data: ArticleResponse }>('/api/public/article', option, 'getArticlesByOption');
  return response.data;
};

export const getArticlesByTimeLine = async (): Promise<Record<string, Article[]>> => {
  const response = await apiClient.get<{ statusCode: number; data: Record<string, Article[]> }>('/api/public/timeline', {}, 'getArticlesByTimeline');
  
  // Extract the data field from the response
  return response.data;
};

export const getArticlesByCategory = async (): Promise<Record<string, Article[]>> => {
  const response = await apiClient.get<{ statusCode: number; data: Record<string, Article[]> }>('/api/public/category', {}, 'getArticlesByCategory');
  
  // Extract the data field from the response
  return response.data;
};

export const getArticlesByTag = async (): Promise<Record<string, Article[]>> => {
  const response = await apiClient.get<{ statusCode: number; data: Record<string, Article[]> }>('/api/public/tag', {}, 'getArticlesByTag');
  
  // Extract the data field from the response
  return response.data;
};

export const getArticleByIdOrPathname = async (
  idOrPathname: string | number
): Promise<ArticleDetail> => {
  const response = await apiClient.get<{ statusCode: number; data: ArticleDetail }>(`/api/public/article/${idOrPathname}`, {}, 'getArticleByIdOrPathname');
  return response.data;
};

export const getEncryptedArticleByIdOrPathname = async (
  idOrPathname: string | number,
  password: string
): Promise<ArticleDetail> => {
  const response = await apiClient.post<{ statusCode: number; data: ArticleDetail }>(`/api/public/article/${idOrPathname}/decrypt`, { password }, 'getEncryptedArticleByIdOrPathname');
  return response.data;
};

// This function is for getting articles by a specific tag
export const getArticlesByTagName = async (tag: string): Promise<Article[]> => {
  const response = await apiClient.get<{ statusCode: number; data: Article[] }>(`/api/public/tag/${tag}`, {}, 'getArticlesByTagName');
  return response.data;
};

// This function is for getting articles by a specific category
export const getArticlesByCategoryName = async (category: string): Promise<Article[]> => {
  // Since there's no direct endpoint for getting articles by category name,
  // we'll get all categories and filter the one we need
  const allCategories = await getArticlesByCategory();
  return allCategories[category] || [];
};
