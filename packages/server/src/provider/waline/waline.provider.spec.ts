import { WalineProvider } from './waline.provider';

describe('WalineProvider.mapConfig2Env', () => {
  const provider = new WalineProvider({} as any, {} as any);

  it('sets LOGIN=force when forceLoginComment is boolean true', () => {
    expect(provider.mapConfig2Env({ forceLoginComment: true } as any)).toEqual(
      expect.objectContaining({ LOGIN: 'force' }),
    );
  });

  it('sets LOGIN=force when Ant Design persists the string "true"', () => {
    expect(provider.mapConfig2Env({ forceLoginComment: 'true' } as any)).toEqual(
      expect.objectContaining({ LOGIN: 'force' }),
    );
  });

  it('does not force login when the toggle is off', () => {
    expect(provider.mapConfig2Env({ forceLoginComment: false } as any).LOGIN).toBeUndefined();
    expect(provider.mapConfig2Env({ forceLoginComment: 'false' } as any).LOGIN).toBeUndefined();
  });

  it('lets the admin toggle override otherConfig LOGIN', () => {
    const env = provider.mapConfig2Env({
      forceLoginComment: true,
      otherConfig: JSON.stringify({ LOGIN: 'enable' }),
    } as any);
    expect(env.LOGIN).toBe('force');
  });

  it('forwards extra admin JSON to Waline server env as strings (#139)', () => {
    const env = provider.mapConfig2Env({
      forceLoginComment: false,
      otherConfig: JSON.stringify({ imageUploader: false, IPQPS: 60 }),
    } as any);
    expect(env.IPQPS).toBe('60');
    expect(typeof env.IPQPS).toBe('string');
    expect(env.imageUploader).toBe('false');
    expect(Object.prototype.hasOwnProperty.call(env, 'imageUploader')).toBe(true);
  });

  it('coerces string false and still maps numeric IPQPS', () => {
    const env = provider.mapConfig2Env({
      otherConfig: JSON.stringify({ imageUploader: 'false', IPQPS: 1 }),
    } as any);
    expect(env.imageUploader).toBe('false');
    expect(env.IPQPS).toBe('1');
  });

  it('keeps webhook mapping when force login is on', () => {
    const env = provider.mapConfig2Env({
      forceLoginComment: true,
      webhook: 'https://example.com/hook',
    } as any);
    expect(env).toEqual(
      expect.objectContaining({
        LOGIN: 'force',
        WEBHOOK: 'https://example.com/hook',
      }),
    );
  });
});
