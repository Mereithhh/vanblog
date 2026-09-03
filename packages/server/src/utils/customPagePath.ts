import * as path from 'path';

/**
 * Join custom-page path parts into a relative POSIX path.
 * Drops empty / `.` / `..` segments so uploads stay under static/customPage.
 */
export const toCustomPageRelativePath = (...parts: Array<string | undefined | null>) => {
  return parts
    .filter((part): part is string => part != null && String(part).length > 0)
    .flatMap((part) => String(part).replace(/\\/g, '/').split('/'))
    .filter((seg) => seg.length > 0 && seg !== '.' && seg !== '..')
    .join('/');
};

export const resolveUnderCustomPageRoot = (
  staticPath: string,
  storagePath: string,
  ...parts: Array<string | undefined | null>
) => {
  const relative = toCustomPageRelativePath(...parts);
  const root = path.resolve(staticPath, storagePath);
  const resolved = relative ? path.resolve(root, ...relative.split('/')) : root;
  const rel = path.relative(root, resolved);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    throw new Error('非法路径');
  }
  return resolved;
};
