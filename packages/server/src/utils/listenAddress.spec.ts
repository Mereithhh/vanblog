import {
  DEFAULT_LISTEN_PORT,
  formatListenTarget,
  resolveListenAddress,
  resolveListenHost,
} from './listenAddress';

describe('resolveListenHost (#488)', () => {
  it('treats missing, empty, and whitespace as unset (all interfaces)', () => {
    expect(resolveListenHost(undefined)).toBeUndefined();
    expect(resolveListenHost(null)).toBeUndefined();
    expect(resolveListenHost('')).toBeUndefined();
    expect(resolveListenHost('   ')).toBeUndefined();
  });

  it('keeps an explicit bind address after trimming', () => {
    expect(resolveListenHost('127.0.0.1')).toBe('127.0.0.1');
    expect(resolveListenHost(' 127.0.0.1 ')).toBe('127.0.0.1');
    expect(resolveListenHost('localhost')).toBe('localhost');
    expect(resolveListenHost('0.0.0.0')).toBe('0.0.0.0');
    expect(resolveListenHost('::1')).toBe('::1');
  });
});

describe('resolveListenAddress (#488)', () => {
  it('defaults to port 3000 with no host (same as today)', () => {
    expect(DEFAULT_LISTEN_PORT).toBe(3000);
    expect(resolveListenAddress()).toEqual({ port: 3000 });
    expect(resolveListenAddress('')).toEqual({ port: 3000 });
    expect(resolveListenAddress('  ')).toEqual({ port: 3000 });
  });

  it('returns host + port when VAN_BLOG_LISTEN_HOST / listen.host is set', () => {
    expect(resolveListenAddress('127.0.0.1')).toEqual({
      port: 3000,
      host: '127.0.0.1',
    });
    expect(resolveListenAddress('0.0.0.0', 3000)).toEqual({
      port: 3000,
      host: '0.0.0.0',
    });
  });

  it('formats a startup label with host when bound', () => {
    expect(formatListenTarget({ port: 3000 })).toBe('*:3000');
    expect(formatListenTarget({ port: 3000, host: '127.0.0.1' })).toBe(
      '127.0.0.1:3000',
    );
  });
});
