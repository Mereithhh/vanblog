import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';

import { OverviewProvider } from 'src/provider/overview/overview.provider';

@ApiTags('welcome')
@UseGuards(AdminGuard)
@Controller('/api/admin/welcome')
export class WelcomeController {
  constructor(private readonly overviewProvider: OverviewProvider) {}

  @Get()
  async getWelcomePageData() {
    const data = await this.overviewProvider.getWelcomePageData();
    return {
      statusCode: 200,
      data,
    };
  }
}
