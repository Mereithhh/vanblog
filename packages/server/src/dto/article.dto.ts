import { SortOrder } from './sort';

export class CreateArticleDto {
  title: string;
  content?: string;
  tags?: string[];
  top?: number;
  category: string;
  hidden?: boolean;
  private?: boolean;
  password?: string;
}
export class UpdateArticleDto {
  title?: string;
  content?: string;
  tags?: string[];
  category?: string;
  hidden?: boolean;
  top?: number;
  private?: boolean;
  password?: string;
  deleted?: boolean;
}
export class SearchArticleOption {
  page: number;
  pageSize: number;
  regMatch: boolean;
  category?: string;
  tags?: string;
  title?: string;
  sortCreatedAt?: SortOrder;
  sortTop?: SortOrder;
  startTime?: string;
  endTime?: string;
  sortViewer?: string;
  toListView?: boolean;
  withWordCount?: boolean;
}
