import apiCms from "../api/http-client-cms"
import type { Batch, CableProfile, SfgStage } from "../types/cable"

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
}
