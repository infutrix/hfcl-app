import { z } from "zod"
import type { EnitityStatus } from "./common"

export const LoginSchema = z.object({
  email: z.email("Invalid email address."),
  password: z.string().min(1, "Password is required."),
})

export const LoginFormSchema = LoginSchema.extend({
  showPassword: z.boolean(),
  keepSignedIn: z.boolean(),
})

export type LoginInput = z.infer<typeof LoginSchema>
export type LoginFormInput = z.infer<typeof LoginFormSchema>

export type LoginResponse = {
  access_token: string
  user: {
    id: number
    first_name: string
    last_name: string
    email: string
    role_id: number
    status: EnitityStatus
    created_at: string
    modified_at: string
    role_name: string
    role_identifier: string
  }
}

export type MeResponse = {
  id: number
  first_name: string
  last_name: string
  email: string
  role_id: number
  status: EnitityStatus
  created_at: string
  modified_at: string
  userRole: {
    id: number
    role: string
    identifier: string
    created_at: string
    modified_at: string
  }
}
