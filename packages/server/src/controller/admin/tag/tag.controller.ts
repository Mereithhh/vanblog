import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TagProvider } from 'src/provider/tag/tag.provider';
@ApiTags('tag')
@Controller('/api/admin/tag/')
export class TagController {
  constructor(private readonly tagProvider: TagProvider) {}

  @Get('/all')
  async getAllTags() {
    return await this.tagProvider.getAllTags();
  }

  @Get('/:name')
  async getArticlesByTagName(@Param('name') name: string) {
    return await this.tagProvider.getArticlesByTag(name);
  }
}
