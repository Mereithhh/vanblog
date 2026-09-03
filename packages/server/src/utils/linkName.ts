export const ADMIN_LINK_PATH_PREFIX = '/api/admin/meta/link/';

export function decodeLinkName(raw: string): string {
  if (raw == null || raw === '') {
    return '';
  }
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Remaining path after /api/admin/meta/link/, so https://... names survive routing. */
export function linkNameFromRequestPath(urlOrPath: string): string {
  const pathOnly = (urlOrPath || '').split('?')[0];
  const idx = pathOnly.indexOf(ADMIN_LINK_PATH_PREFIX);
  if (idx < 0) {
    return '';
  }
  return decodeLinkName(pathOnly.slice(idx + ADMIN_LINK_PATH_PREFIX.length));
}
