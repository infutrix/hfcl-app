import z from "zod"
import type { CableType } from "./cable"

export type CreateOtdrConnectionInput = {
  connectionType: "connect" | "disconnect"
  developerMode?: boolean
}

export type OtdrConnesctionResponse = {
  message: string
  status: {
    state: "disconnected" | "connecting" | "connected"
    host: string
    port: number
    connectTimeoutMs: number
    commandTimeoutMs: number
  }
}

export const SendSkippyCommandSchema = z.object({
  command: z.string(),
  timeoutMs: z.number().int().min(1).max(120000).optional(),
})

export type SendSkippyCommandInput = z.infer<typeof SendSkippyCommandSchema>

export type SkippyCommandResponse = {
  command: string
  response: string
}

export type RunSkippyMetricsWithImageInput = {
  timeoutMs?: number
  developerMode?: boolean
  cableType: CableType
  testAt: {
    "1310"?: boolean
    "1550"?: boolean
    "1625"?: boolean
  }
}

export type IbrColorPrediction = {
  cableType: "IBR"
  fiber: {
    color?: string
    confidence: number
  }
  ribbon: {
    markings_score?: number
    confidence: number
  }
  strand: {
    color?: string
    confidence: number
  }
  status: string
  validation: {
    status: string
    error: string
  }
}

export type FlatRibbonColorPrediction = {
  cableType: "FLAT_RIBBON"
  fiber: {
    color?: string
    confidence: number
  }
  ribbon: {
    markings: number
    confidence: number
  }
  status: string
  validation: {
    status: string
    error: string
  }
}

export type MultiTubeColorPrediction = {
  cableType: "MULTI_TUBE"
  fiber: {
    color?: string
    confidence: number
  }
  tube_color: {
    color?: string
    confidence: number
  }
  fiber_markings: {
    pattern_id?: number
    raw_detections: number
  }
  status: string
  validation: {
    status: string
    error: string
  }
}

export type ColorPrediction = IbrColorPrediction | FlatRibbonColorPrediction | MultiTubeColorPrediction

export type SkippyMetricsWithImageResponse = {
  message: string
  runId: string
  loss: {
    "1310"?: number
    "1550"?: number
    "1625"?: number
  }
  readiness: {
    ready: boolean
    attempts: number
    raw: string
  }
  colorPrediction: ColorPrediction
  savedFiles: {
    image: string
    record: string
  }
}

export type OtdrDevice = {
  id: number
  device_name: string
  device_id: string
  ip_address: string
  port: number
  manufacturer: string
  model: string
  serial_number: string
  plant_id: number
  status: boolean
  created_at: string
  modified_at: string
  plant: {
    id: number
    plant_name: string
    location: string
    status: boolean
    created_at: string
    modified_at: string
  }
}
