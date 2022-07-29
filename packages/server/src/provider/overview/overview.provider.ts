import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meta, MetaDocument } from 'src/scheme/meta.schema';
import { SiteInfo, UpdateSiteInfoDto } from 'src/dto/site.dto';
import { RewardItem } from 'src/dto/reward.dto';
import { SocialItem, SocialType } from 'src/dto/social.dto';
import { LinkItem } from 'src/dto/link.dto';
import { UserProvider } from '../user/user.provider';
import { MenuItem } from 'src/dto/menu.dto';
import { VisitProvider } from '../visit/visit.provider';
import { AritcleProvider } from '../article/article.provider';
import { ViewerProvider } from '../viewer/viewer.provider';
import { MetaProvider } from '../meta/meta.provider';
@Injectable()
export class OverviewProvider {
  constructor(
    private readonly userProvider: UserProvider,
    private readonly metaProvider: MetaProvider,
    private readonly articleProvider: AritcleProvider,
    private readonly viewProvider: ViewerProvider,
  ) {}

  async getWelcomePageData() {
    // 总字数和总文章数
    const total = {
      wordCount: await this.articleProvider.getTotalWordCount(),
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
