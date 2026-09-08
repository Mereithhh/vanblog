import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { loadConfig } from './loadConfig';
import {
  DEFAULT_SERVER_PORT,
  getListenTarget,
  resolveListenHost,
  type ListenTarget,
} from './listenHost';

function listenWithTarget(target: ListenTarget) {
  const server = createServer();
  return new Promise<typeof server>((resolve, reject) => {
    server.once('error', reject);
    if (target.host) {
      server.listen(target.port, target.host, () => resolve(server));
    } else {
      server.listen(target.port, () => resolve(server));
    }
  });
}

function closeServer(server: ReturnType<typeof createServer>) {
  return new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
}

describe('resolveListenHost / getListenTarget (#488)', () => {
  it('omits host when unset so Nest keeps listening on all interfaces', () => {
    expect(resolveListenHost(undefined)).toBeUndefined();
    expect(resolveListenHost(null)).toBeUndefined();
    expect(resolveListenHost('')).toBeUndefined();
    expect(resolveListenHost('   ')).toBeUndefined();
    expect(getListenTarget(DEFAULT_SERVER_PORT, '')).toEqual({ port: 3000 });
    expect(getListenTarget(DEFAULT_SERVER_PORT)).toEqual({ port: 3000 });
    expect(getListenTarget(DEFAULT_SERVER_PORT)).not.toHaveProperty('host');
  });

  it('loadConfig(server.host) reads VAN_BLOG_SERVER_HOST', () => {
    const prev = process.env.VAN_BLOG_SERVER_HOST;
    process.env.VAN_BLOG_SERVER_HOST = '127.0.0.1';
    try {
      expect(loadConfig('server.host', '')).toBe('127.0.0.1');
      expect(getListenTarget(DEFAULT_SERVER_PORT, loadConfig('server.host', ''))).toEqual({
        port: 3000,
        host: '127.0.0.1',
      });
    } finally {
      if (prev === undefined) {
        delete process.env.VAN_BLOG_SERVER_HOST;
      } else {
        process.env.VAN_BLOG_SERVER_HOST = prev;
      }
    }
  });

  it('trims a configured bind address such as 127.0.0.1', () => {
    expect(resolveListenHost('127.0.0.1')).toBe('127.0.0.1');
    expect(resolveListenHost(' 127.0.0.1 ')).toBe('127.0.0.1');
    expect(resolveListenHost('0.0.0.0')).toBe('0.0.0.0');
    expect(getListenTarget(3000, '127.0.0.1')).toEqual({
      port: 3000,
      host: '127.0.0.1',
    });
  });

  it('binds only to loopback when host is 127.0.0.1', async () => {
    const target = getListenTarget(0, '127.0.0.1');
    const server = await listenWithTarget(target);
    try {
      const addr = server.address() as AddressInfo;
      expect(addr.address).toBe('127.0.0.1');
      expect(addr.port).toBeGreaterThan(0);
      expect(addr.family).toMatch(/^IPv4$/);
    } finally {
      await closeServer(server);
    }
  });
});
