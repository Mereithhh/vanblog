import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { LinkDto } from 'src/dto/link.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/article')
export class ArticleMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get('/')
  async getAll() {
    return await this.articleProvider.getAll();
  }

  @Get('/:id')
  async getOne(@Param('id') id: number) {
    return await this.articleProvider.findById(id);
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateArticleDto) {
    return await this.articleProvider.updateById(id, updateDto);
  }

  @Post()
  async create(@Body() createDto: CreateArticleDto) {
    return await this.articleProvider.create(createDto);
  }
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return await this.articleProvider.deleteById(id);
  }
}
