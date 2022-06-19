import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  CreateDraftDto,
  PublishDraftDto,
  UpdateDraftDto,
} from 'src/dto/draft.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { DraftProvider } from 'src/provider/draft/draft.provider';

@ApiTags('draft')
@UseGuards(AdminGuard)
@Controller('/api/admin/draft')
export class DraftController {
  constructor(private readonly draftProvider: DraftProvider) {}

  @Get('/')
  async getAll() {
    const data = await this.draftProvider.getAll();
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
  async create(@Body() createDto: CreateDraftDto) {
    const data = await this.draftProvider.create(createDto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Post('/publish')
  async publish(@Query('id') id: number, @Body() publishDto: PublishDraftDto) {
    const data = await this.draftProvider.publish(id, publishDto);
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
