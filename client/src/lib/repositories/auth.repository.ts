import apiCms from "../api/http-client-cms"
import type { LoginInput, LoginResponse, MeResponse } from "../types/auth"

export default class Auth {
  static async login(data: LoginInput): Promise<LoginResponse> {
    return await apiCms.post("/auth/login", data)
  }

  static async me(): Promise<MeResponse> {
    return await apiCms.get("/auth/me")
  }
}
