import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MetaProvider } from 'src/provider/meta/meta.provider';

@ApiTags('about')
@Controller('/api/admin/meta/about')
export class AboutMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

  @Get()
  async getAbout() {
    const data = await this.metaProvider.getAbout();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async updateAbout(@Body() updateAboutDto: { content: string }) {
    const data = await this.metaProvider.updateAbout(updateAboutDto.content);
    return {
      statusCode: 200,
      data,
    };
  }
}
