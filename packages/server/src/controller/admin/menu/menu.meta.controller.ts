import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MenuItem } from 'src/dto/menu.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@ApiTags('menu')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta/menu')
export class MenuMetaController {
  constructor(
    private readonly metaProvider: MetaProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get()
  async get() {
    const data = await this.metaProvider.getMenus();
    return {
      statusCode: 200,
      data,
    };
  }

  @Put()
  async update(@Body() updateDto: Partial<MenuItem>) {
    const data = await this.metaProvider.addOrUpdateMemu(updateDto);
    this.isrProvider.activeAll('更新导航栏配置触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() updateDto: Partial<MenuItem>) {
    const data = await this.metaProvider.addOrUpdateMemu(updateDto);
    this.isrProvider.activeAll('修改导航栏配置触发增量渲染！');

    return {
      statusCode: 200,
      data,
    };
  }

  @Delete('/:name')
  async delete(@Param('name') name: string) {
    const data = await this.metaProvider.deleteMenuItem(name);
    this.isrProvider.activeAll('修改导航栏配置触发增量渲染！');

    return {
      statusCode: 200,
      data,
    };
  }
}
