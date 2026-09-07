import { ForbiddenException } from '@nestjs/common';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { config } from 'src/config';
import {
  normalizeCustomPageRel,
  publicCustomPageRelFromUrl,
  resolveCustomPageAbs,
  resolvePublicCustomPageRequest,
  splitUrlPathAndSearch,
} from './customPagePath';

describe('public custom page path helpers (#337)', () => {
  it('strips query and hash from req.url', () => {
    expect(splitUrlPathAndSearch('/c/uptime/?x=1#app')).toEqual({
      pathname: '/c/uptime/',
      search: '?x=1',
    });
    expect(splitUrlPathAndSearch('/c/uptime')).toEqual({
      pathname: '/c/uptime',
      search: '',
    });
  });

  it('maps /c/uptime/ to uptime/ even when a query is present', () => {
    expect(publicCustomPageRelFromUrl('/c/uptime/')).toBe('uptime/');
    expect(publicCustomPageRelFromUrl('/c/uptime/?from=status')).toBe('uptime/');
    expect(publicCustomPageRelFromUrl('/c/uptime/static/js/main.js')).toBe(
      'uptime/static/js/main.js',
    );
  });

  it('rejects .. segments the same way as uploads', () => {
    expect(() => normalizeCustomPageRel('uptime', '../secret')).toThrow(ForbiddenException);
    expect(() => resolveCustomPageAbs('uptime/../../../etc/passwd')).toThrow(ForbiddenException);
  });
});

describe('resolvePublicCustomPageRequest (#337)', () => {
  let tmp: string;
  let prevStatic: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-cpage-'));
    prevStatic = config.staticPath;
    config.staticPath = tmp;
    const root = path.join(tmp, 'customPage', 'uptime');
    fs.mkdirSync(path.join(root, 'static', 'js'), { recursive: true });
    fs.writeFileSync(path.join(root, 'index.html'), '<h1>uptime</h1>');
    fs.writeFileSync(path.join(root, 'static', 'js', 'main.js'), 'console.log(1)');
    fs.writeFileSync(path.join(root, 'README'), 'no-ext');
  });

  afterEach(() => {
    config.staticPath = prevStatic;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('serves index.html for a trailing-slash directory URL', () => {
    const target = resolvePublicCustomPageRequest('/c/uptime/');
    expect(target).toEqual({
      kind: 'file',
      absPath: path.join(tmp, 'customPage', 'uptime', 'index.html'),
    });
  });

  it('still serves index.html when the directory URL has a query string', () => {
    const target = resolvePublicCustomPageRequest('/c/uptime/?tab=1');
    expect(target.kind).toBe('file');
    if (target.kind === 'file') {
      expect(target.absPath).toBe(path.join(tmp, 'customPage', 'uptime', 'index.html'));
    }
  });

  it('redirects a directory URL without a trailing slash and keeps the query', () => {
    expect(resolvePublicCustomPageRequest('/c/uptime')).toEqual({
      kind: 'redirect',
      location: '/c/uptime/',
    });
    expect(resolvePublicCustomPageRequest('/c/uptime?from=nav')).toEqual({
      kind: 'redirect',
      location: '/c/uptime/?from=nav',
    });
  });

  it('serves nested static assets under the custom page', () => {
    const target = resolvePublicCustomPageRequest('/c/uptime/static/js/main.js');
    expect(target).toEqual({
      kind: 'file',
      absPath: path.join(tmp, 'customPage', 'uptime', 'static', 'js', 'main.js'),
    });
  });

  it('returns missing when index.html is not at the custom page root', () => {
    fs.unlinkSync(path.join(tmp, 'customPage', 'uptime', 'index.html'));
    fs.mkdirSync(path.join(tmp, 'customPage', 'uptime', 'uptime-status'), { recursive: true });
    fs.writeFileSync(
      path.join(tmp, 'customPage', 'uptime', 'uptime-status', 'index.html'),
      '<h1>nested</h1>',
    );
    expect(resolvePublicCustomPageRequest('/c/uptime/')).toEqual({ kind: 'missing' });
    expect(resolvePublicCustomPageRequest('/c/uptime/uptime-status/')).toEqual({
      kind: 'file',
      absPath: path.join(tmp, 'customPage', 'uptime', 'uptime-status', 'index.html'),
    });
  });

  it('returns missing for path traversal instead of escaping the customPage root', () => {
    expect(resolvePublicCustomPageRequest('/c/uptime/../../../etc/passwd')).toEqual({
      kind: 'missing',
    });
    expect(resolvePublicCustomPageRequest('/c/uptime/%2e%2e/%2e%2e/etc/passwd')).toEqual({
      kind: 'missing',
    });
  });

  it('serves extensionless files that are not directories', () => {
    expect(resolvePublicCustomPageRequest('/c/uptime/README')).toEqual({
      kind: 'file',
      absPath: path.join(tmp, 'customPage', 'uptime', 'README'),
    });
  });
});
