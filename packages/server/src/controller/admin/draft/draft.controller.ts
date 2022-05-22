import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateDraftDto, UpdateDraftDto } from 'src/dto/draft.dto';
import { DraftProvider } from 'src/provider/draft/draft.provider';

@Controller('/api/admin/draft')
export class DraftController {
  constructor(private readonly draftProvider: DraftProvider) {}

  @Get('/')
  async getAll() {
    return await this.draftProvider.getAll();
  }

  @Get('/:id')
  async getOne(@Param('id') id: number) {
    return await this.draftProvider.findById(id);
  }

  @Put('/:id')
  async update(@Param('id') id: number, @Body() updateDto: UpdateDraftDto) {
    return await this.draftProvider.updateById(id, updateDto);
  }

  @Post()
  async create(@Body() createDto: CreateDraftDto) {
    return await this.draftProvider.create(createDto);
  }
  @Delete('/:id')
  async delete(@Param('id') id: number) {
    return await this.draftProvider.deleteById(id);
  }
}
