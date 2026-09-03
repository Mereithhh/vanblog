import { ForbiddenException } from '@nestjs/common';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { config } from 'src/config';
import { checkOrCreateByFilePath } from 'src/utils/checkFolder';
import { normalizeCustomPageRel, resolveCustomPageAbs } from 'src/utils/customPagePath';
import { LocalProvider } from 'src/provider/static/local.provider';
import { StaticProvider } from 'src/provider/static/static.provider';

function flattenTree(nodes: any[] = [], acc: string[] = []): string[] {
  for (const node of nodes) {
    if (node.type === 'file') {
      acc.push(node.key);
    }
    if (node.children) {
      flattenTree(node.children, acc);
    }
  }
  return acc;
}

function oldFolderPathBySlash(p: string) {
  const folderPathArr = p.split('/');
  folderPathArr.pop();
  return folderPathArr.join('/');
}

describe('custom page multi-file upload and delete (#338)', () => {
  let tmp: string;
  let prevStatic: string;
  let staticProvider: StaticProvider;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-cp-'));
    prevStatic = config.staticPath;
    config.staticPath = tmp;
    staticProvider = new StaticProvider(
      {} as any,
      { getStaticSetting: async () => ({}) } as any,
      new LocalProvider(),
      {} as any,
      {} as any,
    );
  });

  afterEach(() => {
    config.staticPath = prevStatic;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('old `/`-only split drops the Windows path the reporter hit', () => {
    const winFile = 'C:\\var\\vanblog-dev\\static\\customPage\\test\\BFC.md';
    expect(oldFolderPathBySlash(winFile)).toBe('');
    expect(path.win32.dirname(winFile)).toBe('C:\\var\\vanblog-dev\\static\\customPage\\test');
    expect(path.posix.dirname('/var/vanblog-dev/static/customPage/test/BFC.md')).toBe(
      '/var/vanblog-dev/static/customPage/test',
    );
  });

  it('checkOrCreateByFilePath creates nested dirs from path.join output', () => {
    const dest = path.join(tmp, 'customPage', 'door', 'css', 'style.css');
    checkOrCreateByFilePath(dest);
    expect(fs.existsSync(path.dirname(dest))).toBe(true);
    fs.writeFileSync(dest, 'body{}');
    expect(fs.readFileSync(dest, 'utf8')).toBe('body{}');
  });

  it('uploads a single file under the custom page path', async () => {
    const res = await staticProvider.upload(
      { buffer: Buffer.from('<h1>hi</h1>'), originalname: 'index.html' },
      'customPage',
      false,
      '/door',
    );
    expect(res.isNew).toBe(true);
    expect(fs.readFileSync(path.join(tmp, 'customPage', 'door', 'index.html'), 'utf8')).toBe(
      '<h1>hi</h1>',
    );
    const tree = await staticProvider.getFolderFiles('/door');
    expect(flattenTree(tree)).toEqual(['index.html']);
  });

  it('uploads folder files so nested paths land correctly', async () => {
    await staticProvider.upload(
      { buffer: Buffer.from('body{}'), originalname: 'css/style.css' },
      'customPage',
      false,
      '/door',
    );
    await staticProvider.upload(
      { buffer: Buffer.from('ok'), originalname: 'css\\nested\\app.js' },
      'customPage',
      false,
      '/door',
    );
    expect(fs.readFileSync(path.join(tmp, 'customPage', 'door', 'css', 'style.css'), 'utf8')).toBe(
      'body{}',
    );
    expect(
      fs.readFileSync(path.join(tmp, 'customPage', 'door', 'css', 'nested', 'app.js'), 'utf8'),
    ).toBe('ok');
    const tree = await staticProvider.getFolderFiles('/door');
    expect(flattenTree(tree).sort()).toEqual(['css/nested/app.js', 'css/style.css']);
  });

  it('deletes an uploaded file from that page', async () => {
    await staticProvider.upload(
      { buffer: Buffer.from('keep'), originalname: 'keep.html' },
      'customPage',
      false,
      '/door',
    );
    await staticProvider.upload(
      { buffer: Buffer.from('gone'), originalname: 'css/gone.css' },
      'customPage',
      false,
      '/door',
    );
    await staticProvider.deleteCustomPageFile('/door', 'css/gone.css');
    expect(fs.existsSync(path.join(tmp, 'customPage', 'door', 'css', 'gone.css'))).toBe(false);
    expect(fs.readFileSync(path.join(tmp, 'customPage', 'door', 'keep.html'), 'utf8')).toBe(
      'keep',
    );
    expect(flattenTree(await staticProvider.getFolderFiles('/door'))).toEqual(['keep.html']);
  });

  it('does not write into another custom page folder (single-file pages stay intact)', async () => {
    const other = path.join(tmp, 'customPage', 'about', 'index.html');
    fs.mkdirSync(path.dirname(other), { recursive: true });
    fs.writeFileSync(other, '<p>single</p>');
    await staticProvider.upload(
      { buffer: Buffer.from('<p>multi</p>'), originalname: 'index.html' },
      'customPage',
      false,
      '/door',
    );
    expect(fs.readFileSync(other, 'utf8')).toBe('<p>single</p>');
    expect(fs.readFileSync(path.join(tmp, 'customPage', 'door', 'index.html'), 'utf8')).toBe(
      '<p>multi</p>',
    );
  });

  it('rejects path traversal on upload and delete', () => {
    expect(() => normalizeCustomPageRel('/door', '../secret')).toThrow(ForbiddenException);
    expect(() => resolveCustomPageAbs('/door', '../../etc/passwd')).toThrow(ForbiddenException);
    return expect(staticProvider.deleteCustomPageFile('/door', '../secret')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });
});
