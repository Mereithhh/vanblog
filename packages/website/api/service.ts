import { apiClient } from './client';
import {
  GetArticleOption,
  ArticleResponse,
  ArticleDetail,
  PublicMetaProp,
  CustomPageList,
  CustomPage,
} from '../types/api';
import { Article } from '../types/article';

export class ApiService {
  private static instance: ApiService;

  private constructor() {}

  static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  // Articles
  async getArticles(options: GetArticleOption): Promise<ArticleResponse> {
    return apiClient.get('/api/articles', options, 'getArticles');
  }

  async getArticlesByTimeline(): Promise<Record<string, Article[]>> {
    const response = await apiClient.get<ArticleResponse>('/api/articles/timeline', {}, 'getArticlesByTimeline');
    
    // Transform the data into the expected format
    const articles = response.articles || [];
    const groupedArticles: Record<string, Article[]> = {};
    
    articles.forEach(article => {
      const year = new Date(article.createdAt).getFullYear().toString();
      if (!groupedArticles[year]) {
        groupedArticles[year] = [];
      }
      groupedArticles[year].push(article);
    });
    
    return groupedArticles;
  }

  async getArticlesByCategory(category: string): Promise<ArticleResponse> {
    return apiClient.get('/api/articles/category', { category }, 'getArticlesByCategory');
  }

  async getArticlesByTag(tag: string): Promise<ArticleResponse> {
    return apiClient.get('/api/articles/tag', { tag }, 'getArticlesByTag');
  }

  async getArticle(idOrPathname: string | number): Promise<ArticleDetail> {
    return apiClient.get(`/api/articles/${idOrPathname}`, {}, 'getArticle');
  }

  async getEncryptedArticle(idOrPathname: string | number, password: string): Promise<ArticleDetail> {
    return apiClient.post(`/api/articles/${idOrPathname}/decrypt`, { password }, 'getEncryptedArticle');
  }

  // Meta
  async getPublicMeta(): Promise<PublicMetaProp> {
    return apiClient.get('/api/meta/public', {}, 'getPublicMeta');
  }

  // Custom Pages
  async getCustomPages(): Promise<CustomPageList[]> {
    return apiClient.get('/api/pages', {}, 'getCustomPages');
  }

  async getCustomPage(path: string): Promise<CustomPage> {
    return apiClient.get(`/api/pages/${path}`, {}, 'getCustomPage');
  }

  // Page Views
  async incrementPageView(pathname: string): Promise<void> {
    return apiClient.post('/api/pageview', { pathname }, 'incrementPageView');
  }

  async getArticleViews(pathname: string): Promise<number> {
    return apiClient.get('/api/pageview', { pathname }, 'getArticleViews');
  }

  // Search
  async searchArticles(keyword: string): Promise<ArticleResponse> {
    return apiClient.get('/api/search', { keyword }, 'searchArticles');
  }

  // Cache Management
  clearCache(): void {
    apiClient.clearCache();
  }

  invalidateArticlesCache(): void {
    apiClient.invalidateCache('/api/articles');
    apiClient.invalidateCache('/api/articles/timeline');
    apiClient.invalidateCache('/api/articles/category');
    apiClient.invalidateCache('/api/articles/tag');
  }

  invalidateMetaCache(): void {
    apiClient.invalidateCache('/api/meta/public');
  }
}

// Export a singleton instance
export const apiService = ApiService.getInstance(); 