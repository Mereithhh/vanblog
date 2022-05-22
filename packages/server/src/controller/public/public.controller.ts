import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AritcleProvider } from 'src/provider/article/article.provider';
import { CategoryProvider } from 'src/provider/category/category.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { TagProvider } from 'src/provider/tag/tag.provider';

@ApiTags('public')
@Controller('/api/public/')
export class PublicController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get('/article/:id')
  async getArticleById(@Param('id') id: number) {
    return await this.articleProvider.getById(id);
  }

  @Get('/article/search')
  async searchArticle(@Query('value') search: string) {
    return await this.articleProvider.searchByString(search);
  }

  @Get('/tag/:name')
  async getArticlesByTagName(@Param('name') name: string) {
    return await this.tagProvider.getArticlesByTag(name);
  }

  @Get('/all')
  async getAllPublicData() {
    const articles = await this.articleProvider.getAll();
    const categories = await this.categoryProvider.getAllCategories();
    const tags = await this.tagProvider.getAllTags();
    const meta = await this.metaProvider.getAll();
    return {
      articles,
      categories,
      tags,
      meta,
    };
  }
}
