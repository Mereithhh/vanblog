import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { version } from '../../../utils/loadConfig';
import { AritcleProvider } from 'src/provider/article/article.provider';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CategoryProvider } from 'src/provider/category/category.provider';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { TagProvider } from 'src/provider/tag/tag.provider';
import { UserProvider } from 'src/provider/user/user.provider';
import { ViewerProvider } from 'src/provider/viewer/viewer.provider';

@ApiTags('meta')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta')
export class MetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
    private readonly draftProvider: DraftProvider,
    private readonly userProvider: UserProvider,
    private readonly viewProvider: ViewerProvider,
  ) {}

  @Get()
  async getAllMeta() {
    const categories = await this.categoryProvider.getAllCategories();
    const tags = await this.tagProvider.getAllTags();
    const meta = await this.metaProvider.getAll();
    const user = await this.userProvider.getUser();
    const viewer = await this.viewProvider.getViewerGrid(5);
    const total = {
      wordCount: await this.articleProvider.getTotalWordCount(),
      articleNum: await this.articleProvider.getTotalNum(),
    };
    const data = {
      tags,
      meta,
      categories,
      user,
      viewer,
      total,
      version: version,
    };
    return {
      statusCode: 200,
      data,
    };
  }
}
