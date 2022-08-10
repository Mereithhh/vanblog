import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';

import { ApiTags } from '@nestjs/swagger';
import { StaticSetting } from 'src/dto/setting.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { SettingProvider } from 'src/provider/setting/setting.provider';

@ApiTags('setting')
@UseGuards(AdminGuard)
@Controller('/api/admin/setting')
export class SettingController {
  constructor(private readonly settingProvider: SettingProvider) {}

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
}
