import Cable from "@/lib/repositories/cable.repository"
import type {
  Batch,
  BatchCablePhysicalParametersPayload,
  BatchCableProfileLinkPayload,
  BatchCableProfileLinkResponse,
  BatchFiberTestingData,
  CableProfile,
  SaveBatchFiberTestingDataPayload,
  SfgStage,
  VernierResponse,
} from "@/lib/types/cable"
import type { ApiErrorResponse } from "@/lib/types/common"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export const useGetAllBatches = () => {
  return useQuery<Batch[], ApiErrorResponse>({
    queryFn: Cable.getAllBatches,
    queryKey: ["batches"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useGetAllSfgStages = () => {
  return useQuery<SfgStage[], ApiErrorResponse>({
    queryFn: Cable.getAllSfgStages,
    queryKey: ["sfg-stages"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useGetAllCableProfiles = () => {
  return useQuery<CableProfile[], ApiErrorResponse>({
    queryFn: Cable.getAllCableProfiles,
    queryKey: ["cable-profiles"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useGetAllVerniers = () => {
  return useQuery<VernierResponse[], ApiErrorResponse>({
    queryFn: Cable.getAllVerniers,
    queryKey: ["verniers"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}

export const useGetBatchFiberTestingData = (batchCableProfileLinkId: number) => {
  return useQuery<BatchFiberTestingData, ApiErrorResponse>({
    queryFn: () => Cable.getBatchFiberTestingData(batchCableProfileLinkId),
    queryKey: ["batch-fiber-testing-data", batchCableProfileLinkId],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    enabled: !!batchCableProfileLinkId,
  })
}

export const useSaveBatchCableProfileLink = () => {
  return useMutation<BatchCableProfileLinkResponse, ApiErrorResponse, BatchCableProfileLinkPayload>({
    mutationFn: Cable.saveBatchCableProfileLink,
  })
}

export const useSaveBatchCablePhysicalParameters = () => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorResponse, Partial<BatchCablePhysicalParametersPayload>>({
    mutationFn: Cable.saveBatchCablePhysicalParameters,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["batch-fiber-testing-data"],
      })
    },
  })
}

export const useSaveBatchFiberTestingData = () => {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorResponse, SaveBatchFiberTestingDataPayload>({
    mutationFn: Cable.saveBatchFiberTestingData,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["batch-fiber-testing-data"],
      })
    },
  })
}
