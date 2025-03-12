/**
 * Common types for the API layer
 */

export interface PageViewData {
  viewer: number;
  visited: number;
}

export interface SearchParams {
  value: string;
}

export interface GetArticlesOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  category?: string;
  tag?: string;
  keyword?: string;
}

export interface ViewerUpdateOptions {
  isNew: boolean;
  isNewByPath: boolean;
}

export interface ApiResponse<T> {
  statusCode: number;
  data: T;
} 