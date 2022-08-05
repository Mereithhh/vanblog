import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { version } from '../../../utils/loadConfig';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { Request } from 'express';
import { MetaProvider } from 'src/provider/meta/meta.provider';

@ApiTags('meta')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta')
export class MetaController {
  constructor(private readonly metaProvider: MetaProvider) {}
  @Get()
  async getAllMeta(@Req() req: Request) {
    const meta = await this.metaProvider.getAll();
    const data = {
      version: version,
      user: req.user,
      baseUrl: meta.siteInfo.baseUrl,
      walineServerUrl: meta.siteInfo.walineServerUrl || '',
    };
    return {
      statusCode: 200,
      data,
    };
  }
}
