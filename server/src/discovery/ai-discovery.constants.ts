/**
 * AI server discovery has its own configuration namespace — it intentionally
 * does not share the main server's secret, port, or timeouts.
 */
export const AI_DISCOVERY_DEFAULTS = {
  ENABLED: true,
  PORT: 41235,
  SERVER_TIMEOUT_MS: 10000,
  MAX_TIMESTAMP_AGE_MS: 15000,
  PROTOCOL_VERSION: 1,
} as const;

export const AI_DISCOVERY_MESSAGE_TYPE = 'HFCL_AI_SERVER' as const;

/** Used while no fresh, signed UDP broadcast from the AI server is available. */
export const AI_SERVER_FALLBACK_URL =
  process.env.HFCL_AI_SERVER_FALLBACK_URL ?? 'http://172.20.170.95:8000';

export const AI_DISCOVERY_ENABLED =
  (process.env.HFCL_AI_DISCOVERY_ENABLED ??
    String(AI_DISCOVERY_DEFAULTS.ENABLED)) !== 'false';

export const AI_DISCOVERY_PORT = Number(
  process.env.HFCL_AI_DISCOVERY_PORT ?? AI_DISCOVERY_DEFAULTS.PORT,
);

export const AI_SERVER_OFFLINE_TIMEOUT_MS = Number(
  process.env.HFCL_AI_SERVER_TIMEOUT_MS ??
    AI_DISCOVERY_DEFAULTS.SERVER_TIMEOUT_MS,
);

export const AI_DISCOVERY_MAX_TIMESTAMP_AGE_MS = Number(
  process.env.HFCL_AI_DISCOVERY_MAX_TIMESTAMP_AGE_MS ??
    AI_DISCOVERY_DEFAULTS.MAX_TIMESTAMP_AGE_MS,
);

export const AI_DISCOVERY_PROTOCOL_VERSION = Number(
  process.env.HFCL_AI_DISCOVERY_PROTOCOL_VERSION ??
    AI_DISCOVERY_DEFAULTS.PROTOCOL_VERSION,
);
