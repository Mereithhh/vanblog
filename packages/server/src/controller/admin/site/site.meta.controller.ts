import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteInfo } from 'src/dto/site.dto';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@ApiTags('site')
@Controller('/api/admin/meta/site')
export class SiteMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

  @Get()
  async get() {
    const data = await this.metaProvider.getSiteInfo();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() updateDto: Partial<SiteInfo>) {
    const data = await this.metaProvider.updateSiteInfo(updateDto);
    return {
      statusCode: 200,
      data,
    };
  }
}
