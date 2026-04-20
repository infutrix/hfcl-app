import { z } from "zod"
import type { UserRoles } from "./common"

export const LoginSchema = z.object({
  username: z.string().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
})

export type LoginInput = z.infer<typeof LoginSchema>

export type LoginResponse = {
  role: UserRoles
}

export type MeResponse = {
  id: string
  name: string
  username: string
  avatarUrl?: string
}
