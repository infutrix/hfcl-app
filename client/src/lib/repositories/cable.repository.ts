import apiCms from "../api/http-client-cms"
import type { Batch } from "../types/cable"

export default class Cable {
  static async getAllBatches(): Promise<Batch[]> {
    return await apiCms.get("/batches")
  }
}
