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
