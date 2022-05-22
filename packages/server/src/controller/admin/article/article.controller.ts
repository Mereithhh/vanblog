import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { AritcleProvider } from 'src/provider/article/article.provider';
@Controller('/api/admin/article')
export class ArticleController {
  constructor(private readonly articleProvider: AritcleProvider) {}

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
