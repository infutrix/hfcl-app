import Batch from "@/lib/repositories/batch.repository"
import type { BatchRes } from "@/lib/types/batch"
import type { ApiErrorResponse } from "@/lib/types/common"
import { useQuery } from "@tanstack/react-query"

export const useGetAllBatches = () => {
  return useQuery<BatchRes[], ApiErrorResponse>({
    queryFn: Batch.getAll,
    queryKey: ["batches"],
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })
}
