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
import { LinkDto } from 'src/dto/link.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/meta/link')
export class LinkMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get()
  async get() {
    return await this.metaProvider.getLinks();
  }

  @Put()
  async update(@Body() updateLinkDto: LinkDto) {
    return await this.metaProvider.addOrUpdateLink(updateLinkDto);
  }

  @Post()
  async create(@Body() updateLinkDto: LinkDto) {
    return await this.metaProvider.addOrUpdateLink(updateLinkDto);
  }
  @Delete('/:name')
  async delete(@Param('name') name: string) {
    return await this.metaProvider.deleteLink(name);
  }
}
