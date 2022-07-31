import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { ViewerProvider } from '../viewer/viewer.provider';
import { MetaProvider } from '../meta/meta.provider';
import { ViewerTabData } from 'src/dto/analysis';
import { VisitProvider } from '../visit/visit.provider';
export type WelcomeTab = 'overview' | 'viewer';
@Injectable()
export class AnalysisProvider {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly articleProvider: ArticleProvider,
    private readonly viewProvider: ViewerProvider,
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

  async getViewerData(): Promise<ViewerTabData> {
    const siteInfo = await this.metaProvider.getSiteInfo();
    const enableGA =
      Boolean(siteInfo.gaAnalysisId) && siteInfo.gaAnalysisId != '';
    const enableBaidu =
      Boolean(siteInfo.baiduAnalysisId) && siteInfo.baiduAnalysisId != '';
    const top5Viewer = await this.articleProvider.getTop5Viewer('list');
    const top5Visited = await this.articleProvider.getTop5Visited('list');
    const recentVisitArticles =
      await this.articleProvider.getRecentVisitedArticles(5);

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
