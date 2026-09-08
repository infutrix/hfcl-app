import axios from "axios"
import { LOCAL_SERVER_BASE_URL } from "./config"

/** This machine's own small server (see server/src/discovery), which tracks the discovered main server. */
const POLL_INTERVAL_MS = 5000

let currentBaseUrl: string | null = null

interface DiscoveryStatus {
  url: string | null
  available: boolean
  lastSeenAt: number | null
}

async function refreshMainServerUrl() {
  try {
    const { data } = await axios.get<DiscoveryStatus>(`${LOCAL_SERVER_BASE_URL}/discovery/main-server`, {
      timeout: 2000,
    })
    currentBaseUrl = data.available && data.url ? data.url : null
  } catch {
    currentBaseUrl = null
  }
}

/**
 * Throws if the main server hasn't been discovered on the LAN yet, or hasn't
 * been seen recently enough to be considered online. Never falls back to a
 * hardcoded URL — callers must handle this as a genuine "unavailable" state.
 */
export function getMainServerBaseUrl(): string {
  if (!currentBaseUrl) {
    throw new Error("Main server has not been discovered on the local network yet.")
  }
  return currentBaseUrl
}

void refreshMainServerUrl()
setInterval(refreshMainServerUrl, POLL_INTERVAL_MS)
