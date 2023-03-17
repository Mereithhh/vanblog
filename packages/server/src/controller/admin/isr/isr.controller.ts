import { Body, Controller, Get, Post, Put, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';

import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { SettingProvider } from 'src/provider/setting/setting.provider';
import { ApiToken } from 'src/provider/swagger/token';
import { WebsiteProvider } from 'src/provider/website/website.provider';
import { ISRSetting } from 'src/types/setting.dto';

@ApiTags('isr')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/isr')
export class ISRController {
  constructor(
    private readonly isrProvider: ISRProvider,
    private readonly settingProvider: SettingProvider,
    private readonly websiteProvider: WebsiteProvider,
  ) {}
  @Post()
  async activeISR() {
    await this.isrProvider.activeAll('手动触发 ISR', undefined, {
      forceActice: true,
    });
    return {
      statusCode: 200,
      data: '触发成功！',
    };
  }
  @Put()
  async updateISRSetting(@Body() dto: ISRSetting) {
    await this.settingProvider.updateISRSetting(dto);
    await this.websiteProvider.restart('更新 ISR 配置');
    return {
      statusCode: 200,
      data: '更新成功！',
    };
  }
  @Get()
  async getISRSetting() {
    const data = await this.settingProvider.getISRSetting();
    return {
      statusCode: 200,
      data,
    };
  }
}
