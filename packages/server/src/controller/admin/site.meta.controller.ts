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
import { SiteInfo } from 'src/dto/site.dto';
import { SocialDto, SocialType } from 'src/dto/social.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/meta/site')
export class SiteMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get()
  async get() {
    return await this.metaProvider.getSiteInfo();
  }

  @Put()
  async update(@Body() updateDto: Partial<SiteInfo>) {
    return await this.metaProvider.updateSiteInfo(updateDto);
  }
}
