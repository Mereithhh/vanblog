import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { AritcleProvider } from 'src/provider/article/article.provider';
@ApiTags('article')
@Controller('/api/admin/article')
export class ArticleController {
  constructor(private readonly articleProvider: AritcleProvider) {}

  @Get('/')
  async getAll() {
    const data = await this.articleProvider.getAll();
    return {
      statusCode: 200,
      data,
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: number) {
    const data = await this.articleProvider.findById(id);
    return {
      statusCode: 200,
      data,
    };
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateArticleDto) {
    const data = await this.articleProvider.updateById(id, updateDto);
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() createDto: CreateArticleDto) {
    const data = await this.articleProvider.create(createDto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    const data = await this.articleProvider.deleteById(id);
    return {
      statusCode: 200,
      data,
    };
  }
}
