import api from "../api/http-client"
import apiCms from "../api/http-client-cms"
import type {
  CreateOtdrConnectionInput,
  OtdrConnesctionResponse,
  RunSkippyMetricsWithImageInput,
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

  static async runSkippyLengthAndIor(data: RunSkippyLengthAndIorInput): Promise<SkippyLengthAndIorResponse> {
    return await api.post("/otdr/commands/skippy/length-and-ior", data)
  }

  static async getAllOtdrDevices(): Promise<OtdrDevice[]> {
    return await apiCms.get("/otdr-devices")
  }
}
