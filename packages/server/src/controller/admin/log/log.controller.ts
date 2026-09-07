import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminGuard } from 'src/provider/auth/auth.guard';
import { LogProvider } from 'src/provider/log/log.provider';
import { EventType } from 'src/provider/log/types';
import { ApiToken } from 'src/provider/swagger/token';
import { sanitizePagination } from 'src/utils/pagination';

/** Canonical path: avoid a `log` segment so ad blockers do not drop the request (#289). */
export const ADMIN_AUDIT_API_PATH = '/api/admin/audit';
/** Kept so existing tokens / scripts that still call /api/admin/log keep working. */
export const ADMIN_AUDIT_API_LEGACY_PATH = '/api/admin/log';

@ApiTags('audit')
@UseGuards(...AdminGuard)
@ApiToken
@Controller([ADMIN_AUDIT_API_PATH, ADMIN_AUDIT_API_LEGACY_PATH])
export class LogController {
  constructor(private readonly logProvider: LogProvider) {}

  @Get()
  async get(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('event') event: EventType,
  ) {
    const paging = sanitizePagination(page, pageSize, { defaultPageSize: 10 });
    const data = await this.logProvider.searchLog(paging.page, paging.pageSize, event);
    return {
      statusCode: 200,
      data,
    };
  }
}
