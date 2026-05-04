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
    onSuccess: () => {
      navigate("/dashboard", { replace: true })
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
