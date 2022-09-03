import {
  Controller,
  UseGuards,
  Logger,
  Get,
  Post,
  Body,
  Put,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { config } from 'src/config';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { CustomPageProvider } from 'src/provider/customPage/customPage.provider';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { CustomPage } from 'src/scheme/customPage.schema';

@ApiTags('customPage')
@UseGuards(...AdminGuard)
@Controller('/api/admin/customPage')
export class CustomPageController {
  private readonly logger = new Logger(CustomPageController.name);
  constructor(
    private readonly customPageProvider: CustomPageProvider,
    private readonly isrProvider: ISRProvider,
  ) {}
  @Get('/all')
  async getAll() {
    return {
      statusCode: 200,
      data: await this.customPageProvider.getAll(),
    };
  }
  @Get()
  async getOneByPath(@Query('path') path: string) {
    return {
      statusCode: 200,
      data: await this.customPageProvider.getCustomPageByPath(path),
    };
  }
  @Post()
  async createOne(@Body() dto: CustomPage) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.customPageProvider.createCustomPage(dto);
    this.isrProvider.activeCustomPages('新建自定义页面');
    return {
      statusCode: 200,
      data,
    };
  }
  @Put()
  async updateOne(@Body() dto: CustomPage) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.customPageProvider.updateCustomPage(dto);
    this.isrProvider.activeCustomPages('更新自定义页面');
    return {
      statusCode: 200,
      data,
    };
  }
  @Delete()
  async deleteOne(@Query('path') path: string) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止修改此项！',
      };
    }
    const data = await this.customPageProvider.deleteByPath(path);
    this.isrProvider.activeCustomPages('删除自定义页面');
    return {
      statusCode: 200,
      data,
    };
  }
}
