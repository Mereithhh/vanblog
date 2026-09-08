/** Nest listen port; same as the previous hardcoded `app.listen(3000)`. */
export const DEFAULT_LISTEN_PORT = 3000;

export type ListenAddress = {
  port: number;
  /**
   * When omitted, call `app.listen(port)` without a hostname so Node keeps
   * today's default (all interfaces).
   */
  host?: string;
};

/**
 * Resolve the Nest bind host from `VAN_BLOG_LISTEN_HOST` / `listen.host`.
 * Missing, empty, or whitespace values keep all-interfaces behavior.
 */
export function resolveListenHost(raw?: string | null): string | undefined {
  if (raw == null) {
    return undefined;
  }
  const host = String(raw).trim();
  return host === '' ? undefined : host;
}

export function resolveListenAddress(
  rawHost?: string | null,
  port = DEFAULT_LISTEN_PORT,
): ListenAddress {
  const host = resolveListenHost(rawHost);
  return host ? { port, host } : { port };
}

export function formatListenTarget(addr: ListenAddress): string {
  return addr.host ? `${addr.host}:${addr.port}` : `*:${addr.port}`;
}
