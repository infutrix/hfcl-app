import axios from "axios"

const api = axios.create({
  baseURL: "http://localhost:3001",
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
    return Promise.reject(error.response?.data ?? error)
  }
)

export default api
