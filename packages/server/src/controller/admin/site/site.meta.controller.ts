import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSiteInfoDto } from 'src/types/site.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { WalineProvider } from 'src/provider/waline/waline.provider';
import { config } from 'src/config';
@ApiTags('site')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta/site')
export class SiteMetaController {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly isrProvider: ISRProvider,
    private readonly walineProvider: WalineProvider,
  ) {}

  @Get()
  async get() {
    const data = await this.metaProvider.getSiteInfo();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() updateDto: UpdateSiteInfoDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.updateSiteInfo(updateDto);
    this.isrProvider.activeAll('更新站点配置触发增量渲染！');
    this.walineProvider.restart('更新站点，');
    return {
      statusCode: 200,
      data,
    };
  }
}
