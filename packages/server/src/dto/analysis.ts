import { Article } from 'src/scheme/article.schema';

export interface ViewerTabData {
  enableGA: boolean;
  enableBaidu: boolean;
  top5Viewer: Article[];
  top5Visited: Article[];
  recentVisitArticles: Article[];
}
