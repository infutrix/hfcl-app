import apiCms from "../api/http-client-cms"
import type { BatchRes } from "../types/batch"

export default class Batch {
  static async getAll(): Promise<BatchRes[]> {
    return await apiCms.get("/batches")
  }
}
