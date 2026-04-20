import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useConnectOtdr,
  useGetOtdrConnectionStatus,
  useRunSkippyMetricsWithImage,
} from "@/hooks/use-otdr"

type CameraDevice = {
  deviceId: string
  label: string
}

export default function UserDashboard() {
  const [cameraDevices, setCameraDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const connectOtdr = useConnectOtdr()
  const runSkippyMetricsWithImage = useRunSkippyMetricsWithImage()
  const {
    data: otdrStatus,
    isLoading: isStatusLoading,
    refetch: refetchOtdrStatus,
  } = useGetOtdrConnectionStatus()

  const releaseCameraStream = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop()
      }
      streamRef.current = null
    }
  }, [])

  const loadCameraDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      return
    }

    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoInputs = devices.filter((d) => d.kind === "videoinput")

    setCameraDevices(
      videoInputs.map((device, index) => ({
        deviceId: device.deviceId,
        label: device.label || `Camera ${index + 1}`,
      }))
    )

    setSelectedDeviceId(
      (prev) => prev || (videoInputs[0] ? videoInputs[0].deviceId : "")
    )
  }, [])

  const startCameraStream = useCallback(
    async (deviceId?: string) => {
      if (!navigator.mediaDevices?.getUserMedia || !videoRef.current) {
        return
      }

      releaseCameraStream()

      const constraints: MediaStreamConstraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : true,
        audio: false,
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      videoRef.current.srcObject = stream
      await videoRef.current.play()

      await loadCameraDevices()
    },
    [loadCameraDevices, releaseCameraStream]
  )

  useEffect(() => {
    void startCameraStream()

    return () => {
      releaseCameraStream()
    }
  }, [releaseCameraStream, startCameraStream])

  useEffect(() => {
    if (!selectedDeviceId) {
      return
    }

    void startCameraStream(selectedDeviceId)
  }, [selectedDeviceId, startCameraStream])

  const captureCurrentFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) {
      throw new Error("Camera is not ready yet.")
    }

    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video.videoWidth || !video.videoHeight) {
      throw new Error("Camera frame is not available yet.")
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      throw new Error("Unable to capture camera frame.")
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageDataUrl = canvas.toDataURL("image/png")
    setCapturedImage(imageDataUrl)

    const imageBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Failed to convert captured frame to image."))
          return
        }

        resolve(blob)
      }, "image/png")
    })

    return imageBlob
  }, [])

  const handleStartTesting = async () => {
    const image = await captureCurrentFrame()
    await runSkippyMetricsWithImage.mutateAsync({
      image,
      fileName: `capture-${Date.now()}.png`,
    })
  }

  const handleConnect = async () => {
    await connectOtdr.mutateAsync({ connectionType: "connect" })
    await refetchOtdrStatus()
  }

  const handleDisconnect = async () => {
    await connectOtdr.mutateAsync({ connectionType: "disconnect" })
    await refetchOtdrStatus()
  }

  const connectionBadgeVariant = useMemo(() => {
    if (!otdrStatus) {
      return "secondary" as const
    }

    if (otdrStatus.state === "connected") {
      return "default" as const
    }

    if (otdrStatus.state === "connecting") {
      return "secondary" as const
    }

    return "destructive" as const
  }, [otdrStatus])

  const isConnected = otdrStatus?.state === "connected"

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 p-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Camera Capture</CardTitle>
          <CardDescription>
            Select camera and stream live preview.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Input Camera</p>
            <Select
              value={selectedDeviceId}
              onValueChange={(value) => {
                setSelectedDeviceId(value)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select camera" />
              </SelectTrigger>
              <SelectContent>
                {cameraDevices.map((device) => (
                  <SelectItem key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border bg-muted/20">
            <video
              autoPlay
              className="aspect-video w-full -scale-x-100 bg-black object-cover"
              muted
              playsInline
              ref={videoRef}
            />
          </div>

          {capturedImage ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Last Captured Frame</p>
              <img
                alt="Last Captured Frame"
                className="aspect-video w-full -scale-x-100 rounded-md border object-cover"
                src={capturedImage}
              />
            </div>
          ) : null}

          <canvas className="hidden" ref={canvasRef} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>OTDR Controls</CardTitle>
          <CardDescription>
            Manage OTDR connection and trigger future testing workflow.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium">Current Status:</p>
            <Badge variant={connectionBadgeVariant}>
              {isStatusLoading
                ? "Loading"
                : otdrStatus?.state
                  ? otdrStatus.state
                  : "Unknown"}
            </Badge>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              disabled={connectOtdr.isPending}
              onClick={handleConnect}
              type="button"
            >
              Connect OTDR
            </Button>
            <Button
              disabled={connectOtdr.isPending}
              onClick={handleDisconnect}
              type="button"
              variant="destructive"
            >
              Disconnect OTDR
            </Button>
          </div>

          <Button
            type="button"
            disabled={!isConnected || runSkippyMetricsWithImage.isPending}
            onClick={handleStartTesting}
            variant="secondary"
          >
            {runSkippyMetricsWithImage.isPending
              ? "Testing..."
              : "Start Testing"}
          </Button>

          {runSkippyMetricsWithImage.error ? (
            <p className="text-sm text-destructive">
              {Array.isArray(runSkippyMetricsWithImage.error.message)
                ? runSkippyMetricsWithImage.error.message.join(", ")
                : runSkippyMetricsWithImage.error.message}
            </p>
          ) : null}

          {runSkippyMetricsWithImage.data ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">Structured OTDR Response</p>
              <pre className="max-h-96 overflow-auto rounded-md border bg-muted/20 p-3 text-xs leading-5">
                {JSON.stringify(runSkippyMetricsWithImage.data, null, 2)}
              </pre>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
