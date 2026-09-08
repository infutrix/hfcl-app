import axios from "axios"
import { LOCAL_SERVER_BASE_URL } from "./config"

const api = axios.create({
  baseURL: LOCAL_SERVER_BASE_URL,
  withCredentials: true,
})

/**
 * Request interceptor
 */
api.interceptors.request.use((config) => {
  const isFormDataPayload = typeof FormData !== "undefined" && config.data instanceof FormData

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
