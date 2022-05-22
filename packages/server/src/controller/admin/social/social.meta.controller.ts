import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialDto, SocialType } from 'src/dto/social.dto';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@ApiTags('social')
@Controller('/api/admin/meta/social')
export class SocialMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

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
