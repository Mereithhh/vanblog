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

  it('maps SMTP and mailbox fields when email is enabled (#342)', () => {
    const env = provider.mapConfig2Env({
      'smtp.enabled': true,
      'smtp.host': 'smtp.mail.example.com',
      'smtp.port': 465,
      'smtp.user': 'noreply@example.com',
      'smtp.password': 'app-password',
      'sender.name': 'Example Blog',
      'sender.email': 'noreply@example.com',
      authorEmail: 'me@example.com',
    } as any);
    expect(env).toEqual(
      expect.objectContaining({
        SMTP_HOST: 'smtp.mail.example.com',
        SMTP_PORT: '465',
        SMTP_USER: 'noreply@example.com',
        SMTP_PASS: 'app-password',
        SENDER_NAME: 'Example Blog',
        SENDER_EMAIL: 'noreply@example.com',
        AUTHOR_EMAIL: 'me@example.com',
      }),
    );
  });

  it('omits SMTP sender env when email is disabled, but keeps authorEmail', () => {
    const env = provider.mapConfig2Env({
      'smtp.enabled': false,
      'smtp.host': 'smtp.mail.example.com',
      'smtp.port': 465,
      'smtp.user': 'noreply@example.com',
      'smtp.password': 'secret',
      'sender.name': 'Example Blog',
      'sender.email': 'noreply@example.com',
      authorEmail: 'me@example.com',
      webhook: 'https://example.com/hook',
    } as any);
    expect(env.SMTP_HOST).toBeUndefined();
    expect(env.SMTP_PORT).toBeUndefined();
    expect(env.SMTP_USER).toBeUndefined();
    expect(env.SMTP_PASS).toBeUndefined();
    expect(env.SENDER_NAME).toBeUndefined();
    expect(env.SENDER_EMAIL).toBeUndefined();
    expect(env.AUTHOR_EMAIL).toBe('me@example.com');
    expect(env.WEBHOOK).toBe('https://example.com/hook');
  });
});
