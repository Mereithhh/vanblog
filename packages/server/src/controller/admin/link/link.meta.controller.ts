import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { LinkDto } from 'src/types/link.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
import { config } from 'src/config';
import { ApiToken } from 'src/provider/swagger/token';
import { decodeLinkName, linkNameFromRequestPath } from 'src/utils/linkName';
@ApiTags('link')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/meta/link')
export class LinkMetaController {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get()
  async get() {
    const data = await this.metaProvider.getLinks();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() updateLinkDto: LinkDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.addOrUpdateLink(updateLinkDto);
    this.isrProvider.activeLink('更新友链触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() updateLinkDto: LinkDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.addOrUpdateLink(updateLinkDto);
    this.isrProvider.activeLink('创建友链触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Delete()
  async deleteByQuery(@Query('name') name: string) {
    return this.removeLink(decodeLinkName(name));
  }

  @Delete(':name')
  async deleteByParam(@Param('name') name: string) {
    return this.removeLink(decodeLinkName(name));
  }

  @Delete('*')
  async deleteByPath(@Req() req: Request) {
    return this.removeLink(linkNameFromRequestPath(req.originalUrl || req.url || ''));
  }

  private async removeLink(name: string) {
    if (!name) {
      throw new BadRequestException('name is required');
    }
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.metaProvider.deleteLink(name);
    this.isrProvider.activeLink('删除友链触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
}
