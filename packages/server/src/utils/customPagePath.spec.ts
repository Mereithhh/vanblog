import { resolveUnderCustomPageRoot, toCustomPageRelativePath } from './customPagePath';
import * as path from 'path';

describe('toCustomPageRelativePath', () => {
  it('joins page path and nested folder file without a leading slash', () => {
    expect(toCustomPageRelativePath('/clock', 'css/style.css')).toBe('clock/css/style.css');
    expect(toCustomPageRelativePath('/test', 'BFC.md')).toBe('test/BFC.md');
  });

  it('normalizes Windows separators from webkitRelativePath / originalname', () => {
    expect(toCustomPageRelativePath('/clock', 'assets\\js\\app.js')).toBe('clock/assets/js/app.js');
  });

  it('drops .. segments so uploads cannot escape the page folder', () => {
    expect(toCustomPageRelativePath('/clock', '../etc/passwd')).toBe('clock/etc/passwd');
  });
});

describe('resolveUnderCustomPageRoot', () => {
  const staticPath = path.join('/tmp', 'vanblog-static');

  it('resolves nested files under static/customPage', () => {
    expect(resolveUnderCustomPageRoot(staticPath, 'customPage', '/clock', 'css/style.css')).toBe(
      path.resolve(staticPath, 'customPage', 'clock', 'css', 'style.css'),
    );
  });

  it('strips .. so a crafted key cannot leave static/customPage', () => {
    expect(
      resolveUnderCustomPageRoot(staticPath, 'customPage', '/clock', '../../../etc/passwd'),
    ).toBe(path.resolve(staticPath, 'customPage', 'clock', 'etc', 'passwd'));
  });
});
