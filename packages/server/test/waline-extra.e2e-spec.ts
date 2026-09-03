import { spawnSync } from 'node:child_process';
import { PublicController } from '../src/controller/public/public.controller';
import { SettingProvider } from '../src/provider/setting/setting.provider';
import { WalineProvider } from '../src/provider/waline/waline.provider';

/**
 * End-to-end of #139: admin extra Waline JSON must reach the Waline server
 * process env (IPQPS) and the public comment-setting payload used by
 * @waline/client (imageUploader: false).
 */
function createMemorySettingModel(initial: any[] = []) {
  const docs = initial.map((item) => ({ ...item }));
  const findMatching = (query: any) => docs.find((item) => item.type === query?.type) || null;
  return {
    docs,
    findOne: jest.fn((query: any) => ({
      exec: async () => findMatching(query),
    })),
    create: jest.fn(async (doc: any) => {
      const created = { ...doc };
      docs.push(created);
      return created;
    }),
    updateOne: jest.fn(async (query: any, patch: any) => {
      const target = findMatching(query);
      if (target) {
        Object.assign(target, patch);
      }
      return { acknowledged: true, matchedCount: target ? 1 : 0, modifiedCount: target ? 1 : 0 };
    }),
  };
}

function createPublicController(settingProvider: SettingProvider) {
  return new PublicController(
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    {} as any,
    settingProvider,
    {} as any,
  );
}

describe('waline extra options (e2e #139)', () => {
  it('admin extra JSON reaches Waline server env and public client config', async () => {
    const model = createMemorySettingModel();
    const settingProvider = new SettingProvider(model as any, {} as any, {} as any);
    const walineProvider = new WalineProvider({} as any, settingProvider);

    await settingProvider.updateWalineSetting({
      forceLoginComment: false,
      otherConfig: JSON.stringify({ imageUploader: false, IPQPS: 60 }),
    } as any);
    const saved = await settingProvider.getWalineSetting();
    expect(saved.otherConfig).toContain('imageUploader');

    const env = walineProvider.mapConfig2Env(saved);
    expect(env.IPQPS).toBe('60');
    expect(env.imageUploader).toBe('false');
    expect(env.LOGIN).toBeUndefined();

    const child = spawnSync(
      process.execPath,
      [
        '-e',
        'process.stdout.write(JSON.stringify({ IPQPS: process.env.IPQPS, imageUploader: process.env.imageUploader, LOGIN: process.env.LOGIN }))',
      ],
      { env: { ...process.env, ...env }, encoding: 'utf8' },
    );
    expect(child.status).toBe(0);
    const echoed = JSON.parse(child.stdout);
    expect(echoed.IPQPS).toBe('60');
    expect(echoed.imageUploader).toBe('false');

    const controller = createPublicController(settingProvider);
    const publicSetting = await controller.getCommentSetting();
    expect(publicSetting.statusCode).toBe(200);
    expect(publicSetting.data.forceLoginComment).toBe(false);
    expect(publicSetting.data.imageUploader).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(publicSetting.data, 'imageUploader')).toBe(true);
    expect(publicSetting.data).not.toHaveProperty('IPQPS');
  });

  it('coerces string false and does not regress force-login or Atlas-unrelated LOGIN mapping', async () => {
    const model = createMemorySettingModel();
    const settingProvider = new SettingProvider(model as any, {} as any, {} as any);
    const walineProvider = new WalineProvider({} as any, settingProvider);

    await settingProvider.updateWalineSetting({
      forceLoginComment: true,
      otherConfig: JSON.stringify({ imageUploader: 'false', IPQPS: 1, LOGIN: 'enable' }),
    } as any);
    const saved = await settingProvider.getWalineSetting();
    expect(saved.forceLoginComment).toBe(true);

    const env = walineProvider.mapConfig2Env(saved);
    expect(env.LOGIN).toBe('force');
    expect(env.IPQPS).toBe('1');
    expect(env.imageUploader).toBe('false');

    const controller = createPublicController(settingProvider);
    const publicSetting = await controller.getCommentSetting();
    expect(publicSetting.data.forceLoginComment).toBe(true);
    expect(publicSetting.data.imageUploader).toBe(false);
  });
});
