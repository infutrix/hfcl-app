export const DISCOVERY_UDP_PORT = 41234;

export const DISCOVERY_MESSAGE_TYPE = 'HFCL_MAIN_SERVER' as const;

export const DISCOVERY_PROTOCOL_VERSION = 1;

/**
 * Manually configured main server URL, used while no fresh, signed UDP
 * broadcast from the main server is available. Read lazily because in dev
 * ConfigModule loads server/.env after this module has been evaluated.
 */
export function getMainServerFallbackUrl(): string | null {
  const url = process.env.HFCL_MAIN_SERVER_FALLBACK_URL?.trim();
  return url ? url.replace(/\/+$/, '') : null;
}

/** Main server is considered offline if no valid broadcast arrives within this window. */
export const MAIN_SERVER_OFFLINE_TIMEOUT_MS = Number(
  process.env.HFCL_DISCOVERY_TIMEOUT_MS ?? 10000,
);

/** Broadcasts older (or further in the future) than this are rejected as replay/clock-skew. */
export const MAX_TIMESTAMP_SKEW_MS = Number(
  process.env.HFCL_DISCOVERY_MAX_SKEW_MS ?? 15000,
);
