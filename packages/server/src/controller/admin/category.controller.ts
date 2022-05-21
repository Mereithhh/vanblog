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
import { CreateCategoryDto } from 'src/dto/category.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/category/')
export class CategoryController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get('/all')
  async getAllTags() {
    return await this.categoryProvider.getAllCategories();
  }

  @Get('/:name')
  async getArticlesByName(@Param('name') name: string) {
    return await this.categoryProvider.getArticlesByCategory(name);
  }

  @Post()
  async createCategory(@Body() body: CreateCategoryDto) {
    return await this.categoryProvider.addOne(body.name);
  }

  @Delete('/:name')
  async deleteCategory(@Param('name') name: string) {
    return await this.categoryProvider.deleteOne(name);
  }

  @Put('/:name')
  async updateCategoryByName(
    @Param('name') name: string,
    @Query('value') newValue: string,
  ) {
    return await this.categoryProvider.updateCategoryByName(name, newValue);
  }
}
