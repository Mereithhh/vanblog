import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { ViewerProvider } from '../viewer/viewer.provider';
import { MetaProvider } from '../meta/meta.provider';
import { ArticleTabData, ViewerTabData } from 'src/types/analysis';
import { VisitProvider } from '../visit/visit.provider';
import { TagProvider } from '../tag/tag.provider';
import { CategoryProvider } from '../category/category.provider';
export type WelcomeTab = 'overview' | 'viewer' | 'article';
@Injectable()
export class AnalysisProvider {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly articleProvider: ArticleProvider,
    private readonly viewProvider: ViewerProvider,
    private readonly visitProvider: VisitProvider,
    private readonly tagProvider: TagProvider,
    private readonly categoryProvider: CategoryProvider,
  ) {}

  async getOverViewTabData(num: number) {
    const total = {
      wordCount: await this.metaProvider.getTotalWords(),
      articleNum: await this.articleProvider.getTotalNum(true),
    };
    const viewer = await this.viewProvider.getViewerGrid(num);
    const siteInfo = await this.metaProvider.getSiteInfo();
    return {
      total,
      viewer,
      link: {
        baseUrl: siteInfo.baseUrl,
        enableComment: siteInfo.enableComment || 'true',
      },
    };
  }

  async getViewerTabData(num: number): Promise<ViewerTabData> {
    const siteInfo = await this.metaProvider.getSiteInfo();
    const enableGA = Boolean(siteInfo.gaAnalysisId) && siteInfo.gaAnalysisId != '';
    const enableBaidu = Boolean(siteInfo.baiduAnalysisId) && siteInfo.baiduAnalysisId != '';
    const topViewer = await this.articleProvider.getTopViewer('list', num);
    const topVisited = await this.articleProvider.getTopVisited('list', num);
    const recentVisitArticles = await this.articleProvider.getRecentVisitedArticles(num, 'list');
    let siteLastVisitedTime = null;
    let siteLastVisitedPathname = '';
    const lastVisitItem = await this.visitProvider.getLastVisitItem();
    if (lastVisitItem) {
      siteLastVisitedTime = lastVisitItem.lastVisitedTime;
      siteLastVisitedPathname = lastVisitItem.pathname;
    }
    const { viewer: totalViewer, visited: totalVisited } = await this.metaProvider.getViewer();
    let maxArticleVisited = 0;
    let maxArticleViewer = 0;
    if (topViewer && topViewer.length > 0) {
      maxArticleViewer = topViewer[0].viewer;
    }
    if (topVisited && topVisited.length > 0) {
      maxArticleVisited = topVisited[0].visited;
    }
    return {
      enableGA,
      enableBaidu,
      topViewer,
      topVisited,
      recentVisitArticles,
      siteLastVisitedTime,
      siteLastVisitedPathname,
      totalViewer,
      totalVisited,
      maxArticleVisited,
      maxArticleViewer,
    };
  }

  async getArticleTabData(num: number): Promise<ArticleTabData> {
    const articleNum = await this.articleProvider.getTotalNum(true);
    const wordNum = await this.metaProvider.getTotalWords();
    const tagNum = (await this.tagProvider.getAllTags(true))?.length || 0;
    const categoryNum = (await this.categoryProvider.getAllCategories())?.length || 0;
    const categoryPieData = await this.categoryProvider.getPieData();
    const columnData = await this.tagProvider.getColumnData(num, true);
    return {
      articleNum,
      wordNum,
      tagNum,
      categoryNum,
      categoryPieData,
      columnData,
    };
  }

  async getWelcomePageData(
    tab: WelcomeTab,
    overviewDataNum: number,
    viewerDataNum: number,
    articleTabDataNum: number,
  ) {
    // 总字数和总文章数
    if (tab == 'overview') {
      return await this.getOverViewTabData(overviewDataNum);
    }
    if (tab == 'viewer') {
      return await this.getViewerTabData(viewerDataNum);
    }
    if (tab == 'article') {
      return await this.getArticleTabData(articleTabDataNum);
    }
  }
}
