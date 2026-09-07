import { PATH_METADATA } from '@nestjs/common/constants';
import {
  ADMIN_AUDIT_API_LEGACY_PATH,
  ADMIN_AUDIT_API_PATH,
  LogController,
} from './log.controller';
import { EventType } from 'src/provider/log/types';

describe('LogController audit path (#289)', () => {
  it('registers /api/admin/audit as the canonical path (no log segment)', () => {
    const paths = Reflect.getMetadata(PATH_METADATA, LogController);
    const list = Array.isArray(paths) ? paths : [paths];
    expect(list[0]).toBe(ADMIN_AUDIT_API_PATH);
    expect(list).toContain(ADMIN_AUDIT_API_PATH);
    expect(ADMIN_AUDIT_API_PATH.split('/').filter(Boolean).includes('log')).toBe(
      false,
    );
  });

  it('keeps /api/admin/log as a backward-compatible alias with the same guards', () => {
    const paths = Reflect.getMetadata(PATH_METADATA, LogController);
    const list = Array.isArray(paths) ? paths : [paths];
    expect(list).toContain(ADMIN_AUDIT_API_LEGACY_PATH);
    expect(list).toEqual([ADMIN_AUDIT_API_PATH, ADMIN_AUDIT_API_LEGACY_PATH]);
  });

  it('returns searchLog rows for login events', async () => {
    const row = {
      time: '2024-01-02T03:04:05.000Z',
      address: '上海-测试区',
      ip: '203.0.113.10',
      platform: 'Firefox',
      success: true,
    };
    const logProvider = {
      searchLog: jest.fn().mockResolvedValue({ data: [row], total: 1 }),
    };
    const controller = new LogController(logProvider as any);
    const result = await controller.get(1, 10, EventType.LOGIN);
    expect(logProvider.searchLog).toHaveBeenCalledWith(1, 10, EventType.LOGIN);
    expect(result).toEqual({
      statusCode: 200,
      data: { data: [row], total: 1 },
    });
  });

  it('sanitizes a hostile page so searchLog never sees a negative offset (#400)', async () => {
    const logProvider = {
      searchLog: jest.fn().mockResolvedValue({ data: [], total: 0 }),
    };
    const controller = new LogController(logProvider as any);
    await controller.get(NaN as any, 'nope' as any, EventType.LOGIN);
    const [page, pageSize] = logProvider.searchLog.mock.calls[0];
    expect(page).toBeGreaterThanOrEqual(1);
    expect(pageSize).toBeGreaterThanOrEqual(1);
    expect((page - 1) * pageSize).toBeGreaterThanOrEqual(0);
  });
});
