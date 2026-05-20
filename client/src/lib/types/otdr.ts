import z from "zod"

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
  testAt: {
    "1310"?: boolean
    "1550"?: boolean
    "1625"?: boolean
  }
}

export type IbrColorPrediction = {
  fiber: {
    color: string | null
    confidence: number
  }
  ribbon: {
    markings_score: number | null
    confidence: number
  }
  strand: {
    color: string | null
    confidence: number
  }
  status: string
  validation: {
    status: string
    error: string
  }
}

export type FlatRibbonColorPrediction = {
  fiber: {
    color: string | null
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
  fiber: {
    color: string | null
    confidence: number
  }
  tube_color: {
    color: string | null
    confidence: number
  }
  fiber_markings: {
    pattern_id: number | null
    raw_detections: number
  }
  status: string
  validation: {
    status: string
    error: string
  }
}

export type SkippyMetricsWithImageResponse = {
  message: string
  runId: string
  loss: {
    "1310": number | null
    "1550": number | null
    "1625": number | null
  }
  readiness: {
    ready: boolean
    attempts: number
    raw: string
  }
  colorPrediction: IbrColorPrediction | FlatRibbonColorPrediction | MultiTubeColorPrediction
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
