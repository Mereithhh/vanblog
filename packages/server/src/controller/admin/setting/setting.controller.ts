import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config/index';
import {
  LayoutSetting,
  StaticSetting,
  WalineSetting,
} from 'src/types/setting.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { SettingProvider } from 'src/provider/setting/setting.provider';
import { WalineProvider } from 'src/provider/waline/waline.provider';

@ApiTags('setting')
@UseGuards(AdminGuard)
@Controller('/api/admin/setting')
export class SettingController {
  constructor(
    private readonly settingProvider: SettingProvider,
    private readonly walineProvider: WalineProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get('static')
  async getStaticSetting() {
    const res = await this.settingProvider.getStaticSetting();
    return {
      statusCode: 200,
      data: res,
    };
  }

  @Put('static')
  async updateStaticSetting(@Body() body: StaticSetting) {
    const res = await this.settingProvider.updateStaticSetting(body);
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Put('waline')
  async updateWalineSetting(@Body() body: WalineSetting) {
    const res = await this.settingProvider.updateWalineSetting(body);
    await this.walineProvider.restart('更新 waline 设置，');
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Get('waline')
  async getWalineSetting() {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 200,
        data: null,
      };
    }
    const res = await this.settingProvider.getWalineSetting();
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Put('layout')
  async updateLayoutSetting(@Body() body: LayoutSetting) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改定制化设置！',
      };
    }
    const res = await this.settingProvider.updateLayoutSetting(body);
    await this.walineProvider.restart('更新 layout 设置，');
    this.isrProvider.activeAll('更新 layout 设置');
    return {
      statusCode: 200,
      data: res,
    };
  }
  @Get('layout')
  async getLayoutSetting() {
    const res = await this.settingProvider.getLayoutSetting();
    return {
      statusCode: 200,
      data: res,
    };
  }
}
