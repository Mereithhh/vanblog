import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CustomPageController } from '../src/controller/admin/customPage/customPage.controller';
import { config } from '../src/config';
import { LocalProvider } from '../src/provider/static/local.provider';
import { StaticProvider } from '../src/provider/static/static.provider';
import { CustomPageProvider } from '../src/provider/customPage/customPage.provider';

/**
 * End-to-end of issue #338: multi-file custom page upload (file + folder)
 * and delete of an uploaded file. Single-file pages stay in Mongo only.
 */
function multerFile(originalname: string, content: string) {
  return {
    originalname,
    buffer: Buffer.from(content, 'utf8'),
  };
}

function createMemoryCustomPageModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => {
    if (query?.path != null) {
      return docs.find((item) => item.path === query.path) || null;
    }
    return null;
  };
  return {
    docs,
    findOne: jest.fn(async (query: any) => findMatching(query)),
    find: jest.fn(async () => docs.map((doc) => ({ ...doc }))),
    create: jest.fn(async (doc: any) => {
      const created = { _id: `cp-${docs.length + 1}`, html: '', type: 'file', ...doc };
      docs.push(created);
      return created;
    }),
    updateOne: jest.fn(async () => ({ acknowledged: true, matchedCount: 1, modifiedCount: 1 })),
    deleteOne: jest.fn(async (query: any) => {
      const idx = docs.findIndex((item) => item.path === query.path);
      if (idx >= 0) docs.splice(idx, 1);
      return { acknowledged: true, deletedCount: idx >= 0 ? 1 : 0 };
    }),
  };
}

describe('custom page multi-file upload and delete (e2e #338)', () => {
  const originalStaticPath = config.staticPath;
  let tmp: string;
  let localProvider: LocalProvider;
  let staticProvider: StaticProvider;
  let controller: CustomPageController;
  let customPageProvider: CustomPageProvider;
  let model: ReturnType<typeof createMemoryCustomPageModel>;

  beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vanblog-custom-page-e2e-'));
    config.staticPath = tmp;
    config.demo = false;
    localProvider = new LocalProvider();
    staticProvider = new StaticProvider(
      { findOne: jest.fn() } as any,
      { getStaticSetting: jest.fn().mockResolvedValue({}) } as any,
      localProvider,
      {} as any,
      {} as any,
    );
    model = createMemoryCustomPageModel([
      { _id: 'file-1', name: '关于', path: '/about', type: 'file', html: '<h1>keep me</h1>' },
      { _id: 'folder-1', name: '番茄钟', path: '/clock', type: 'folder', html: '' },
    ]);
    customPageProvider = new CustomPageProvider(model as any);
    controller = new CustomPageController(customPageProvider, staticProvider);
  });

  afterEach(() => {
    config.staticPath = originalStaticPath;
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('upload file lands under static/customPage/<path>/', async () => {
    const res = await controller.upload(multerFile('index.html', '<p>hello</p>'), '/clock', 'index.html');
    expect(res.statusCode).toBe(200);
    const written = path.join(tmp, 'customPage', 'clock', 'index.html');
    expect(fs.existsSync(written)).toBe(true);
    expect(fs.readFileSync(written, 'utf8')).toBe('<p>hello</p>');
  });

  it('upload folder keeps nested relative paths', async () => {
    await controller.upload(multerFile('style.css', 'body{}'), '/clock', 'css/style.css');
    await controller.upload(multerFile('app.js', 'console.log(1)'), '/clock', 'assets/js/app.js');
    await controller.upload(
      multerFile('index.html', '<link href="css/style.css">'),
      '/clock',
      'index.html',
    );

    expect(fs.readFileSync(path.join(tmp, 'customPage', 'clock', 'css', 'style.css'), 'utf8')).toBe(
      'body{}',
    );
    expect(
      fs.readFileSync(path.join(tmp, 'customPage', 'clock', 'assets', 'js', 'app.js'), 'utf8'),
    ).toBe('console.log(1)');
    expect(fs.existsSync(path.join(tmp, 'customPage', 'clock', 'index.html'))).toBe(true);

    const tree = await localProvider.getFolderFiles('/clock');
    const titles = JSON.stringify(tree);
    expect(titles).toContain('style.css');
    expect(titles).toContain('app.js');
    expect(titles).toContain('"key":"css/style.css"');
    expect(titles).toContain('"key":"assets/js/app.js"');
  });

  it('upload still works when name uses Windows backslashes (Win11 folder)', async () => {
    const res = await controller.upload(
      multerFile('readme.md', '# hi'),
      '/clock',
      'docs\\readme.md',
    );
    expect(res.statusCode).toBe(200);
    expect(fs.existsSync(path.join(tmp, 'customPage', 'clock', 'docs', 'readme.md'))).toBe(true);
  });

  it('delete file removes only that file and leaves siblings', async () => {
    await controller.upload(multerFile('keep.html', 'keep'), '/clock', 'keep.html');
    await controller.upload(multerFile('gone.html', 'gone'), '/clock', 'gone.html');

    const del = await controller.deleteFile('/clock', 'gone.html');
    expect(del.statusCode).toBe(200);
    expect(fs.existsSync(path.join(tmp, 'customPage', 'clock', 'gone.html'))).toBe(false);
    expect(fs.existsSync(path.join(tmp, 'customPage', 'clock', 'keep.html'))).toBe(true);
  });

  it('single-file custom page html is unchanged by folder upload/delete', async () => {
    await controller.upload(multerFile('index.html', '<p>clock</p>'), '/clock', 'index.html');
    await controller.deleteFile('/clock', 'index.html');

    const single = await customPageProvider.getCustomPageByPath('/about');
    expect(single).toMatchObject({
      path: '/about',
      type: 'file',
      html: '<h1>keep me</h1>',
    });
    expect(model.docs.find((d) => d.path === '/about')?.html).toBe('<h1>keep me</h1>');
  });
});
