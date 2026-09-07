const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const {
  ADMIN_AUDIT_API_PATH,
  ADMIN_AUDIT_API_LEGACY_PATH,
  pathHasLogSegment,
  buildAuditSearchUrl,
} = require('../../src/services/van-blog/auditApi');

describe('admin audit API path (#289)', () => {
  it('canonical path has no log segment so typical uBlock filters miss it', () => {
    assert.equal(ADMIN_AUDIT_API_PATH, '/api/admin/audit');
    assert.equal(pathHasLogSegment(ADMIN_AUDIT_API_PATH), false);
    assert.equal(pathHasLogSegment(ADMIN_AUDIT_API_LEGACY_PATH), true);
  });

  it('builds the search URL the log UI fetches', () => {
    assert.equal(
      buildAuditSearchUrl('login', 2, 10),
      '/api/admin/audit?event=login&pageSize=10&page=2',
    );
    assert.equal(pathHasLogSegment(buildAuditSearchUrl('system', 1, 1000)), false);
  });

  it('getLog in api.js calls the new path, not /api/admin/log', () => {
    const apiSrc = readFileSync(
      path.join(__dirname, '../../src/services/van-blog/api.js'),
      'utf8',
    );
    assert.match(apiSrc, /buildAuditSearchUrl/);
    assert.doesNotMatch(apiSrc, /`\/api\/admin\/log\?event=/);
  });
});
