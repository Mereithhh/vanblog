/** Nest API listen port. Unchanged from the previous hardcoded value. */
export const DEFAULT_SERVER_PORT = 3000;

export type ListenTarget = {
  port: number;
  /** Omitted when unset so Node/Nest keep listening on all interfaces. */
  host?: string;
};

/**
 * Listen address for `app.listen(port[, host])`.
 * Empty / whitespace keeps today's default (all interfaces).
 * Set to `127.0.0.1` so only a same-host reverse proxy can connect.
 */
export function resolveListenHost(raw: unknown): string | undefined {
  if (raw == null) {
    return undefined;
  }
  const host = String(raw).trim();
  return host === '' ? undefined : host;
}

export function getListenTarget(port: number, rawHost?: unknown): ListenTarget {
  const host = resolveListenHost(rawHost);
  return host ? { port, host } : { port };
}
