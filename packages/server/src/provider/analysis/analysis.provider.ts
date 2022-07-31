import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { ViewerProvider } from '../viewer/viewer.provider';
import { MetaProvider } from '../meta/meta.provider';
import { ViewerTabData } from 'src/dto/analysis';
export type WelcomeTab = 'overview' | 'viewer';
@Injectable()
export class AnalysisProvider {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly articleProvider: ArticleProvider,
    private readonly viewProvider: ViewerProvider,
  ) {}

  async getOverViewData(num: number) {
    const total = {
      wordCount: await this.metaProvider.getTotalWords(),
      articleNum: await this.articleProvider.getTotalNum(),
    };
    const viewer = await this.viewProvider.getViewerGrid(num);
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

  async getViewerData(num: number): Promise<ViewerTabData> {
    const siteInfo = await this.metaProvider.getSiteInfo();
    const enableGA =
      Boolean(siteInfo.gaAnalysisId) && siteInfo.gaAnalysisId != '';
    const enableBaidu =
      Boolean(siteInfo.baiduAnalysisId) && siteInfo.baiduAnalysisId != '';
    const topViewer = await this.articleProvider.getTopViewer('list', num);
    const topVisited = await this.articleProvider.getTopVisited('list', num);
    const recentVisitArticles =
      await this.articleProvider.getRecentVisitedArticles(num, 'list');
    const siteLastVisitedTime =
      await this.metaProvider.getSiteLastVisitedTime();
    return {
      enableGA,
      enableBaidu,
      topViewer,
      topVisited,
      recentVisitArticles,
      siteLastVisitedTime,
    };
  }

  async getWelcomePageData(
    tab: WelcomeTab,
    overviewDataNum: number,
    viewerDataNum: number,
  ) {
    // 总字数和总文章数
    if (tab == 'overview') {
      return await this.getOverViewData(overviewDataNum);
    }
    if (tab == 'viewer') {
      return await this.getViewerData(viewerDataNum);
    }
  }
}
