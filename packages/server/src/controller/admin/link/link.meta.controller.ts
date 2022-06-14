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
import { LinkDto } from 'src/dto/link.dto';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { MetaProvider } from 'src/provider/meta/meta.provider';
@ApiTags('link')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta/link')
export class LinkMetaController {
  constructor(private readonly metaProvider: MetaProvider) {}

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
    const data = await this.metaProvider.addOrUpdateLink(updateLinkDto);
    return {
      statusCode: 200,
      data,
    };
  }

  @Post()
  async create(@Body() updateLinkDto: LinkDto) {
    const data = await this.metaProvider.addOrUpdateLink(updateLinkDto);
    return {
      statusCode: 200,
      data,
    };
  }
  @Delete('/:name')
  async delete(@Param('name') name: string) {
    const data = await this.metaProvider.deleteLink(name);
    return {
      statusCode: 200,
      data,
    };
  }
}
