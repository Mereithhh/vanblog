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
import { CreateCategoryDto } from 'src/types/category.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CategoryProvider } from 'src/provider/category/category.provider';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { config } from 'src/config';

@ApiTags('category')
@UseGuards(...AdminGuard)
@Controller('/api/admin/category/')
export class CategoryController {
  constructor(
    private readonly categoryProvider: CategoryProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

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
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.categoryProvider.addOne(body.name);
    this.isrProvider.activeAll('创建分类触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete('/:name')
  async deleteCategory(@Param('name') name: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.categoryProvider.deleteOne(name);
    this.isrProvider.activeAll('删除分类触发增量渲染！');
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
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.categoryProvider.updateCategoryByName(
      name,
      newValue,
    );
    this.isrProvider.activeAll('迁移分类触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
