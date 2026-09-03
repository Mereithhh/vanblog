import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { checkOrCreateByFilePath } from './checkFolder';

/**
 * #338: Win11 multi-file custom page upload called checkOrCreateByFilePath
 * with a path.join() result that uses `\`. Splitting only on `/` made
 * folderPath empty and mkdirSync threw ENOENT.
 */
describe('checkOrCreateByFilePath (#338)', () => {
  let tmp: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-checkfolder-'));
  });

  afterEach(() => {
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('creates parents for a native path.join file path', () => {
    const filePath = path.join(tmp, 'customPage', 'test', 'BFC.md');
    checkOrCreateByFilePath(filePath);
    expect(fs.existsSync(path.dirname(filePath))).toBe(true);
  });

  it('creates parents when the path uses Windows backslashes', () => {
    const filePath = [tmp, 'customPage', 'test', 'nested', 'index.html'].join('\\');
    checkOrCreateByFilePath(filePath);
    expect(fs.existsSync(path.join(tmp, 'customPage', 'test', 'nested'))).toBe(true);
  });

  it('old split("/") on a backslash path yields empty folder (the Win11 bug)', () => {
    const winStyle = [tmp, 'customPage', 'test', 'BFC.md'].join('\\');
    const folderPathArr = winStyle.split('/');
    folderPathArr.pop();
    const folderPath = folderPathArr.join('/');
    expect(folderPath).toBe('');
    expect(() => fs.mkdirSync(folderPath, { recursive: true })).toThrow(/ENOENT|empty/);
  });
});
