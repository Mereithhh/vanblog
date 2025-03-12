import { apiClient } from './client';
import {
  ArticleResponse,
  ArticleDetail,
  PublicMetaProp,
  CustomPageList,
  CustomPage,
} from '../types/api';
import { Article } from '../types/article';
import { PageViewData } from './types';

/**
 * Comprehensive API service for VanBlog public API
 * Based on the following endpoints:
 * - GET /api/public/article
 * - GET /api/public/article/{id}
 * - POST /api/public/article/{id}
 * - GET /api/public/article/viewer/{id}
 * - GET /api/public/search
 * - GET /api/public/timeline
 * - GET /api/public/category
 * - GET /api/public/tag
 * - GET /api/public/tag/{name}
 * - GET /api/public/meta
 * - GET /api/public/viewer
 * - POST /api/public/viewer
 * - GET /api/public/customPage/all
 * - GET /api/public/customPage
 */
export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Cache Management
  clearCache(): void {
    apiClient.clearCache();
  }

  invalidateCache(endpoint: string, params?: Record<string, any>): void {
    apiClient.invalidateCache(endpoint, params);
  }

  // Articles
  async getArticles(options: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
    category?: string;
    tag?: string;
    keyword?: string;
  } = {}): Promise<ArticleResponse> {
    const response = await apiClient.get<{ statusCode: number; data: ArticleResponse }>(
      '/api/public/article',
      options,
      'getArticles'
    );
    return response.data;
  }

  async getArticleByIdOrPathname(
    idOrPathname: string | number
  ): Promise<ArticleDetail> {
    const response = await apiClient.get<{ statusCode: number; data: ArticleDetail }>(
      `/api/public/article/${idOrPathname}`,
      {},
      'getArticleByIdOrPathname'
    );
    return response.data;
  }

  async getEncryptedArticle(
    idOrPathname: string | number,
    password: string
  ): Promise<ArticleDetail> {
    const response = await apiClient.post<{ statusCode: number; data: ArticleDetail }>(
      `/api/public/article/${idOrPathname}`,
      { password },
      'getEncryptedArticle'
    );
    return response.data;
  }

  async getArticleViewer(id: number | string): Promise<PageViewData> {
    const response = await apiClient.get<{ statusCode: number; data: PageViewData }>(
      `/api/public/article/viewer/${id}`,
      undefined,
      'getArticleViewer'
    );
    return response.data;
  }

  // Timeline, Categories and Tags
  async getTimeline(): Promise<Record<string, Article[]>> {
    const response = await apiClient.get<{ statusCode: number; data: Record<string, Article[]> }>(
      '/api/public/timeline',
      {},
      'getTimeline'
    );
    return response.data;
  }

  async getCategories(): Promise<Record<string, Article[]>> {
    const response = await apiClient.get<{ statusCode: number; data: Record<string, Article[]> }>(
      '/api/public/category',
      {},
      'getCategories'
    );
    return response.data;
  }

  async getTags(): Promise<Record<string, Article[]>> {
    const response = await apiClient.get<{ statusCode: number; data: Record<string, Article[]> }>(
      '/api/public/tag',
      {},
      'getTags'
    );
    return response.data;
  }

  async getArticlesByTag(tag: string): Promise<Article[]> {
    const response = await apiClient.get<{ statusCode: number; data: Article[] }>(
      `/api/public/tag/${tag}`,
      {},
      'getArticlesByTag'
    );
    return response.data;
  }

  // Search
  async searchArticles(keyword: string): Promise<ArticleResponse> {
    const response = await apiClient.get<{ statusCode: number; data: ArticleResponse }>(
      '/api/public/search',
      { value: keyword },
      'searchArticles'
    );
    return response.data;
  }

  // Meta
  async getMeta(): Promise<PublicMetaProp> {
    const response = await apiClient.get<{ statusCode: number; data: PublicMetaProp }>(
      '/api/public/meta',
      {},
      'getMeta'
    );
    return response.data;
  }

  // Page Views
  async getPageView(): Promise<PageViewData> {
    const response = await apiClient.get<{ statusCode: number; data: PageViewData }>(
      '/api/public/viewer',
      undefined,
      'getPageView'
    );
    return response.data;
  }

  async updatePageView(options: { isNew: boolean; isNewByPath: boolean }): Promise<PageViewData> {
    const response = await apiClient.post<{ statusCode: number; data: PageViewData }>(
      '/api/public/viewer',
      options,
      'updatePageView'
    );
    return response.data;
  }

  // Custom Pages
  async getAllCustomPages(): Promise<CustomPageList[]> {
    const response = await apiClient.get<{ statusCode: number; data: CustomPageList[] }>(
      '/api/public/customPage/all',
      {},
      'getAllCustomPages'
    );
    return response.data;
  }

  async getCustomPage(path: string): Promise<CustomPage> {
    const response = await apiClient.get<{ statusCode: number; data: CustomPage }>(
      '/api/public/customPage',
      { path },
      'getCustomPage'
    );
    return response.data;
  }
}

// Export a singleton instance
export const apiService = ApiService.getInstance(); 