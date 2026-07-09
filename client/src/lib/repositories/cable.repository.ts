import apiCms from "../api/http-client-cms"
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

  static async saveBatchCableProfileLink(data: BatchCableProfileLinkPayload): Promise<BatchCableProfileLinkResponse> {
    return await apiCms.post("/batch-cable-profiles", data)
  }

  static async saveBatchCablePhysicalParameters(data: Partial<BatchCablePhysicalParametersPayload>): Promise<void> {
    return await apiCms.post("/batch-physical-params", data)
  }

  static async getBatchFiberTestingData(batchCableProfileLinkId: number): Promise<BatchFiberTestingData> {
    return await apiCms.get(`/batch-fiber-testing/saved/${batchCableProfileLinkId}`)
  }

  static async saveBatchFiberTestingData(data: SaveBatchFiberTestingDataPayload): Promise<void> {
    const { fibre_id, ...payload } = data
    await apiCms.put(`/batch-fiber-testing/${fibre_id}`, payload)
  }

  static async getAllVerniers(): Promise<VernierResponse[]> {
    return await apiCms.get("/vernier-nos")
  }
}
