import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { version } from '../../../utils/loadConfig';
import { AdminGuard } from 'src/provider/auth/auth.guard';

@ApiTags('meta')
@UseGuards(AdminGuard)
@Controller('/api/admin/meta')
export class MetaController {
  constructor() {}

  @Get()
  async getAllMeta() {
    const data = {
      version: version,
    };
    return {
      statusCode: 200,
      data,
    };
  }
}
