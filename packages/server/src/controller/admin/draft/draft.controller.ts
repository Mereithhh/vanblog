import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateDraftDto, UpdateDraftDto } from 'src/dto/draft.dto';
import { DraftProvider } from 'src/provider/draft/draft.provider';

@ApiTags('draft')
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
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    const data = await this.draftProvider.deleteById(id);
    return {
      statusCode: 200,
      data,
    };
  }
}
