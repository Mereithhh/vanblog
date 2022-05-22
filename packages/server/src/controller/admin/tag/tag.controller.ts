import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagProvider } from 'src/provider/tag/tag.provider';
@ApiTags('tag')
@Controller('/api/admin/tag/')
export class TagController {
  constructor(private readonly tagProvider: TagProvider) {}

  @Get('/all')
  async getAllTags() {
    const data = await this.tagProvider.getAllTags();
    return {
      statusCode: 200,
      data,
    };
  }

  @Get('/:name')
  async getArticlesByTagName(@Param('name') name: string) {
    const data = await this.tagProvider.getArticlesByTag(name);
    return {
      statusCode: 200,
      data,
    };
  }
}
