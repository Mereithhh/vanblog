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
import { SocialDto, SocialType } from 'src/dto/social.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/meta/social')
export class SocialMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

  @Get()
  async get() {
    return await this.metaProvider.getSocials();
  }

  @Put()
  async update(@Body() updateDto: SocialDto) {
    return await this.metaProvider.addOrUpdateSocial(updateDto);
  }

  @Post()
  async create(@Body() updateDto: SocialDto) {
    return await this.metaProvider.addOrUpdateSocial(updateDto);
  }

  @Delete('/:type')
  async delete(@Param('type') type: SocialType) {
    return await this.metaProvider.deleteSocial(type);
  }
}
