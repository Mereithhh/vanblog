import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { LinkDto } from 'src/dto/link.dto';
import { MetaProvider } from 'src/provider/meta/meta.provider';

@Controller('/api/admin/meta/link')
export class LinkMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

  @Get()
  async get() {
    return await this.metaProvider.getLinks();
  }

  @Put()
  async update(@Body() updateLinkDto: LinkDto) {
    return await this.metaProvider.addOrUpdateLink(updateLinkDto);
  }

  @Post()
  async create(@Body() updateLinkDto: LinkDto) {
    return await this.metaProvider.addOrUpdateLink(updateLinkDto);
  }
  @Delete('/:name')
  async delete(@Param('name') name: string) {
    return await this.metaProvider.deleteLink(name);
  }
}
