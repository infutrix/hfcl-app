import axios from "axios"
import Auth from "../repositories/auth.repository"

const apiCms = axios.create({
  baseURL: "http://72.60.97.5:2219",
  withCredentials: true,
})

/**
 * Request interceptor
 */
apiCms.interceptors.request.use((config) => {
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
apiCms.interceptors.response.use(
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
        return apiCms(originalRequest)
      } catch (refreshError) {
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error.response?.data ?? error)
  }
)

export default apiCms
