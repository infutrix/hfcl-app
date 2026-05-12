import Cable from "@/lib/repositories/cable.repository"
import type { Batch, CableProfile, SfgStage } from "@/lib/types/cable"
import type { ApiErrorResponse } from "@/lib/types/common"
import { useQuery } from "@tanstack/react-query"

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
