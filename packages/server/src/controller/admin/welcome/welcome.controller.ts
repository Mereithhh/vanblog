import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';

import {
  OverviewProvider,
  WelcomeTab,
} from 'src/provider/overview/overview.provider';

@ApiTags('welcome')
@UseGuards(AdminGuard)
@Controller('/api/admin/welcome')
export class WelcomeController {
  constructor(private readonly overviewProvider: OverviewProvider) {}

  @Get()
  async getWelcomePageData(@Query('tab') tab: WelcomeTab) {
    const data = await this.overviewProvider.getWelcomePageData(tab);
    return {
      statusCode: 200,
      data,
    };
  }
}
