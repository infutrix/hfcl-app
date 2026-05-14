import apiCms from "../api/http-client-cms"
import type {
  Batch,
  BatchCableProfileLinkPayload,
  BatchCableProfileLinkResponse,
  BatchFiberTestingData,
  CableProfile,
  SfgStage,
} from "../types/cable"

export default class Cable {
  static async getAllBatches(): Promise<Batch[]> {
    return await apiCms.get("/batches")
  }

  static async getAllSfgStages(): Promise<SfgStage[]> {
    return await apiCms.get("/sfg-stages")
  }

  static async getAllCableProfiles(): Promise<CableProfile[]> {
    return await apiCms.get("/cable-profiles")
  }

  static async saveBatchCableProfileLink(
    data: BatchCableProfileLinkPayload
  ): Promise<BatchCableProfileLinkResponse> {
    return await apiCms.post("/batch-cable-profiles", data)
  }

  static async getBatchFiberTestingData(
    batchCableProfileLinkId: number
  ): Promise<BatchFiberTestingData> {
    return await apiCms.get(
      `/batch-fiber-testing/saved/${batchCableProfileLinkId}`
    )
  }
}
