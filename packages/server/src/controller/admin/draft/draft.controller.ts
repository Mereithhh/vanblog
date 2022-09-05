import {
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
import {
  CreateDraftDto,
  PublishDraftDto,
  UpdateDraftDto,
} from 'src/types/draft.dto';
import { SortOrder } from 'src/types/sort';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { DraftProvider } from 'src/provider/draft/draft.provider';
import { ISRProvider } from 'src/provider/isr/isr.provider';
import { config } from 'src/config';

@ApiTags('draft')
@UseGuards(...AdminGuard)
@Controller('/api/admin/draft')
export class DraftController {
  constructor(
    private readonly draftProvider: DraftProvider,
    private readonly isrProvider: ISRProvider,
  ) {}

  @Get('/')
  async getByOption(
    @Query('page') page: number,
    @Query('pageSize') pageSize = 5,
    @Query('toListView') toListView = false,
    @Query('category') category?: string,
    @Query('tags') tags?: string,
    @Query('title') title?: string,
    @Query('sortCreatedAt') sortCreatedAt?: SortOrder,
    @Query('startTime') startTime?: string,
    @Query('endTime') endTime?: string,
  ) {
    const option = {
      page,
      pageSize,
      category,
      tags,
      title,
      sortCreatedAt,
      startTime,
      endTime,
      toListView,
    };
    const data = await this.draftProvider.getByOption(option);
    return {
      statusCode: 200,
      data,
    };
  }

  @Get('/:id')
  async getOne(@Param('id') id: number) {
    const data = await this.draftProvider.findById(id);
    return {
      statusCode: 200,
      data,
    };
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateDraftDto) {
    const data = await this.draftProvider.updateById(id, updateDto);
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Req() req: any, @Body() createDto: CreateDraftDto) {
    const author = req?.user?.nickname || undefined;
    if (!createDto.author) {
      createDto.author = author;
    }
    const data = await this.draftProvider.create(createDto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Post('/publish')
  async publish(@Query('id') id: number, @Body() publishDto: PublishDraftDto) {
    if (config.demo && config.demo == 'true') {
      return {
        statusCode: 401,
        message: '演示站禁止发布草稿！',
      };
    }
    const data = await this.draftProvider.publish(id, publishDto);
    this.isrProvider.activeAll('发布草稿触发增量渲染！');
    return {
      statusCode: 200,
      data,
    };
  }
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    const data = await this.draftProvider.deleteById(id);
    return {
      statusCode: 200,
      data,
    };
  }
}
