import {
  buildWalineMongoEnv,
  buildWalineMongoUrl,
  isAtlasStyleMongoHost,
  resolveWalineMongoAuthSource,
} from './walineMongo';

function makeMongoUrl(options: {
  protocol?: 'mongodb:' | 'mongodb+srv:';
  hostname: string;
  port?: string;
  db?: string;
  authSource?: string;
  extraQuery?: Record<string, string>;
}): string {
  const protocol = options.protocol || 'mongodb:';
  const url = new URL(`${protocol}//placeholder/${options.db || 'vanBlog'}`);
  url.hostname = options.hostname;
  if (options.port) {
    url.port = options.port;
  }
  if (options.authSource) {
    url.searchParams.set('authSource', options.authSource);
  }
  if (options.extraQuery) {
    for (const [key, value] of Object.entries(options.extraQuery)) {
      url.searchParams.set(key, value);
    }
  }
  return url.toString();
}

describe('walineMongo', () => {
  const localDockerUrl = makeMongoUrl({
    hostname: 'mongo',
    port: '27017',
    authSource: 'admin',
  });

  it('keeps authSource=admin for the default local docker-compose URL', () => {
    const env = buildWalineMongoEnv(localDockerUrl, 'waline');
    expect(env.MONGO_HOST).toBe('mongo');
    expect(env.MONGO_PORT).toBe('27017');
    expect(env.MONGO_DB).toBe('waline');
    expect(env.MONGO_AUTHSOURCE).toBe('admin');
    expect(buildWalineMongoUrl(env)).toBe(
      ['mongodb://', 'mongo', ':', '27017', '/', 'waline', '?', 'authSource=', 'admin'].join(''),
    );
  });

  it('defaults local hosts without authSource to admin', () => {
    expect(resolveWalineMongoAuthSource(makeMongoUrl({ hostname: 'mongo', port: '27017' }))).toBe(
      'admin',
    );
    expect(
      buildWalineMongoUrl(
        buildWalineMongoEnv(makeMongoUrl({ hostname: 'localhost', port: '27017' }), 'waline'),
      ),
    ).toBe(['mongodb://', 'localhost', ':', '27017', '/', 'waline', '?', 'authSource=', 'admin'].join(''));
  });

  it('does not force authSource=admin on a custom Atlas URL (#493)', () => {
    const env = buildWalineMongoEnv(
      makeMongoUrl({
        hostname: 'xxxxxxxx.mongodb.net',
        port: '27017',
      }),
      'waline',
    );
    expect(env.MONGO_AUTHSOURCE).toBeUndefined();
    expect(isAtlasStyleMongoHost(env.MONGO_HOST)).toBe(true);

    const constructed = buildWalineMongoUrl(env);
    expect(constructed).toBe(
      ['mongodb://', 'xxxxxxxx.mongodb.net', ':', '27017', '/', 'waline'].join(''),
    );
    expect(constructed.includes('authSource=admin')).toBe(false);
    expect(constructed.includes('authSource=')).toBe(false);
  });

  it('does not force authSource=admin on mongodb+srv Atlas URLs', () => {
    const env = buildWalineMongoEnv(
      makeMongoUrl({
        protocol: 'mongodb+srv:',
        hostname: 'cluster0.abcde.mongodb.net',
        extraQuery: { retryWrites: 'true', w: 'majority' },
      }),
      'waline',
    );
    expect(env.MONGO_HOST).toBe('cluster0.abcde.mongodb.net');
    expect(env.MONGO_AUTHSOURCE).toBeUndefined();
    expect(buildWalineMongoUrl(env).includes('authSource=admin')).toBe(false);
  });

  it('honors an explicit authSource from a custom URL', () => {
    const env = buildWalineMongoEnv(
      makeMongoUrl({
        hostname: 'db.example.com',
        port: '27017',
        authSource: 'vanBlog',
      }),
      'waline',
    );
    expect(env.MONGO_AUTHSOURCE).toBe('vanBlog');
    expect(buildWalineMongoUrl(env)).toBe(
      [
        'mongodb://',
        'db.example.com',
        ':',
        '27017',
        '/',
        'waline',
        '?',
        'authSource=',
        'vanBlog',
      ].join(''),
    );
  });

  it('honors explicit authSource=admin on Atlas when the user set it', () => {
    const env = buildWalineMongoEnv(
      makeMongoUrl({
        hostname: 'xxxxxxxx.mongodb.net',
        port: '27017',
        authSource: 'admin',
      }),
      'waline',
    );
    expect(env.MONGO_AUTHSOURCE).toBe('admin');
  });
});
