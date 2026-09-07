import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { rmDir } from './deleteFolder';

describe('rmDir', () => {
  let tmp: string;
  let prevCwd: string;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-rmdir-'));
    prevCwd = process.cwd();
    process.chdir(tmp);
  });

  afterEach(() => {
    process.chdir(prevCwd);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('recursively deletes a directory and leaves siblings intact', () => {
    const target = path.join(tmp, 'plain');
    fs.mkdirSync(path.join(target, 'nested'), { recursive: true });
    fs.writeFileSync(path.join(target, 'nested', 'file.txt'), 'x');
    const sibling = path.join(tmp, 'keep-me');
    fs.mkdirSync(sibling);
    fs.writeFileSync(path.join(sibling, 'ok.txt'), 'ok');

    rmDir(target);

    expect(fs.existsSync(target)).toBe(false);
    expect(fs.existsSync(path.join(sibling, 'ok.txt'))).toBe(true);
  });

  it('deletes a path with spaces without treating them as extra arguments', () => {
    const target = path.join(tmp, 'dir with spaces');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'a.txt'), 'x');
    const sibling = path.join(tmp, 'with');
    fs.mkdirSync(sibling);
    fs.writeFileSync(path.join(sibling, 'keep.txt'), 'keep');

    rmDir(target);

    expect(fs.existsSync(target)).toBe(false);
    expect(fs.existsSync(path.join(sibling, 'keep.txt'))).toBe(true);
  });

  it('does not execute shell metacharacters in the path (#482)', () => {
    const target = path.join(tmp, 'safe && touch pwned');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'file.txt'), 'x');

    rmDir(target);

    expect(fs.existsSync(target)).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'pwned'))).toBe(false);
  });

  it('does not expand command substitution in the path (#482)', () => {
    const target = path.join(tmp, 'dir-$(touch pwned-sub)');
    fs.mkdirSync(target);
    fs.writeFileSync(path.join(target, 'file.txt'), 'x');

    rmDir(target);

    expect(fs.existsSync(target)).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'pwned-sub'))).toBe(false);
  });

  it('does not throw when the path is already missing', () => {
    expect(() => rmDir(path.join(tmp, 'missing'))).not.toThrow();
  });
});
