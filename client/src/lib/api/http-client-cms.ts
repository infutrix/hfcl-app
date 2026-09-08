import axios from "axios"
import { getMainServerBaseUrl } from "./main-server-url"

const apiCms = axios.create({
  withCredentials: true,
})

/**
 * Request interceptor
 */
apiCms.interceptors.request.use((config) => {
  // Resolved fresh on every request: the main server's LAN IP can change (DHCP),
  // so this must never be pinned to the value captured when the client loaded.
  config.baseURL = getMainServerBaseUrl()

  const isFormDataPayload = typeof FormData !== "undefined" && config.data instanceof FormData

  if (isFormDataPayload) {
    return config
  }

  config.headers = config.headers ?? {}
  config.headers["Content-Type"] ??= "application/json"
  try {
    const token = localStorage.getItem("hfcl_access_token")
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`
    }
  } catch {}
  return config
}, Promise.reject)

/**
 * Response interceptor
 */
apiCms.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "Unauthorized" &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        localStorage.removeItem("hfcl_access_token")
      } catch {}
      window.location.href = "/"
      return Promise.reject(error.response?.data ?? error)
    }

    return Promise.reject(error.response?.data ?? error)
  }
)

export default apiCms
