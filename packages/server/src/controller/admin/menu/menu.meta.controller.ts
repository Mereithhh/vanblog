import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';

import { config } from 'src/config';
import { SettingProvider } from 'src/provider/setting/setting.provider';
import { MenuSetting } from 'src/types/setting.dto';
import { ApiToken } from 'src/provider/swagger/token';
@ApiTags('menu')
@ApiToken
@UseGuards(...AdminGuard)
@Controller('/api/admin/meta/menu')
export class MenuMetaController {
  constructor(
    private readonly settingProvider: SettingProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get()
  async get() {
    const data = await this.settingProvider.getMenuSetting();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() dto: MenuSetting) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    await this.settingProvider.updateMenuSetting(dto);
    const data = await this.isrProvider.activeAll('更新导航栏配置触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
