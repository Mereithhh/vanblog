import {
  Body,
  Controller,
  Get,
  Put,
  UseGuards,
  Logger,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';

import { SettingProvider } from 'src/provider/setting/setting.provider';
import { HttpsSetting } from 'src/dto/setting.dto';
import { CaddyProvider } from 'src/provider/caddy/caddy.provider';
import { isIpv4 } from 'src/utils/ip';

@ApiTags('caddy')
@Controller('/api/admin/caddy')
export class CaddyController {
  private readonly logger = new Logger(CaddyController.name);
  constructor(
    private readonly settingProvider: SettingProvider,
    private readonly caddyProvider: CaddyProvider,
  ) {}
  @UseGuards(AdminGuard)
  @Get('https')
  async getHttpsConfig() {
    const config = await this.settingProvider.getHttpsSetting();
    return {
      statusCode: 200,
      data: config,
    };
  }

  @Get('ask')
  async askOnDemand(@Query('domain') domain: string) {
    // console.log(is);
    const is = isIpv4(domain);
    // console.log(domain, is);
    if (!is) {
      return 'is Domain, on damand https';
    } else {
      // 增加到 subjects 中
      this.logger.log('试图通过 ip + https 访问，已驳回');
      // this.caddyProvider.addSubject(domain);
      throw new BadRequestException();
    }
  }
  @UseGuards(AdminGuard)
  @Delete('log')
  async clearLog() {
    await this.caddyProvider.clearLog();
    return {
      statusCode: 200,
      data: '清除 Caddy 运行日志成功！',
    };
  }
  @UseGuards(AdminGuard)
  @Get('log')
  async getCaddyLog() {
    const log = await this.caddyProvider.getLog();
    return {
      statusCode: 200,
      data: log,
    };
  }
  @UseGuards(AdminGuard)
  @Get('config')
  async getCaddyConfig() {
    const caddyConfig = await this.caddyProvider.getConfig();
    return {
      statusCode: 200,
      data: JSON.stringify(caddyConfig, null, 2),
    };
  }
  @UseGuards(AdminGuard)
  @Put('https')
  async updateHttpsConfig(@Body() dto: HttpsSetting) {
    const result = await this.caddyProvider.setRedirect(dto.redirect || false);
    if (!result) {
      return {
        statusCode: 500,
        message: '更新失败！请查看 Caddy 日志获取详细信息！',
      };
    }
    await this.settingProvider.updateHttpsSetting(dto);
    return {
      statusCode: 200,
      data: '更新成功！',
    };
  }
}
