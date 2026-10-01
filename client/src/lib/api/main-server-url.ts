import axios from "axios"
import { LOCAL_SERVER_BASE_URL } from "./config"

/** This machine's own small server (see server/src/discovery), which tracks the discovered main server. */
const POLL_INTERVAL_MS = 5000

let currentBaseUrl: string | null = null

interface DiscoveryStatus {
  url: string | null
  available: boolean
  /** True when `url` is the server's manual HFCL_MAIN_SERVER_FALLBACK_URL rather than a discovered one. */
  fallback?: boolean
  lastSeenAt: number | null
}

async function refreshMainServerUrl() {
  try {
    const { data } = await axios.get<DiscoveryStatus>(`${LOCAL_SERVER_BASE_URL}/discovery/main-server`, {
      timeout: 2000,
    })
    // The local server only returns a url when discovered or a fallback is configured.
    currentBaseUrl = data.url || null
  } catch {
    currentBaseUrl = null
  }
}

/**
 * Returns the discovered main server URL, or the local server's manually
 * configured HFCL_MAIN_SERVER_FALLBACK_URL. Throws if neither is available —
 * callers must handle this as a genuine "unavailable" state.
 */
export function getMainServerBaseUrl(): string {
  if (!currentBaseUrl) {
    throw new Error(
      "Main server has not been discovered on the local network yet and no fallback URL (HFCL_MAIN_SERVER_FALLBACK_URL) is configured."
    )
  }
  return currentBaseUrl
}

void refreshMainServerUrl()
setInterval(refreshMainServerUrl, POLL_INTERVAL_MS)
