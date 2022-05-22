import { Body, Controller, Get, Param, Put, Query } from '@nestjs/common';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/meta/about')
export class AboutMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get()
  async getAbout() {
    return await this.metaProvider.getAbout();
  }

  @Put()
  async updateAbout(@Body() updateAboutDto: { content: string }) {
    return await this.metaProvider.updateAbout(updateAboutDto.content);
  }
}
