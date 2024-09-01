import { Controller, Delete, Get, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { ApiToken } from 'src/provider/swagger/token';
import { TagProvider } from 'src/provider/tag/tag.provider';
@ApiTags('tag')
@ApiToken
@UseGuards(...AdminGuard)
@Controller('/api/admin/tag/')
export class TagController {
  constructor(
    private readonly tagProvider: TagProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get('/all')
  async getAllTags() {
    const data = await this.tagProvider.getAllTags(true);
    return {
      statusCode: 200,
      data,
    };
  }

  @Get('/:name')
  async getArticlesByTagName(@Param('name') name: string) {
    const data = await this.tagProvider.getArticlesByTag(name, true);
    return {
      statusCode: 200,
      data,
    };
  }
  @Put('/:name')
  async updateTagByName(@Param('name') name: string, @Query('value') newName: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.tagProvider.updateTagByName(name, newName);
    this.isrProvider.activeAll('批量更新标签名触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
  @Delete('/:name')
  async deleteTagByName(@Param('name') name: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.tagProvider.deleteOne(name);
    this.isrProvider.activeAll('批量删除标签触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
