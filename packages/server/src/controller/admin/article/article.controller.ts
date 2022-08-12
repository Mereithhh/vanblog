import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { SortOrder } from 'src/dto/sort';
import { ArticleProvider } from 'src/provider/article/article.provider';
import { AdminGuard } from 'src/provider/auth/auth.guard';
@ApiTags('article')
@UseGuards(AdminGuard)
@Controller('/api/admin/article')
export class ArticleController {
  constructor(private readonly articleProvider: ArticleProvider) {}

  @Get('/')
  async getByOption(
    @Query('page') page: number,
    @Query('pageSize') pageSize = 5,
    @Query('toListView') toListView = false,
    @Query('regMatch') regMatch = true,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('title') title?: string,
    @Query('sortCreatedAt') sortCreatedAt?: SortOrder,
    @Query('sortTop') sortTop?: SortOrder,
    @Query('sortViewer') sortViewer?: SortOrder,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const option = {
      page,
      pageSize,
      category,
      tags,
      title,
      sortCreatedAt,
      sortTop,
      startTime,
      endTime,
      toListView,
      regMatch,
      sortViewer,
    };
    const data = await this.articleProvider.getByOption(option, false);
    return {
      statusCode: 200,
      data,
    };
  }

  @Get('/:id')
  async getOneById(@Param('id') id: number) {
    const data = await this.articleProvider.getById(id, 'admin');
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
  @Post('searchByLink')
  async searchArtcilesByLink(@Body() searchDto: { link: string }) {
    const data = await this.articleProvider.searchArticlesByLink(
      searchDto?.link || '',
    );
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
