import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { LogProvider } from 'src/provider/log/log.provider';
import { EventType } from 'src/provider/log/types';
import { ApiToken } from 'src/provider/swagger/token';
@ApiTags('log')
@UseGuards(...AdminGuard)
@ApiToken
@Controller('/api/admin/log')
export class LogController {
  constructor(private readonly logProvider: LogProvider) {}

  @Get()
  async get(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('event') event: EventType,
  ) {
    // console.log(event, page, pageSize);
    const data = await this.logProvider.searchLog(page, pageSize, event);
    return {
      statusCode: 200,
      data,
    };
  }
}
