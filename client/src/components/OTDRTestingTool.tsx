import React, { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Card } from "./ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table"

interface FiberLoss {
  id: number
  fiberNo: string
  tube: string
  ribbon: string
  fiberCode: string
  loss1310: number
  loss1550: number
  loss1625: number
}

interface PhysicalParam {
  [key: string]: string
}

export const OTDRTestingTool: React.FC = () => {
  const [otdrNo, setOtdrNo] = useState("OTDR-01-GN6C60S6-F905")
  const [otdrIp, setOtdrIp] = useState("192.168.1.38")
  const [otdrPort, setOtdrPort] = useState("2283")
  const [connected, setConnected] = useState(true)
  const [startTime, setStartTime] = useState("06:05:31")
  const [endTime, setEndTime] = useState("10:25:19")
  const [sfgStage, setSfgStage] = useState("FINAL SHEATHING")
  const [profile, setProfile] = useState("192F META IBR")
  const [batchId, setBatchId] = useState("2026-P0223")
  const [otdrLength, setOtdrLength] = useState("1.0745")
  const [ior, setIor] = useState("1.310 nm | 1.550 nm | 1.625 nm")

  const [physicalParams, setPhysicalParams] = useState<PhysicalParam>({
    oemLength: "",
    outerSheath: "",
    cableDia: "",
    stripability: "OK",
    visualInspection: "OK",
    upt: "OK",
    drip: "OK",
    sheathRemoval: "OK",
    tubeIdOd: "",
    fspDia: "",
    fiberSegRibbon: "OK",
    ribbonPrintQty: "OK",
    colorOfFiber: "N/A",
    vernerNo: "",
    status: "",
    ribbonFullTest: "OK",
    ribbonStiffness: "OK",
    ribbonSeparation: "OK",
  })

  const [fiberLosses] = useState<FiberLoss[]>([
    {
      id: 1,
      fiberNo: "BLUE",
      tube: "RIBBON 1",
      ribbon: "BLUE",
      fiberCode: "0.328",
      loss1310: 0.17,
      loss1550: 0.201,
      loss1625: 0,
    },
    {
      id: 2,
      fiberNo: "BLUE",
      tube: "RIBBON 1",
      ribbon: "ORANGE",
      fiberCode: "0",
      loss1310: 0,
      loss1550: 0,
      loss1625: 0,
    },
    {
      id: 3,
      fiberNo: "BLUE",
      tube: "RIBBON 1",
      ribbon: "GREEN",
      fiberCode: "0",
      loss1310: 0,
      loss1550: 0,
      loss1625: 0,
    },
    {
      id: 4,
      fiberNo: "BLUE",
      tube: "RIBBON 1",
      ribbon: "BROWN",
      fiberCode: "0",
      loss1310: 0,
      loss1550: 0,
      loss1625: 0,
    },
    {
      id: 5,
      fiberNo: "BLUE",
      tube: "RIBBON 1",
      ribbon: "SLATE",
      fiberCode: "0",
      loss1310: 0,
      loss1550: 0,
      loss1625: 0,
    },
  ])

  const updatePhysicalParam = (key: string, value: string) => {
    setPhysicalParams((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="h-screen w-full bg-gray-50 p-4">
      <div className="rounded-lg bg-white p-4 shadow-lg">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            OTDR Testing Tool
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Column */}
          <div className="col-span-3 space-y-4">
            {/* OTDR Connectivity */}
            <Card className="border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                OTDR Connectivity
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    OTDR No.
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={otdrNo}
                      onChange={(e) => setOtdrNo(e.target.value)}
                      className="h-8 text-xs"
                      placeholder="OTDR No."
                    />
                    <Button variant="outline" className="h-8 px-2 text-xs">
                      ↓
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    STD MODE
                  </label>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    OTDR IP
                  </label>
                  <Input
                    value={otdrIp}
                    onChange={(e) => setOtdrIp(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="192.168.1.38"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    OTDR Port
                  </label>
                  <Input
                    value={otdrPort}
                    onChange={(e) => setOtdrPort(e.target.value)}
                    className="h-8 text-xs"
                    placeholder="2283"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => setConnected(true)}
                    className="h-8 flex-1 bg-blue-500 text-xs hover:bg-blue-600"
                  >
                    CONNECTED
                  </Button>
                  <Button
                    variant="outline"
                    className="h-8 flex-1 text-xs"
                    onClick={() => setConnected(false)}
                  >
                    DISCONNECT
                  </Button>
                </div>
              </div>
            </Card>

            {/* Cable Design Selection */}
            <Card className="border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                Cable Design Selection
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    SFG Stage
                  </label>
                  <Select value={sfgStage} onValueChange={setSfgStage}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="FINAL SHEATHING">
                        FINAL SHEATHING
                      </SelectItem>
                      <SelectItem value="PRE-FINAL">PRE-FINAL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="h-8 w-full text-xs">
                  GET PROF
                </Button>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Profile
                  </label>
                  <Select value={profile} onValueChange={setProfile}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="192F META IBR">
                        192F META IBR
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="h-8 w-full text-xs">
                  LOAD
                </Button>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Color/Coding
                  </label>
                  <Select>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="color1">Color 1</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="h-8 w-full text-xs">
                  UPDATE
                </Button>
              </div>
            </Card>

            {/* Current Profile Under Progress */}
            <Card className="border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                Current Profile Under Progress
              </h2>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>Profile</span>
                  <span className="bg-red-100 px-2 py-1 text-red-700">
                    192F META IBR
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tube Count</span>
                  <Input value="" className="h-6 w-20 text-xs" />
                </div>
                <div className="flex justify-between">
                  <span>Customer</span>
                  <span className="bg-blue-100 px-2 py-1 text-blue-700">
                    META
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cable Type</span>
                  <span className="bg-red-100 px-2 py-1 text-red-700">
                    192F JBF OFC
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Fiber Type</span>
                  <Input value="" className="h-6 w-20 text-xs" />
                </div>
                <div className="flex justify-between">
                  <span>Cable Rib count</span>
                  <Input value="192" className="h-6 w-20 text-xs" />
                </div>
                <div className="flex justify-between">
                  <span>Color/Code</span>
                  <Input value="192" className="h-6 w-20 text-xs" />
                </div>
              </div>
            </Card>

            {/* OTDR Testing 1 */}
            <Card className="border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                OTDR Testing 1
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Batch Id
                  </label>
                  <Input
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    OTDR Length (Km)
                  </label>
                  <Input
                    value={otdrLength}
                    onChange={(e) => setOtdrLength(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    IOR
                  </label>
                  <div className="flex gap-2 text-xs">
                    <Input
                      placeholder="1310 nm"
                      className="h-8 flex-1 text-xs"
                    />
                    <Input
                      placeholder="1.550 nm"
                      className="h-8 flex-1 text-xs"
                    />
                    <Input
                      placeholder="1.625 nm"
                      className="h-8 flex-1 text-xs"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="1.466000"
                    className="h-8 flex-1 text-xs"
                  />
                  <Input
                    placeholder="1.467000"
                    className="h-8 flex-1 text-xs"
                  />
                  <Input
                    placeholder="1.470000"
                    className="h-8 flex-1 text-xs"
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded border bg-yellow-50 px-2 py-1 text-center text-xs">
                    0.300
                  </div>
                  <div className="flex-1 rounded border bg-yellow-50 px-2 py-1 text-center text-xs">
                    0.300
                  </div>
                  <div className="flex-1 rounded border bg-yellow-50 px-2 py-1 text-center text-xs">
                    0.320
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 rounded border bg-yellow-50 px-2 py-1 text-center text-xs">
                    0.300
                  </div>
                  <div className="flex-1 rounded border bg-yellow-50 px-2 py-1 text-center text-xs">
                    0.300
                  </div>
                  <div className="flex-1 rounded border bg-yellow-50 px-2 py-1 text-center text-xs">
                    0.320
                  </div>
                </div>
                <Button className="h-8 w-full bg-green-500 text-xs hover:bg-green-600">
                  TEST
                </Button>
              </div>
            </Card>
          </div>

          {/* Middle Column */}
          <div className="col-span-5 space-y-4">
            {/* Time Selection and Test Button */}
            <Card className="border border-gray-200 p-4">
              <h2 className="mb-3 text-sm font-semibold text-gray-700">
                OTDR Losses Testing
              </h2>
              <div className="mb-3 grid grid-cols-4 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Fiber No
                  </label>
                  <Input placeholder="2" className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    Start Time
                  </label>
                  <Input value={startTime} className="h-8 text-xs" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">
                    End Time
                  </label>
                  <Input value={endTime} className="h-8 text-xs" />
                </div>
                <div className="flex items-end">
                  <Button className="h-8 w-full bg-green-500 text-xs hover:bg-green-600">
                    TEST
                  </Button>
                </div>
              </div>

              {/* Fiber Loss Data Table */}
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="bg-blue-50">
                      <TableHead className="h-8 px-2 py-1 text-xs">
                        TUBE C...
                      </TableHead>
                      <TableHead className="h-8 px-2 py-1 text-xs">
                        RIBBON...
                      </TableHead>
                      <TableHead className="h-8 px-2 py-1 text-xs">
                        FIBER C...
                      </TableHead>
                      <TableHead className="h-8 px-2 py-1 text-xs">
                        1310(m)
                      </TableHead>
                      <TableHead className="h-8 px-2 py-1 text-xs">
                        1550(m)
                      </TableHead>
                      <TableHead className="h-8 px-2 py-1 text-xs">
                        1625(m)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fiberLosses.map((loss) => (
                      <TableRow
                        key={loss.id}
                        className="border-b border-gray-200"
                      >
                        <TableCell className="h-7 px-2 py-1 text-xs">
                          {loss.tube}
                        </TableCell>
                        <TableCell className="h-7 px-2 py-1 text-xs">
                          {loss.ribbon}
                        </TableCell>
                        <TableCell className="h-7 px-2 py-1 text-xs">
                          {loss.fiberCode}
                        </TableCell>
                        <TableCell className="h-7 px-2 py-1 text-xs">
                          {loss.loss1310}
                        </TableCell>
                        <TableCell className="h-7 px-2 py-1 text-xs">
                          {loss.loss1550}
                        </TableCell>
                        <TableCell className="h-7 px-2 py-1 text-xs">
                          {loss.loss1625}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Large Fiber Loss Table */}
            <Card className="max-h-96 overflow-y-auto border border-gray-200 p-4">
              <div className="overflow-x-auto">
                <Table className="text-xs">
                  <TableHeader>
                    <TableRow className="sticky top-0 bg-blue-100">
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        Fiber No
                      </TableHead>
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        Tube
                      </TableHead>
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        Ribbon
                      </TableHead>
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        Fiber Code
                      </TableHead>
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        1310(m)
                      </TableHead>
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        1550(m)
                      </TableHead>
                      <TableHead className="h-7 px-2 py-1 text-xs">
                        1625(m)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <TableRow
                        key={i}
                        className={i % 2 === 0 ? "bg-blue-50" : ""}
                      >
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          BLUE
                        </TableCell>
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          RIBBON {Math.floor(i / 12) + 1}
                        </TableCell>
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          {
                            [
                              "BLUE",
                              "ORANGE",
                              "GREEN",
                              "BROWN",
                              "SLATE",
                              "WHITE",
                              "RED",
                              "BLACK",
                              "YELLOW",
                              "VIOLET",
                              "PINK",
                              "AQUA",
                            ][i % 12]
                          }
                        </TableCell>
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          {i + 1}
                        </TableCell>
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          0.328
                        </TableCell>
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          0.178
                        </TableCell>
                        <TableCell className="h-6 px-2 py-1 text-xs">
                          0.201
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="col-span-4">
            <Card className="max-h-screen overflow-y-auto border border-gray-200 p-4">
              <h2 className="mb-4 text-sm font-semibold text-gray-700">
                Physical Parameters
              </h2>
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-medium text-gray-600">IEM</label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.oemLength}
                    onChange={(e) =>
                      updatePhysicalParam("oemLength", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    OEM/Length of SFG(m)
                  </label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.oemLength}
                    onChange={(e) =>
                      updatePhysicalParam("oemLength", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Inner Sheath (mm)
                  </label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.outerSheath}
                    onChange={(e) =>
                      updatePhysicalParam("outerSheath", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Outer Sheath (mm)
                  </label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.cableDia}
                    onChange={(e) =>
                      updatePhysicalParam("cableDia", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Cable Dia (mm)
                  </label>
                  <Select
                    value={physicalParams.stripability}
                    onValueChange={(v) =>
                      updatePhysicalParam("stripability", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Stripability/Rib Separation
                  </label>
                  <Select
                    value={physicalParams.visualInspection}
                    onValueChange={(v) =>
                      updatePhysicalParam("visualInspection", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Visual Inspection
                  </label>
                  <Select
                    value={physicalParams.upt}
                    onValueChange={(v) => updatePhysicalParam("upt", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">UPT</label>
                  <Select
                    value={physicalParams.drip}
                    onValueChange={(v) => updatePhysicalParam("drip", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Drip</label>
                  <Select
                    value={physicalParams.sheathRemoval}
                    onValueChange={(v) =>
                      updatePhysicalParam("sheathRemoval", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Sheath Removal (R/LC)
                  </label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.tubeIdOd}
                    onChange={(e) =>
                      updatePhysicalParam("tubeIdOd", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Tube ID/OD (nm)
                  </label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.fspDia}
                    onChange={(e) =>
                      updatePhysicalParam("fspDia", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    FSP Dia (nm)
                  </label>
                  <Select
                    value={physicalParams.fiberSegRibbon}
                    onValueChange={(v) =>
                      updatePhysicalParam("fiberSegRibbon", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Fiber Seg of Ribbon
                  </label>
                  <Select
                    value={physicalParams.ribbonPrintQty}
                    onValueChange={(v) =>
                      updatePhysicalParam("ribbonPrintQty", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Ribbon Print Qty
                  </label>
                  <Select
                    value={physicalParams.colorOfFiber}
                    onValueChange={(v) =>
                      updatePhysicalParam("colorOfFiber", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="N/A">N/A</SelectItem>
                      <SelectItem value="OK">OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Color of Fiber
                  </label>
                  <Input
                    placeholder=""
                    className="h-8 text-xs"
                    value={physicalParams.vernerNo}
                    onChange={(e) =>
                      updatePhysicalParam("vernerNo", e.target.value)
                    }
                  />
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Verner No.
                  </label>
                  <Select
                    value={physicalParams.status}
                    onValueChange={(v) => updatePhysicalParam("status", v)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PASS">PASS</SelectItem>
                      <SelectItem value="FAIL">FAIL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">Status</label>
                  <Select
                    value={physicalParams.ribbonFullTest}
                    onValueChange={(v) =>
                      updatePhysicalParam("ribbonFullTest", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Ribbon Full Test
                  </label>
                  <Select
                    value={physicalParams.ribbonStiffness}
                    onValueChange={(v) =>
                      updatePhysicalParam("ribbonStiffness", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Ribbon Stiffness
                  </label>
                  <Select
                    value={physicalParams.ribbonSeparation}
                    onValueChange={(v) =>
                      updatePhysicalParam("ribbonSeparation", v)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="font-medium text-gray-600">
                    Ribbon Separation
                  </label>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button className="h-8 bg-red-500 text-xs hover:bg-red-600">
                      RESTORE
                    </Button>
                    <Button className="h-8 bg-gray-500 text-xs hover:bg-gray-600">
                      TAG NO.
                    </Button>
                    <Button className="h-8 bg-blue-500 text-xs hover:bg-blue-600">
                      GET
                    </Button>
                    <Button className="h-8 bg-blue-500 text-xs hover:bg-blue-600">
                      SAVE
                    </Button>
                  </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <div className="mb-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Date</span>
                      <span className="font-medium">DATE</span>
                    </div>
                    <div className="flex justify-between">
                      <span>R.TAG</span>
                      <span className="font-medium">TAG ID</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span>Opt. Len(Km)</span>
                      <span className="font-medium">OPT_LEN</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Status</span>
                      <span className="font-medium">STATUS</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs">
                    <span>Operator</span>
                    <Input placeholder="OPTER" className="mt-1 h-8 text-xs" />
                  </div>
                  <Button className="mt-3 h-8 w-full bg-green-500 text-xs hover:bg-green-600">
                    PRINT
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer/Remarks */}
        <div className="mt-4">
          <label className="text-xs font-medium text-gray-600">Remarks</label>
          <textarea
            className="w-full rounded border border-gray-200 px-3 py-2 text-xs"
            rows={2}
            placeholder="Enter remarks..."
          />
        </div>
      </div>
    </div>
  )
}

export default OTDRTestingTool
