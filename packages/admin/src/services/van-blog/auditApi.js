/**
 * Adblock-safe admin audit (formerly "log") API path.
 * uBlock / EasyPrivacy often block URLs whose path contains a `log` segment
 * (e.g. `/api/admin/log?…`), which made 日志管理 fail to load (#289).
 */
const ADMIN_AUDIT_API_PATH = '/api/admin/audit';
const ADMIN_AUDIT_API_LEGACY_PATH = '/api/admin/log';

function pathHasLogSegment(pathname) {
  return String(pathname)
    .split('?')[0]
    .split('/')
    .filter(Boolean)
    .includes('log');
}

function buildAuditSearchUrl(type, page, pageSize = 10) {
  return `${ADMIN_AUDIT_API_PATH}?event=${type}&pageSize=${pageSize}&page=${page}`;
}

module.exports = {
  ADMIN_AUDIT_API_PATH,
  ADMIN_AUDIT_API_LEGACY_PATH,
  pathHasLogSegment,
  buildAuditSearchUrl,
};
