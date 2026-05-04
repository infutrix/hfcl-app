import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
})

/**
 * Request interceptor
 */
api.interceptors.request.use((config) => {
  const isFormDataPayload =
    typeof FormData !== "undefined" && config.data instanceof FormData

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
api.interceptors.response.use(
  (response) => response.data,

  (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true
      try {
        // clear locally stored token and force login
        localStorage.removeItem("hfcl_access_token")
      } catch {}
      window.location.href = "/login"
      return Promise.reject(error.response?.data ?? error)
    }

    return Promise.reject(error.response?.data ?? error)
  }
)

export default api
