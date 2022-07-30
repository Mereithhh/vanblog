import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';

import {
  AnalysisProvider,
  WelcomeTab,
} from 'src/provider/analysis/analysis.provider';

@ApiTags('analysis')
@UseGuards(AdminGuard)
@Controller('/api/admin/welcome')
export class AnalysisController {
  constructor(private readonly analysisProvider: AnalysisProvider) {}

  @Get()
  async getWelcomePageData(@Query('tab') tab: WelcomeTab) {
    const data = await this.analysisProvider.getWelcomePageData(tab);
    return {
      statusCode: 200,
      data,
    };
  }
}
