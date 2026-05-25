import axios from "axios"

const apiCms = axios.create({
  baseURL: "https://hfclapi.infutrix.com",
  withCredentials: true,
})

/**
 * Request interceptor
 */
apiCms.interceptors.request.use((config) => {
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
