export type WalineMongoEnv = {
  MONGO_HOST: string;
  MONGO_PORT: string;
  MONGO_USER: string;
  MONGO_PASSWORD: string;
  MONGO_DB: string;
  MONGO_AUTHSOURCE?: string;
};

/**
 * Atlas connection strings usually have no authSource=admin.
 * Forcing it (the old default) makes Waline time out against Atlas.
 */
export function isAtlasStyleMongoHost(hostname: string): boolean {
  return /(^|\.)mongodb\.net$/i.test(hostname);
}

export function resolveWalineMongoAuthSource(mongoUrl: string | URL): string | undefined {
  const url = typeof mongoUrl === 'string' ? new URL(mongoUrl) : mongoUrl;
  const fromUrl = url.searchParams.get('authSource');
  if (fromUrl) {
    return fromUrl;
  }
  if (isAtlasStyleMongoHost(url.hostname)) {
    return undefined;
  }
  return 'admin';
}

export function buildWalineMongoEnv(mongoUrl: string, walineDB: string): WalineMongoEnv {
  const url = new URL(mongoUrl);
  const env: WalineMongoEnv = {
    MONGO_HOST: url.hostname,
    MONGO_PORT: url.port,
    MONGO_USER: url.username,
    MONGO_PASSWORD: url.password,
    MONGO_DB: walineDB,
  };
  const authSource = resolveWalineMongoAuthSource(url);
  if (authSource) {
    env.MONGO_AUTHSOURCE = authSource;
  }
  return env;
}

/**
 * Reconstructs the Mongo URL Waline logs from MONGO_* env vars.
 */
export function buildWalineMongoUrl(env: WalineMongoEnv): string {
  const auth =
    env.MONGO_USER || env.MONGO_PASSWORD
      ? `${env.MONGO_USER}:${env.MONGO_PASSWORD}@`
      : '';
  const hostPort = env.MONGO_PORT ? `${env.MONGO_HOST}:${env.MONGO_PORT}` : env.MONGO_HOST;
  const query = env.MONGO_AUTHSOURCE ? `?authSource=${env.MONGO_AUTHSOURCE}` : '';
  return `mongodb://${auth}${hostPort}/${env.MONGO_DB}${query}`;
}
