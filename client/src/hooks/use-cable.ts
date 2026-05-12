import Cable from "@/lib/repositories/cable.repository"
import type { Batch } from "@/lib/types/cable"
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
