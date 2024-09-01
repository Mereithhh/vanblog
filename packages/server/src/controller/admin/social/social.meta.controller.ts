import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SocialDto, SocialType } from 'src/types/social.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { config } from 'src/config';
import { WebsiteProvider } from 'src/provider/website/website.provider';
import { ApiToken } from 'src/provider/swagger/token';
@ApiTags('social')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/meta/social')
export class SocialMetaController {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly isrProvider: ISRProvider,
    private readonly websiteProvider: WebsiteProvider,
  ) {}

  @Get()
  async get() {
    const data = await this.metaProvider.getSocials();
    return {
      statusCode: 200,
      data,
    };
  }
  @Get('/types')
  async getTypes() {
    const data = await this.metaProvider.getSocialTypes();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() updateDto: SocialDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.addOrUpdateSocial(updateDto);
    this.isrProvider.activeAll('更新联系方式触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() updateDto: SocialDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.addOrUpdateSocial(updateDto);
    this.isrProvider.activeAll('创建联系方式触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete('/:type')
  async delete(@Param('type') type: SocialType) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.deleteSocial(type);
    this.isrProvider.activeAll('删除联系方式触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
