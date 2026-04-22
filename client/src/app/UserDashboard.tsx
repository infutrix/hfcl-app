import { useMemo } from "react"
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
  useConnectOtdr,
  useGetOtdrConnectionStatus,
  useRunSkippyMetricsWithImage,
} from "@/hooks/use-otdr"

export default function UserDashboard() {
  const connectOtdr = useConnectOtdr()
  const runSkippyMetricsWithImage = useRunSkippyMetricsWithImage()
  const {
    data: otdrStatus,
    isLoading: isStatusLoading,
    refetch: refetchOtdrStatus,
  } = useGetOtdrConnectionStatus()

  const handleStartTesting = async () => {
    await runSkippyMetricsWithImage.mutateAsync({})
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
          <CardTitle>Image Source</CardTitle>
          <CardDescription>
            Test images are captured by the backend from your local Python image
            server.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md border bg-muted/20 p-4 text-sm leading-6">
            <p className="font-medium">Capture URL</p>
            <p>http://localhost:5001/capture</p>
          </div>
          <div className="rounded-md border bg-muted/20 p-4 text-sm leading-6">
            <p className="font-medium">Frontend Preview</p>
            <p>
              Disabled. No client-side camera stream or image preview is used.
            </p>
          </div>
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
