import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';

import {
  AnalysisProvider,
  WelcomeTab,
} from 'src/provider/analysis/analysis.provider';

@ApiTags('analysis')
@UseGuards(AdminGuard)
@Controller('/api/admin/analysis')
export class AnalysisController {
  constructor(private readonly analysisProvider: AnalysisProvider) {}

  @Get()
  async getWelcomePageData(
    @Query('tab') tab: WelcomeTab,
    @Query('viewerDataNum') viewerDataNum = 5,
    @Query('overviewDataNum') overviewDataNum = 5,
    @Query('articleTabDataNum') articleTabDataNum = 5,
  ) {
    const data = await this.analysisProvider.getWelcomePageData(
      tab,
      overviewDataNum,
      viewerDataNum,
      articleTabDataNum,
    );
    return {
      statusCode: 200,
      data,
    };
  }
}
