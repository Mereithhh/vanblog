import { Body, Controller, Get, Put } from '@nestjs/common';
import { SiteInfo } from 'src/dto/site.dto';
import { MetaProvider } from 'src/provider/meta/meta.provider';

@Controller('/api/admin/meta/site')
export class SiteMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

  @Get()
  async get() {
    return await this.metaProvider.getSiteInfo();
  }

  @Put()
  async update(@Body() updateDto: Partial<SiteInfo>) {
    return await this.metaProvider.updateSiteInfo(updateDto);
  }
}
