import axios from "axios"
import Auth from "../repositories/auth.repository"

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
  return config
}, Promise.reject)

/**
 * Response interceptor
 */
api.interceptors.response.use(
  (response) => response.data,

  async (error) => {
    const originalRequest = error.config
    if (
      error.response?.status === 401 &&
      error.response?.data?.error === "UNAUTHORIZED" &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        await Auth.refresh()
        return api(originalRequest)
      } catch (refreshError) {
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error.response?.data ?? error)
  }
)

export default api
