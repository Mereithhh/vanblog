import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { StaticSetting, WalineSetting } from 'src/dto/setting.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { SettingProvider } from 'src/provider/setting/setting.provider';
import { WalineProvider } from 'src/provider/waline/waline.provider';

@ApiTags('setting')
@UseGuards(AdminGuard)
@Controller('/api/admin/setting')
export class SettingController {
  constructor(
    private readonly settingProvider: SettingProvider,
    private readonly walineProvider: WalineProvider,
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
    const res = await this.settingProvider.getWalineSetting();
    return {
      statusCode: 200,
      data: res,
    };
  }
}
