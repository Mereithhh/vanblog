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
import { CreateCategoryDto } from 'src/dto/category.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CategoryProvider } from 'src/provider/category/category.provider';

@ApiTags('category')
@UseGuards(AdminGuard)
@Controller('/api/admin/category/')
export class CategoryController {
  constructor(private readonly categoryProvider: CategoryProvider) {}

  @Get('/all')
  async getAllTags() {
    const data = await this.categoryProvider.getAllCategories();
    return {
      statusCode: 200,
      data,
    };
  }

  @Get('/:name')
  async getArticlesByName(@Param('name') name: string) {
    const data = await this.categoryProvider.getArticlesByCategory(name, true);
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async createCategory(@Body() body: CreateCategoryDto) {
    const data = await this.categoryProvider.addOne(body.name);
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete('/:name')
  async deleteCategory(@Param('name') name: string) {
    const data = await this.categoryProvider.deleteOne(name);
    return {
      statusCode: 200,
      data,
    };
  }

  @Put('/:name')
  async updateCategoryByName(
    @Param('name') name: string,
    @Query('value') newValue: string,
  ) {
    const data = await this.categoryProvider.updateCategoryByName(
      name,
      newValue,
    );
    return {
      statusCode: 200,
      data,
    };
  }
}
