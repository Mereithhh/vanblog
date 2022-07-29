import { Injectable } from '@nestjs/common';
import { ArticleProvider } from '../article/article.provider';
import { ViewerProvider } from '../viewer/viewer.provider';
import { MetaProvider } from '../meta/meta.provider';
@Injectable()
export class OverviewProvider {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly articleProvider: ArticleProvider,
    private readonly viewProvider: ViewerProvider,
  ) {}

  async getWelcomePageData() {
    // 总字数和总文章数
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
}
