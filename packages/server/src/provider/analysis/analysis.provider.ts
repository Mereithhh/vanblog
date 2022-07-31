import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { ViewerProvider } from '../viewer/viewer.provider';
import { MetaProvider } from '../meta/meta.provider';
import { ViewerTabData } from 'src/dto/analysis';
import { VisitProvider } from '../visit/visit.provider';
import { Article } from 'src/scheme/article.schema';
export type WelcomeTab = 'overview' | 'viewer';
@Injectable()
export class AnalysisProvider {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly articleProvider: ArticleProvider,
    private readonly viewProvider: ViewerProvider,
    private readonly visitProvider: VisitProvider,
  ) {}

  async getOverViewData() {
    const total = {
      wordCount: await this.metaProvider.getTotalWords(),
      articleNum: await this.articleProvider.getTotalNum(),
    };
    const viewer = await this.viewProvider.getViewerGrid(5);
    const siteInfo = await this.metaProvider.getSiteInfo();
    return {
      total,
      viewer,
      link: {
        baseUrl: siteInfo.baseUrl,
        walineServerUrl: siteInfo.walineServerUrl,
      },
    };
  }

  async getRecentArticles(num: number) {
    const { recentArticleIds } = await this.metaProvider.getSiteInfo();
    const recentVisitArticles: Article[] = [];
    if (recentArticleIds && recentArticleIds.length > 0) {
      let i = 0;
      for (const each of recentArticleIds) {
        if (i == num) {
          break;
        }
        recentVisitArticles.push(
          await this.articleProvider.getById(each, 'list'),
        );
        i = i + 1;
      }
    }
    return recentVisitArticles;
  }
  async getViewerData(): Promise<ViewerTabData> {
    const siteInfo = await this.metaProvider.getSiteInfo();
    const enableGA =
      Boolean(siteInfo.gaAnalysisId) && siteInfo.gaAnalysisId != '';
    const enableBaidu =
      Boolean(siteInfo.baiduAnalysisId) && siteInfo.baiduAnalysisId != '';
    const top5Viewer = await this.articleProvider.getTop5Viewer('list');
    const top5Visited = await this.articleProvider.getTop5Visited('list');
    const recentVisitArticles = await this.getRecentArticles(5);

    return {
      enableGA,
      enableBaidu,
      top5Viewer,
      top5Visited,
      recentVisitArticles,
    };
  }

  async getWelcomePageData(tab: WelcomeTab) {
    // 总字数和总文章数
    if (tab == 'overview') {
      return await this.getOverViewData();
    }
    if (tab == 'viewer') {
      return await this.getViewerData();
    }
  }
}
