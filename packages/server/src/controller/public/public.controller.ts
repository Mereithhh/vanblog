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
    const data = await this.articleProvider.getById(id);
    return {
      statusCode: 200,
      data: data ? this.articleProvider.toPublic([data])[0] : null,
    };
  }

  @Get('/article/search')
  async searchArticle(@Query('value') search: string) {
    const data = await this.articleProvider.searchByString(search);
    return {
      statusCode: 200,
      data: this.articleProvider.toPublic(data),
    };
  }

  @Get('/tag/:name')
  async getArticlesByTagName(@Param('name') name: string) {
    const data = await this.tagProvider.getArticlesByTag(name);
    return {
      statusCode: 200,
      data: this.articleProvider.toPublic(data),
    };
  }

  @Get('/all')
  async getAllPublicData() {
    let articles = await this.articleProvider.getAll();
    articles = this.articleProvider.toPublic(articles) as any;
    const categories = await this.categoryProvider.getAllCategories();
    const tags = await this.tagProvider.getAllTags();
    const meta = await this.metaProvider.getAll();
    const data = {
      articles,
      categories,
      tags,
      meta,
    };
    return {
      statusCode: 200,
      data,
    };
  }
}
