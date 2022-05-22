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
import { CategoryProvider } from 'src/provider/category/category.provider';

@Controller('/api/admin/category/')
export class CategoryController {
  constructor(private readonly categoryProvider: CategoryProvider) {}

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
