import { useMutation, useQuery } from "@tanstack/react-query"
import Notify from "@/lib/notification"
import type { ApiErrorResponse } from "@/lib/types/common"
import type {
  CreateOtdrConnectionInput,
  OtdrConnesctionResponse,
  RunSkippyMetricsWithImageInput,
  SendSkippyCommandInput,
  SkippyMetricsWithImageResponse,
  SkippyCommandResponse,
} from "@/lib/types/otdr"
import Otdr from "@/lib/repositories/otdr.repository"

export const useConnectOtdr = () => {
  return useMutation<
    OtdrConnesctionResponse,
    ApiErrorResponse,
    CreateOtdrConnectionInput
  >({
    mutationFn: Otdr.connect,
    onSuccess: (res) => {
      Notify.success(res.message)
      // Handle successful connection
    },
    onError: (error) => {
      Notify.error(error.message)
    },
  })
}

export const useSendSkippyCommand = () => {
  return useMutation<
    SkippyCommandResponse,
    ApiErrorResponse,
    SendSkippyCommandInput
  >({
    mutationFn: Otdr.runSkippy,
    onError: (error) => {
      Notify.error(error.message)
    },
  })
}

export const useRunSkippyMetricsWithImage = () => {
  return useMutation<
    SkippyMetricsWithImageResponse,
    ApiErrorResponse,
    RunSkippyMetricsWithImageInput
  >({
    mutationFn: Otdr.runSkippyMetricsWithImage,
    onSuccess: (res) => {
      Notify.success(res.message)
    },
    onError: (error) => {
      Notify.error(error.message)
    },
  })
}

export const useGetOtdrConnectionStatus = () => {
  return useQuery<OtdrConnesctionResponse["status"], ApiErrorResponse>({
    queryFn: Otdr.getConnectionStatus,
    queryKey: ["otdr-connection-status"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
