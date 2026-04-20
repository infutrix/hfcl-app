import api from "../api/http-client"
import type { LoginInput, LoginResponse, MeResponse } from "../types/auth"

export default class Auth {
  static async login(data: LoginInput): Promise<LoginResponse> {
    return await api.post("/auth/login", data)
  }

  static async refresh() {
    await api.post("/auth/refresh")
  }

  static async logout() {
    return await api.post("/auth/logout")
  }

  static async me(): Promise<MeResponse> {
    return await api.get("/auth/me")
  }
}
