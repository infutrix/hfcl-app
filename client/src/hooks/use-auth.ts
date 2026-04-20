import { useMutation, useQuery } from "@tanstack/react-query"
import Auth from "@/lib/repositories/auth.repository"
import Notify from "@/lib/notification"
import type { LoginResponse, LoginInput, MeResponse } from "@/lib/types/auth"
import type { ApiErrorResponse } from "@/lib/types/common"
import { useNavigate } from "react-router-dom"

export const useLogin = () => {
  const navigate = useNavigate()
  return useMutation<LoginResponse, ApiErrorResponse, LoginInput>({
    mutationFn: Auth.login,
    onSuccess: (res) => {
      switch (res.role) {
        case "ADMIN":
          navigate("/dashboard", { replace: true })
          break
        case "USER":
          navigate("/app", { replace: true })
          break
        default:
          navigate("/", { replace: true })
          break
      }
    },
    onError: (error) => {
      Notify.error(error.message)
    },
  })
}

export const useLogout = () => {
  return useMutation<unknown, ApiErrorResponse>({
    mutationFn: Auth.logout,
    onSuccess: () => {
      window.location.replace("/login")
    },
    onError: (error) => {
      Notify.error(error.message)
    },
  })
}

export const useMe = () => {
  return useQuery<MeResponse, ApiErrorResponse>({
    queryFn: Auth.me,
    queryKey: ["me"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
