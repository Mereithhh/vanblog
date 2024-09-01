import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';

import { AnalysisProvider, WelcomeTab } from 'src/provider/analysis/analysis.provider';
import { ApiToken } from 'src/provider/swagger/token';

@ApiTags('analysis')
@ApiToken
@UseGuards(...AdminGuard)
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
      parseInt(overviewDataNum as any),
      parseInt(viewerDataNum as any),
      parseInt(articleTabDataNum as any),
    );
    return {
      statusCode: 200,
      data,
    };
  }
}
