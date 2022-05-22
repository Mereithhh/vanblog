import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaProvider } from 'src/provider/meta/meta.provider';

@ApiTags('about')
@Controller('/api/admin/meta/about')
export class AboutMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

  @Get()
  async getAbout() {
    return await this.metaProvider.getAbout();
  }

  @Put()
  async updateAbout(@Body() updateAboutDto: { content: string }) {
    return await this.metaProvider.updateAbout(updateAboutDto.content);
  }
}
