import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Check, EthernetPort, MonitorPlay, Printer, Save } from "lucide-react"
import { useState } from "react"
import { useGetAllOtdrDevices } from "@/hooks/use-otdr"

export default function QaDashboard() {
  const { data: otdrDevices, isPending: isOtdrDevicesPending } =
    useGetAllOtdrDevices()
  const [otdr, setOtdr] = useState("")
  const [sfgStage, setSfgStage] = useState("")
  const [cableProfile, setCableProfile] = useState("")
  const [colorCoding, setColorCoding] = useState("")
  return (
    <div className="grid grid-cols-12 gap-2 p-2">
      <div className="col-span-4 space-y-2">
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">
            OTDR Connectivity
          </h2>
          <div className="space-y-2">
            <Badge className="col-span-3 bg-green-500 text-xs">
              Connected <Check />
            </Badge>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                OTDR No.
              </label>
              <div className="col-span-8">
                <Select value={otdr} onValueChange={setOtdr}>
                  <SelectTrigger
                    disabled={isOtdrDevicesPending}
                    className="w-full"
                  >
                    <SelectValue placeholder="Select OTDR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>
                        {isOtdrDevicesPending ? "Loading..." : "OTDR Devices"}
                      </SelectLabel>
                      {otdrDevices?.map((device) => (
                        <SelectItem key={device.id} value={device.device_id}>
                          {device.device_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                OTDR IP/Port
              </label>
              <div className="col-span-5 grid grid-cols-3 gap-2">
                <Input
                  className="col-span-2"
                  placeholder="192.168.1.38"
                  value={"192.168.1.38"}
                />
                <Input
                  className="col-span-1"
                  placeholder="2283"
                  value={"2283"}
                />
              </div>
              <Button
                variant="destructive"
                className="col-span-3 h-8 w-full text-xs"
              >
                Disconnect <EthernetPort />
              </Button>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">
            Cable Design Selection
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                SFG Stage
              </label>
              <div className="col-span-8">
                <Select value={sfgStage} onValueChange={setSfgStage}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select SFG Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>SFG Stages</SelectLabel>
                      <SelectItem value="Final Sheathing">
                        Final Sheathing
                      </SelectItem>
                      <SelectItem value="Pre-final Sheathing">
                        Pre-final Sheathing
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Profile
              </label>
              <div className="col-span-8">
                <Select value={cableProfile} onValueChange={setCableProfile}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Cable Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cable Profiles</SelectLabel>
                      <SelectItem value="192F META IBR">
                        192F META IBR
                      </SelectItem>
                      <SelectItem value="193F META IBR">
                        193F META IBR
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Color/Coding
              </label>
              <div className="col-span-8">
                <Select value={colorCoding} onValueChange={setColorCoding}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Color/Coding" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Color/Coding</SelectLabel>
                      <SelectItem value="Red">Red</SelectItem>
                      <SelectItem value="Blue">Blue</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">
            Current Profile Under Progress
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Profile
              </label>
              <Input className="col-span-5" />
              <label className="col-span-2 font-medium text-foreground">
                Tube Count
              </label>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Customer
              </label>
              <Input className="col-span-5" />
              <Input className="col-span-3" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Profile
              </label>
              <Input className="col-span-5" />
              <label className="col-span-2 font-medium text-foreground">
                Rib Count/Tube
              </label>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Fiber Type
              </label>
              <Input className="col-span-5" />
              <Input className="col-span-3" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Cable Fiber Count
              </label>
              <Input className="col-span-5" />
              <label className="col-span-2 font-medium text-foreground">
                Fiber Count/Tube or Rib
              </label>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Color/Code
              </label>
              <Input className="col-span-5" />
              <Input className="col-span-3" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <div className="col-span-2" />
              <div className="col-span-2">
                <label className="col-span-2 font-medium text-foreground">
                  1310(nm)
                </label>
              </div>
              <div className="col-span-2">
                <label className="col-span-2 font-medium text-foreground">
                  1550(nm)
                </label>
              </div>
              <div className="col-span-2">
                <label className="col-span-2 font-medium text-foreground">
                  1625(nm)
                </label>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Loss (min)
              </label>
              <Input className="col-span-2" />
              <Input className="col-span-2" />
              <Input className="col-span-2" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Loss (max)
              </label>
              <Input className="col-span-2" />
              <Input className="col-span-2" />
              <Input className="col-span-2" />
            </div>
          </div>
        </Card>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">
            Current Profile Under Progress
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Batch Id
              </label>
              <Input className="col-span-3" />
              <Input className="col-span-3" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                OTDR Length (km)
              </label>
              <Input className="col-span-6" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                IOR
              </label>
              <div className="col-span-2">
                <label className="col-span-2 font-medium text-foreground">
                  1310(nm)
                </label>
              </div>
              <div className="col-span-2">
                <label className="col-span-2 font-medium text-foreground">
                  1550(nm)
                </label>
              </div>
              <div className="col-span-2">
                <label className="col-span-2 font-medium text-foreground">
                  1625(nm)
                </label>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">
                Fiber
              </label>
              <Input className="col-span-2" />
              <Input className="col-span-2" />
              <Input className="col-span-2" />
              <Button className="col-span-2 h-8 w-full text-xs">
                Test <MonitorPlay />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-span-5 space-y-2">
        <Card className="relative h-full overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">
            OTDR Losses Testing
          </h2>
          <div className="space-y-2">
            <Button className="h-8 w-full text-xs">
              Test <MonitorPlay />
            </Button>
            <div className="max-h-150 overflow-x-auto border border-muted-foreground ring-0">
              <Table className="border text-xs">
                <TableHeader>
                  <TableRow className="sticky top-0 bg-blue-100 dark:bg-blue-900">
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
                  {Array.from({ length: 40 }).map((_, i) => (
                    <TableRow
                      key={i}
                      className={
                        i % 2 === 0 ? "bg-blue-50 dark:bg-blue-950" : ""
                      }
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
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-1" />
              <label className="col-span-1 font-medium text-foreground">
                Tube ID
              </label>
              <label className="col-span-1 font-medium text-foreground">
                Tube OD
              </label>
              <label className="col-span-1 font-medium text-foreground">
                FRP
              </label>
              <label className="col-span-1 font-medium text-foreground">
                Inner
              </label>
              <label className="col-span-1 font-medium text-foreground">
                Outer
              </label>
              <label className="col-span-1 font-medium text-foreground">
                Cable Dia
              </label>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-1 font-medium text-foreground">
                (Min)
              </label>
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-1 font-medium text-foreground">
                (Max)
              </label>
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
              <Input readOnly className="col-span-1" />
            </div>
          </div>
        </Card>
      </div>
      <div className="col-span-3 space-y-2">
        <Card className="relative h-full overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">
            Physical Parameters
          </h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                IEM
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                OEM/Length of SFG (m)
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Inner Sheath (mm)
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Outer Sheath (mm)
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Cable Dia (mm)
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Stripability/Rib Separation
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Visual Inspection
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <div className="col-span-5 grid grid-cols-5 items-center gap-2">
                <label className="col-span-3 font-medium text-foreground">
                  WPT
                </label>
                <div className="col-span-2">
                  <Select defaultValue="OK">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="NOT OK">NOT OK</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-5 items-center gap-2">
                <label className="col-span-3 font-medium text-foreground">
                  Drip
                </label>
                <div className="col-span-2">
                  <Select defaultValue="OK">
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="OK">OK</SelectItem>
                        <SelectItem value="NOT OK">NOT OK</SelectItem>
                        <SelectItem value="N/A">N/A</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Sheath Removal (R/LC)
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Tube ID/OD (nm)
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                FRP Dia (nm)
              </label>
              <Input className="col-span-7" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Fiber Seg of Ribbon
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Ribbon Print Qty
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Color of Fiber
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Vernier No.
              </label>
              <div className="col-span-7">
                <Select defaultValue="ABC-123S">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="ABC-123S">ABC-123S</SelectItem>
                      <SelectItem value="DEF-456T">DEF-456T</SelectItem>
                      <SelectItem value="GHI-789U">GHI-789U</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Ribbon Rub Test
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Ribbon Stiffness
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Ribbon Separation
              </label>
              <div className="col-span-7">
                <Select defaultValue="OK">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="OK">OK</SelectItem>
                      <SelectItem value="NOT OK">NOT OK</SelectItem>
                      <SelectItem value="N/A">N/A</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">
                Status
              </label>
              <div className="col-span-7">
                <Select defaultValue="PASS">
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="PASS">PASS</SelectItem>
                      <SelectItem value="FAIL">PENDING</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 items-center gap-2">
              <Button
                variant="default"
                className="col-span-1 h-8 w-full text-xs"
              >
                Save Results <Save />
              </Button>
              <Button
                variant="secondary"
                disabled
                className="col-span-1 h-8 w-full text-xs"
              >
                Print Sticker <Printer />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
