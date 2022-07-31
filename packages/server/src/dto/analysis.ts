import { Article } from 'src/scheme/article.schema';

export interface ViewerTabData {
  enableGA: boolean;
  enableBaidu: boolean;
  topViewer: Article[];
  topVisited: Article[];
  recentVisitArticles: Article[];
  siteLastVisitedTime: Date;
  siteLastVisitedPathname: string;
}
