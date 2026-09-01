import api from "../api/http-client"
import apiCms from "../api/http-client-cms"
import type {
  CreateOtdrConnectionInput,
  OtdrConnesctionResponse,
  RunSkippyMetricsWithImageInput,
  RunSkippyMetricsWithUploadedImageInput,
  SendSkippyCommandInput,
  SkippyMetricsWithImageResponse,
  SkippyCommandResponse,
  OtdrDevice,
  RunSkippyLengthAndIorInput,
  SkippyLengthAndIorResponse,
} from "../types/otdr"

export default class Otdr {
  static async connect(data: CreateOtdrConnectionInput): Promise<OtdrConnesctionResponse> {
    return await api.post("/otdr/connection", data)
  }

  static async getConnectionStatus(): Promise<OtdrConnesctionResponse["status"]> {
    return await api.get("/otdr/connection/status")
  }

  static async runSkippy(data: SendSkippyCommandInput): Promise<SkippyCommandResponse> {
    return await api.post("/otdr/commands/skippy", data)
  }

  static async runSkippyMetricsWithImage(
    data: RunSkippyMetricsWithImageInput
  ): Promise<SkippyMetricsWithImageResponse> {
    return await api.post("/otdr/commands/skippy/metrics-with-image", data)
  }

  /**
   * Developer-mode-only: sends a client-attached image (no camera server
   * required) to the real AI prediction server instead of a dummy response.
   */
  static async runSkippyMetricsWithUploadedImage(
    data: RunSkippyMetricsWithUploadedImageInput
  ): Promise<SkippyMetricsWithImageResponse> {
    const formData = new FormData()
    formData.append("image", data.image)
    formData.append("cableType", data.cableType)
    formData.append("testAt", JSON.stringify(data.testAt))
    if (data.timeoutMs !== undefined) {
      formData.append("timeoutMs", String(data.timeoutMs))
    }
    return await api.post("/otdr/commands/skippy/metrics-with-image/upload", formData)
  }

  static async runSkippyLengthAndIor(data: RunSkippyLengthAndIorInput): Promise<SkippyLengthAndIorResponse> {
    return await api.post("/otdr/commands/skippy/length-and-ior", data)
  }

  static async getAllOtdrDevices(): Promise<OtdrDevice[]> {
    return await apiCms.get("/otdr-devices")
  }
}
