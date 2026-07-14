import { Clock3, LoaderCircle, CheckCircle2, Play } from "lucide-react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGetOperatorBatches, useGetOperatorDashboardStats } from "@/hooks/use-cable"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { useMe } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

export default function BatchesDashboard() {
  const { data: currentUser, isLoading: isUserLoading } = useMe()
  const { data: stats, isLoading: isStatsLoading } = useGetOperatorDashboardStats()
  const { data: batches, isLoading: isBatchesLoading } = useGetOperatorBatches()

  if (isStatsLoading || isBatchesLoading || isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoaderCircle className="h-10 w-10 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col">
        <div className="space-y-6 p-6">
          {/* welcome note */}
          <div>
            <h1 className="text-2xl font-bold">
              Hai{" "}
              <span className="underline">
                {currentUser?.first_name} {currentUser?.last_name}
              </span>
              👋
            </h1>
            <Badge className="bg-green-600 text-xs">{currentUser?.userRole.role}</Badge>
          </div>
          {/* Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>

                <Clock3 className="h-5 w-5 text-yellow-500" />
              </CardHeader>

              <CardContent>
                <div className="text-4xl font-bold">{stats?.pending_count}</div>

                <p className="mt-1 text-sm text-muted-foreground">Waiting to start</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>

                <LoaderCircle className="h-5 w-5 animate-spin text-blue-500" />
              </CardHeader>

              <CardContent>
                <div className="text-4xl font-bold">{stats?.in_progress_count}</div>

                <p className="mt-1 text-sm text-muted-foreground">Currently processing</p>
              </CardContent>
            </Card>

            <Card className="border-green-200">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>

                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </CardHeader>

              <CardContent>
                <div className="text-4xl font-bold">{stats?.completed_count}</div>

                <p className="mt-1 text-sm text-muted-foreground">Successfully finished</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle className="font-bold">Batches</CardTitle>
            </CardHeader>

            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>S.no.</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created At Date</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {batches?.map((batch, id) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-medium">{batch.id}</TableCell>

                      <TableCell>{batch.batch_name}</TableCell>
                      <TableCell>{batch.status}</TableCell>

                      <TableCell>
                        {format(batch.created_at, "yyyy-MM-dd")}{" "}
                        <span className="rounded bg-yellow-100 px-2 py-1 text-yellow-800">
                          {format(batch.created_at, "hh:mm:ss a")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={{
                            pathname: "/qa-dashboard",
                            search: `?batch_id=${batch.id}&sfg_stage_id=${batch.sfg_stage.id}&profile_id=${batch.cable_profile.id}&otdr_id=${batch.otdr_device.id}`,
                          }}
                        >
                          <Button size="sm">
                            Start Working <Play />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
