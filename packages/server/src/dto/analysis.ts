import { Article } from 'src/scheme/article.schema';

export interface ViewerTabData {
  enableGA: boolean;
  enableBaidu: boolean;
  topViewer: Article[];
  topVisited: Article[];
  recentVisitArticles: Article[];
  siteLastVisitedTime: Date;
  siteLastVisitedPathname: string;
  totalViewer: number;
  totalVisited: number;
  maxArticleViewer: number;
  maxArticleVisited: number;
}
export interface ArticleTabData {
  articleNum: number;
  categoryNum: number;
  tagNum: number;
  wordNum: number;
  categoryPieData: { type: string; value: number }[];
  columnData: { type: string; value: number }[];
}
