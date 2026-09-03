import axios from 'axios';

export const VERSION_API_URL =
  process.env.VAN_BLOG_VERSION_API || 'https://api.mereith.com/vanblog/version';
export const VERSION_FETCH_TIMEOUT_MS = 1500;
export const VERSION_CACHE_TTL_MS = 60 * 60 * 1000;
export const VERSION_FAILURE_CACHE_TTL_MS = 30 * 1000;

export type RemoteVersionInfo = {
  version: string;
  updatedAt: string | Date;
};

let cache: { value: RemoteVersionInfo | null; fetchedAt: number; ttl: number } | null = null;
let inflight: Promise<RemoteVersionInfo | null> | null = null;
let cacheEpoch = 0;

export function resetVersionCache() {
  cache = null;
  inflight = null;
  cacheEpoch += 1;
}

export async function fetchVersionFromServer(): Promise<RemoteVersionInfo | null> {
  try {
    let { data } = await axios.get(VERSION_API_URL, {
      timeout: VERSION_FETCH_TIMEOUT_MS,
    });
    data = data?.data || {};
    if (!data?.version) {
      return null;
    }
    return {
      version: data.version,
      updatedAt: data?.updatedAt || data?.upadtedAt,
    };
  } catch (err) {
    return null;
  }
}

export function refreshVersionCache(): Promise<RemoteVersionInfo | null> {
  if (inflight) {
    return inflight;
  }
  const epoch = cacheEpoch;
  inflight = fetchVersionFromServer()
    .then((value) => {
      if (epoch !== cacheEpoch) {
        return cache?.value ?? null;
      }
      if (value) {
        cache = { value, fetchedAt: Date.now(), ttl: VERSION_CACHE_TTL_MS };
      } else {
        cache = {
          value: cache?.value ?? null,
          fetchedAt: Date.now(),
          ttl: VERSION_FAILURE_CACHE_TTL_MS,
        };
      }
      return cache.value;
    })
    .finally(() => {
      if (epoch === cacheEpoch) {
        inflight = null;
      }
    });
  return inflight;
}

function isCacheFresh() {
  return Boolean(cache && Date.now() - cache.fetchedAt < cache.ttl);
}

/**
 * Instant snapshot of the latest known remote version.
 * Starts a background refresh when the cache is empty or stale.
 * Never waits on the remote API.
 */
export function getCachedVersionFromServer(): RemoteVersionInfo | null {
  if (!isCacheFresh()) {
    refreshVersionCache();
  }
  return cache?.value ?? null;
}

/**
 * Same as getCachedVersionFromServer, kept as an async helper so existing
 * callers do not block the request path on the remote version API.
 */
export const getVersionFromServer = async () => getCachedVersionFromServer();
