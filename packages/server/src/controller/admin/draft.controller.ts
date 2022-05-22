import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CreateArticleDto, UpdateArticleDto } from 'src/dto/article.dto';
import { CreateDraftDto, UpdateDraftDto } from 'src/dto/draft.dto';
import { LinkDto } from 'src/dto/link.dto';
import { AritcleProvider } from 'src/provider/article.provider';
import { CategoryProvider } from 'src/provider/category.provider';
import { DraftProvider } from 'src/provider/draft.provider';
import { MetaProvider } from 'src/provider/meta.provider';
import { TagProvider } from 'src/provider/tag.provider';

@Controller('/api/admin/draft')
export class DraftMetaController {
  constructor(
    private readonly articleProvider: AritcleProvider,
    private readonly draftProvider: DraftProvider,
    private readonly categoryProvider: CategoryProvider,
    private readonly tagProvider: TagProvider,
    private readonly metaProvider: MetaProvider,
  ) {}

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
