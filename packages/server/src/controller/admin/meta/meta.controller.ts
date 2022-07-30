import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { version } from '../../../utils/loadConfig';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { Request } from 'express';

@ApiTags('meta')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta')
export class MetaController {
  @Get()
  async getAllMeta(@Req() req: Request) {
    const data = {
      version: version,
      user: req.user,
    };
    return {
      statusCode: 200,
      data,
    };
  }
}
