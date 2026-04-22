import z from "zod"

export const CreateOtdrConnectionSchema = z.object({
  connectionType: z.enum(["connect", "disconnect"]),
})
export type CreateOtdrConnectionInput = z.infer<
  typeof CreateOtdrConnectionSchema
>

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
  image: Blob
  timeoutMs?: number
  fileName?: string
}

export type IbrColorPrediction = {
  fiber?: {
    color?: string
    confidence?: number
  }
  ribbon?: {
    markings_score?: number
  }
  strand?: {
    color?: string
    confidence?: number
  }
  status?: string
}

export type SkippyMetricsWithImageResponse = {
  message: string
  runId: string
  command: string
  otdrResponse: string
  readiness: {
    ready: boolean
    attempts: number
    raw: string
  }
  metrics: {
    loss: number | null
    ior: number | null
    length: number | null
    aCursor: number | null
    bCursor: number | null
  }
  responses: {
    loss: string
    bCursor: string
    aCursor: string
    ior: string
  }
  commands: {
    readiness: string
    loss: string
    bCursor: string
    aCursor: string
    ior: string
  }
  colorPrediction: IbrColorPrediction
  savedFiles: {
    image: string
    record: string
  }
}
