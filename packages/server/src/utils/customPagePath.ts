import { ForbiddenException } from '@nestjs/common';
import * as path from 'path';
import { config } from 'src/config';
import { StoragePath } from 'src/types/setting.dto';

export function toPosixRel(p: string): string {
  return (p || '').replace(/\\/g, '/');
}

export function normalizeCustomPageRel(...parts: string[]): string {
  const segs = parts
    .flatMap((p) => toPosixRel(p).split('/'))
    .filter((seg) => seg && seg !== '.');
  if (segs.some((seg) => seg === '..')) {
    throw new ForbiddenException('非法路径');
  }
  return segs.join('/');
}

export function resolveCustomPageAbs(...parts: string[]): string {
  const root = path.resolve(config.staticPath, StoragePath['customPage']);
  const rel = normalizeCustomPageRel(...parts);
  const abs = rel ? path.resolve(root, ...rel.split('/')) : root;
  const toRoot = path.relative(root, abs);
  if (toRoot.startsWith('..') || path.isAbsolute(toRoot)) {
    throw new ForbiddenException('非法路径');
  }
  return abs;
}
