import { Controller, Get, Param, Put, Query } from '@nestjs/common';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/tag/')
export class TagController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get('/all')
  async getAllTags() {
    return await this.tagProvider.getAllTags();
  }

  @Get('/:name')
  async getArticlesByTagName(@Param('name') name: string) {
    return await this.tagProvider.getArticlesByTag(name);
  }
}
