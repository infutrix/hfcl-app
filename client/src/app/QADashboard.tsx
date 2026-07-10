import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ScrollContainer from "react-indiana-drag-scroll"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EthernetPort, Loader2, LogOut, MonitorPlay, Printer, Save } from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  useConnectOtdr,
  useGetAllOtdrDevices,
  useGetOtdrConnectionStatus,
  useRunSkippyMetricsWithImage,
} from "@/hooks/use-otdr"
import {
  useGetAllBatches,
  useGetAllCableProfiles,
  useGetAllSfgStages,
  useGetAllVerniers,
  useGetBatchFiberTestingData,
  useSaveBatchCablePhysicalParameters,
  useSaveBatchCableProfileLink,
  useSaveBatchFiberTestingData,
} from "@/hooks/use-cable"
import { useLogout, useMe } from "@/hooks/use-auth"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { ColorPrediction } from "@/lib/types/otdr"
import { OK_NOT_OK, type BatchCablePhysicalParametersPayload } from "@/lib/types/cable"

export default function QaDashboard() {
  // states
  const [cablePhysicalParameters, setCablePhysicalParameters] =
    useState<Partial<BatchCablePhysicalParametersPayload> | null>(null)
  const [otdr, setOtdr] = useState("")
  const [sfgStage, setSfgStage] = useState("")
  const [batch, setBatch] = useState("")
  const [cableProfile, setCableProfile] = useState("")
  const [batchCableProfileLinkId, setBatchCableProfileLinkId] = useState<number | undefined>(undefined)
  const [selectedFilters, setSelectedFilters] = useState<{
    attribute1_value?: string
    attribute2_value?: string
  }>({})
  // const [colorCoding, setColorCoding] = useState("")

  // queries
  const { data: otdrDevices, isPending: isOtdrDevicesPending } = useGetAllOtdrDevices()
  const { data: verniers, isPending: isVerniersPending } = useGetAllVerniers()
  const { data: batches, isPending: isBatchesPending } = useGetAllBatches()
  const { data: sfgStages, isPending: isSfgStagesPending } = useGetAllSfgStages()
  const { data: cableProfiles, isPending: isCableProfilesPending } = useGetAllCableProfiles()
  const { data: batchFiberTestingData, isLoading: isBatchFiberTestingDataLoading } = useGetBatchFiberTestingData(
    batchCableProfileLinkId ?? 0
  )
  const { data: otdrStatus, isLoading: isStatusLoading, refetch: refetchOtdrStatus } = useGetOtdrConnectionStatus()
  const { data: currentUser } = useMe()

  // mutations
  const { mutateAsync: saveBatchCableProfileLink, isPending: isSaveBatchCableProfileLinkPending } =
    useSaveBatchCableProfileLink()
  const { mutate: saveBatchCablePhysicalParameters, isPending: isSaveBatchCablePhysicalParametersPending } =
    useSaveBatchCablePhysicalParameters()
  const saveBatchFiberTestingData = useSaveBatchFiberTestingData()
  const connectOtdr = useConnectOtdr()
  const runSkippyMetricsWithImage = useRunSkippyMetricsWithImage()
  const handleStartTesting = async () => {
    const result = await runSkippyMetricsWithImage.mutateAsync({
      timeoutMs: 10000,
      testAt: {
        "1310": !!selectedCableProfile?.wavelength_configs.find((w) => w.wavelength === 1310),
        "1550": !!selectedCableProfile?.wavelength_configs.find((w) => w.wavelength === 1550),
        "1625": !!selectedCableProfile?.wavelength_configs.find((w) => w.wavelength === 1625),
      },
      developerMode: import.meta.env.DEV,
      cableType: selectedCableProfile?.colorProfile.cable_type || "IBR",
    })

    setSelectedFilters({
      attribute1_value: getAttribute1Value(result.colorPrediction),
      attribute2_value:
        result.colorPrediction.cableType === "IBR" ? getAttribute2Value(result.colorPrediction) : undefined,
    })
    console.log({
      a: getAttribute1Value(result.colorPrediction),
      b: getAttribute2Value(result.colorPrediction),
      c: getAttribute3Value(result.colorPrediction),
    })

    await saveBatchFiberTestingData.mutateAsync({
      fibre_id:
        batchFiberTestingData?.rows.find(
          (row) =>
            row.attribute1_value === getAttribute1Value(result.colorPrediction) &&
            row.attribute2_value === getAttribute2Value(result.colorPrediction) &&
            row.attribute3_value === getAttribute3Value(result.colorPrediction)
        )?.id || 0,
      fiber_wavelengths: [
        ...(result.loss[1310] !== undefined
          ? [
              {
                wavelength_nm: "1310",
                measured_value: result.loss[1310]?.toString() || "",
              },
            ]
          : []),
        ...(result.loss[1550] !== undefined
          ? [
              {
                wavelength_nm: "1550",
                measured_value: result.loss[1550]?.toString() || "",
              },
            ]
          : []),
        ...(result.loss[1625] !== undefined
          ? [
              {
                wavelength_nm: "1625",
                measured_value: result.loss[1625]?.toString() || "",
              },
            ]
          : []),
      ],
      ai_response: JSON.stringify(result.colorPrediction),
    })
  }
  const handleConnect = async () => {
    await connectOtdr.mutateAsync({ connectionType: "connect", developerMode: import.meta.env.DEV })
    await refetchOtdrStatus()
  }
  const handleDisconnect = async () => {
    await connectOtdr.mutateAsync({ connectionType: "disconnect", developerMode: import.meta.env.DEV })
    await refetchOtdrStatus()
  }
  const logout = useLogout()

  // derived states
  const selectedCableProfile = cableProfiles?.find((profile) => profile.id === parseInt(cableProfile))
  const selectedBatch = batches?.find((b) => b.id === parseInt(batch))

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

  const checkIfAllSelected = useMemo(
    () => otdr && sfgStage && batch && cableProfile,
    [otdr, sfgStage, batch, cableProfile]
  )

  const uniqueAttribute1_values = useMemo(() => {
    if (!batchFiberTestingData) return []
    const uniqueValues = new Set(batchFiberTestingData.rows.map((row) => row.attribute1_value))
    return Array.from(uniqueValues)
  }, [batchFiberTestingData])

  const uniqueAttribute2_values = useMemo(() => {
    if (!batchFiberTestingData) return []
    const uniqueValues = new Set(batchFiberTestingData.rows.map((row) => row.attribute2_value))
    return Array.from(uniqueValues)
  }, [batchFiberTestingData])

  const selectedFiltersFiberTestingData = useMemo(() => {
    if (!batchFiberTestingData) return null
    return {
      headers: batchFiberTestingData.headers,
      rows: batchFiberTestingData.rows.filter((row) => {
        const attribute1Match = selectedFilters.attribute1_value
          ? row.attribute1_value === selectedFilters.attribute1_value
          : true
        const attribute2Match = selectedFilters.attribute2_value
          ? row.attribute2_value === selectedFilters.attribute2_value
          : true
        return attribute1Match && attribute2Match
      }),
    }
  }, [batchFiberTestingData, selectedFilters])

  async function handleSaveBatchCableProfileLink() {
    if (checkIfAllSelected) {
      const data = await saveBatchCableProfileLink({
        batch_id: parseInt(batch),
        otdr_device_id: parseInt(otdr),
        cable_profile_id: parseInt(cableProfile),
        customer_id: selectedBatch?.customer.id || 0,
        stage_id: parseInt(sfgStage),
        drum_number: "D-001",
        fiber_type: "Single Mode",
      })
      setBatchCableProfileLinkId(data.id)
    }
  }

  function getAttribute1Value(colorPrediction: ColorPrediction) {
    if (colorPrediction.cableType === "IBR") {
      console.log(colorPrediction.strand?.color)
      return colorPrediction.strand?.color
    } else if (colorPrediction.cableType === "FLAT_RIBBON") {
      return `R${colorPrediction.ribbon?.markings}`
    } else if (colorPrediction.cableType === "MULTI_TUBE") {
      return colorPrediction.tube_color?.color
    }
  }

  function getAttribute2Value(colorPrediction: ColorPrediction) {
    if (colorPrediction.cableType === "IBR") {
      return `R${colorPrediction.ribbon?.markings_score}`
    }
    if (colorPrediction.cableType === "FLAT_RIBBON") {
      return colorPrediction.fiber?.color
    }
    if (colorPrediction.cableType === "MULTI_TUBE") {
      return colorPrediction.fiber?.color
    }
  }

  function getAttribute3Value(colorPrediction: ColorPrediction) {
    if (colorPrediction.cableType === "IBR") {
      return colorPrediction.fiber?.color
    }
    return null
  }

  // automatically save link between selected batch, cable profile, sfg stage and otdr device when any of them changes and all are selected
  useEffect(() => {
    handleSaveBatchCableProfileLink()
  }, [otdr, sfgStage, batch, cableProfile])

  // clear filters when batch changes
  useEffect(() => {
    setSelectedFilters({
      attribute1_value: undefined,
      attribute2_value: undefined,
    })
  }, [selectedCableProfile])

  // initialize selected filters to first available value (index 0) when lists load
  useEffect(() => {
    if (uniqueAttribute1_values && uniqueAttribute1_values.length && !selectedFilters.attribute1_value) {
      setSelectedFilters((prev) => ({ ...prev, attribute1_value: uniqueAttribute1_values[0] }))
    }
    if (
      uniqueAttribute2_values &&
      selectedCableProfile?.colorProfile.cable_type === "IBR" &&
      uniqueAttribute2_values.length &&
      !selectedFilters.attribute2_value
    ) {
      setSelectedFilters((prev) => ({ ...prev, attribute2_value: uniqueAttribute2_values[0] }))
    }
  }, [uniqueAttribute1_values, uniqueAttribute2_values])

  // initialize cable physical parameters when batch fiber testing data loads
  useEffect(() => {
    if (batchFiberTestingData) {
      setCablePhysicalParameters(null)
      const physicalParameters: Partial<BatchCablePhysicalParametersPayload> = {
        vernier_id: batchFiberTestingData.batch_cable_profile.physical_params?.vernier?.id,
        iem: batchFiberTestingData.batch_cable_profile.physical_params?.iem,
        oem_length_of_sfg_m: batchFiberTestingData.batch_cable_profile.physical_params?.oem_length_of_sfg_m,
        inner_sheath_mm: batchFiberTestingData.batch_cable_profile.physical_params?.inner_sheath_mm,
        outer_sheath_mm: batchFiberTestingData.batch_cable_profile.physical_params?.outer_sheath_mm,
        cable_dia_mm: batchFiberTestingData.batch_cable_profile.physical_params?.cable_dia_mm,
        tube_id_od_nm: batchFiberTestingData.batch_cable_profile.physical_params?.tube_id_od_nm,
        frp_dia_nm: batchFiberTestingData.batch_cable_profile.physical_params?.frp_dia_nm,
        stripability_rib_separation:
          batchFiberTestingData.batch_cable_profile.physical_params?.stripability_rib_separation,
        visual_inspection: batchFiberTestingData.batch_cable_profile.physical_params?.visual_inspection,
        wpt: batchFiberTestingData.batch_cable_profile.physical_params?.wpt,
        wpt_drip: batchFiberTestingData.batch_cable_profile.physical_params?.wpt_drip,
        sheath_removal_r_lc: batchFiberTestingData.batch_cable_profile.physical_params?.sheath_removal_r_lc,
        fiber_seg_of_ribbon: batchFiberTestingData.batch_cable_profile.physical_params?.fiber_seg_of_ribbon,
        ribbon_print_qty: batchFiberTestingData.batch_cable_profile.physical_params?.ribbon_print_qty,
        color_of_fiber: batchFiberTestingData.batch_cable_profile.physical_params?.color_of_fiber,
        ribbon_rub_test: batchFiberTestingData.batch_cable_profile.physical_params?.ribbon_rub_test,
        ribbon_stiffness: batchFiberTestingData.batch_cable_profile.physical_params?.ribbon_stiffness,
        ribbon_separation: batchFiberTestingData.batch_cable_profile.physical_params?.ribbon_separation,
        remark: batchFiberTestingData.batch_cable_profile.physical_params?.remark,
        status: batchFiberTestingData.batch_cable_profile.physical_params?.status,
      }
      setCablePhysicalParameters(physicalParameters)
    }
  }, [batchFiberTestingData])

  return (
    <div className="grid grid-cols-12 gap-2 px-2 py-4">
      <div className="col-span-4 space-y-2">
        <div className="mb-8 flex justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-bold">
              Hai{" "}
              <span className="underline">
                {currentUser?.first_name} {currentUser?.last_name}
              </span>
              👋
            </h1>
            <Badge className="bg-green-600 text-xs">{currentUser?.userRole.role}</Badge>
          </div>
          <Button variant="destructive" onClick={logout}>
            Logout <LogOut size={16} />
          </Button>
        </div>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">OTDR Connectivity</h2>
          <div className="space-y-2">
            <Badge variant={connectionBadgeVariant}>
              {isStatusLoading ? "Loading" : otdrStatus?.state ? otdrStatus.state : "Unknown"}
            </Badge>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">OTDR No.</label>
              <div className="col-span-8">
                <Select value={otdr} onValueChange={setOtdr}>
                  <SelectTrigger disabled={isOtdrDevicesPending} className="w-full">
                    <SelectValue placeholder="Select OTDR" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>OTDR Devices</SelectLabel>
                      {otdrDevices?.map((device, id) => (
                        <SelectItem key={id} value={device.id.toString()}>
                          {device.device_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">OTDR IP/Port</label>
              <div className="col-span-5 grid grid-cols-3 gap-2">
                <Input readOnly className="col-span-2" placeholder="192.168.1.38" value={"192.168.1.38"} />
                <Input readOnly className="col-span-1" placeholder="2283" value={"2283"} />
              </div>
              <Button
                disabled={connectOtdr.isPending}
                onClick={otdrStatus?.state === "connected" ? handleDisconnect : handleConnect}
                variant={otdrStatus?.state === "connected" ? "destructive" : "default"}
                className="col-span-3 h-8 w-full text-xs"
              >
                {otdrStatus?.state === "connected" ? "Disconnect" : "Connect"}
                <EthernetPort />
              </Button>
            </div>
          </div>
        </Card>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">Cable Design Selection</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">Batch</label>
              <div className="col-span-8">
                <Select value={batch} onValueChange={setBatch}>
                  <SelectTrigger disabled={isBatchesPending} className="w-full">
                    <SelectValue placeholder="Select Batch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Batches</SelectLabel>
                      {batches?.map((batch, id) => (
                        <SelectItem key={id} value={batch.id.toString()}>
                          {batch.batch}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">SFG Stage</label>
              <div className="col-span-8">
                <Select value={sfgStage} onValueChange={setSfgStage}>
                  <SelectTrigger disabled={isSfgStagesPending} className="w-full">
                    <SelectValue placeholder="Select SFG Stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>SFG Stages</SelectLabel>
                      {sfgStages?.map((stage, id) => (
                        <SelectItem key={id} value={stage.id.toString()}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">Profile</label>
              <div className="col-span-8">
                <Select value={cableProfile} onValueChange={setCableProfile}>
                  <SelectTrigger disabled={isCableProfilesPending} className="w-full">
                    <SelectValue placeholder="Select Cable Profile" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Cable Profiles</SelectLabel>
                      {cableProfiles?.map((profile, id) => (
                        <SelectItem key={id} value={profile.id.toString()}>
                          {profile.cable_profile_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* <div className="grid grid-cols-10 items-center gap-2">
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
            </div> */}
          </div>
        </Card>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">Current Profile Under Progress</h2>
          <div className="space-y-2">
            {selectedBatch && (
              <div className="grid grid-cols-10 items-center gap-2">
                <label className="col-span-2 font-medium text-foreground">Customer</label>
                <Input readOnly className="col-span-8" value={selectedBatch?.customer.name} />
              </div>
            )}
            <div className="grid grid-cols-10 items-center gap-2">
              {selectedCableProfile?.colorProfile.cable_type === "IBR" && (
                <>
                  <label className="col-span-2 font-medium text-foreground">Strand Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.strandCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Ribbon Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.ribbonCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Fiber Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.fiberCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Total Fibers</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.totalFibers} readOnly />
                </>
              )}
              {selectedCableProfile?.colorProfile.cable_type === "FLAT_RIBBON" && (
                <>
                  <label className="col-span-2 font-medium text-foreground">Ribbon Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.ribbonCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Fiber Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.fiberCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Total Fibers</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.totalFibers} readOnly />
                </>
              )}
              {selectedCableProfile?.colorProfile.cable_type === "MULTI_TUBE" && (
                <>
                  <label className="col-span-2 font-medium text-foreground">Tube Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.tubeCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Fiber Count</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.fiberCount} readOnly />
                  <label className="col-span-2 font-medium text-foreground">Total Fibers</label>
                  <Input className="col-span-8" value={selectedCableProfile?.colorProfile.totalFibers} readOnly />
                </>
              )}
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <div className="col-span-2" />
              {selectedCableProfile?.wavelength_configs.map((config, id) => (
                <div className="col-span-2" key={id}>
                  <label className="col-span-2 font-medium text-foreground">{config.wavelength}(nm)</label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              {selectedCableProfile && <label className="col-span-2 font-medium text-foreground">Loss (min)</label>}
              {selectedCableProfile?.wavelength_configs.map((config, id) => (
                <Input className="col-span-2" key={id} value={config.min_attenuation} readOnly />
              ))}
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              {selectedCableProfile && <label className="col-span-2 font-medium text-foreground">Loss (max)</label>}
              {selectedCableProfile?.wavelength_configs.map((config, id) => (
                <Input className="col-span-2" key={id} value={config.max_attenuation} readOnly />
              ))}
            </div>
          </div>
        </Card>
        <Card className="relative overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">OTDR Testing</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">OTDR Length (km)</label>
              <Input readOnly className="col-span-6" />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">IOR</label>
              {selectedCableProfile?.wavelength_configs.map((config, id) => (
                <div className="col-span-2" key={id}>
                  <label className="col-span-2 font-medium text-foreground">{config.wavelength}(nm)</label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-2 font-medium text-foreground">Fiber</label>
              {selectedCableProfile?.wavelength_configs.map((config, id) => (
                <Input key={id} readOnly id={config.wavelength.toString()} className="col-span-2" />
              ))}
              <Button
                disabled={
                  otdrStatus?.state !== "connected" ||
                  !checkIfAllSelected ||
                  runSkippyMetricsWithImage.isPending ||
                  isBatchFiberTestingDataLoading ||
                  isSaveBatchCableProfileLinkPending ||
                  isBatchFiberTestingDataLoading
                }
                className="col-span-2 h-8 w-full text-xs"
              >
                Test <MonitorPlay />
              </Button>
            </div>
          </div>
        </Card>
      </div>
      <div className="col-span-5 space-y-2">
        <Card className="relative h-full overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">OTDR Losses Testing</h2>
          <div className="space-y-2">
            <Button
              onClick={handleStartTesting}
              disabled={
                otdrStatus?.state !== "connected" ||
                !checkIfAllSelected ||
                runSkippyMetricsWithImage.isPending ||
                isBatchFiberTestingDataLoading ||
                isSaveBatchCableProfileLinkPending ||
                isBatchFiberTestingDataLoading
              }
              className="h-8 w-full text-xs"
            >
              {runSkippyMetricsWithImage.isPending ? "Testing..." : "Test"} <MonitorPlay />
            </Button>
            {(isBatchFiberTestingDataLoading || isSaveBatchCableProfileLinkPending) && (
              <Loader2 className="m-auto size-5 animate-spin" />
            )}

            {selectedFiltersFiberTestingData &&
              !isSaveBatchCableProfileLinkPending &&
              !isBatchFiberTestingDataLoading && (
                <>
                  <div className="grid grid-cols-1 gap-2">
                    <ScrollContainer hideScrollbars={false} className="overflow-x-auto pb-1">
                      <ToggleGroup
                        type="single"
                        value={selectedFilters.attribute1_value}
                        defaultValue={uniqueAttribute1_values?.[0]}
                        onValueChange={(value) => {
                          if (!value) {
                            return
                          }
                          setSelectedFilters((prev) => ({ ...prev, attribute1_value: value }))
                        }}
                      >
                        {uniqueAttribute1_values?.map((value, id) => (
                          <ToggleGroupItem variant={"outline"} key={id} value={value} aria-label={`Toggle ${value}`}>
                            {value}
                          </ToggleGroupItem>
                        ))}
                      </ToggleGroup>
                    </ScrollContainer>
                    {selectedCableProfile?.colorProfile.cable_type === "IBR" && (
                      <ScrollContainer hideScrollbars={false} className="overflow-x-auto pb-1">
                        <ToggleGroup
                          type="single"
                          value={selectedFilters.attribute2_value}
                          defaultValue={uniqueAttribute2_values?.[0]}
                          onValueChange={(value) => {
                            if (!value) {
                              return
                            }
                            setSelectedFilters((prev) => ({ ...prev, attribute2_value: value }))
                          }}
                        >
                          {uniqueAttribute2_values?.map((value, id) => (
                            <ToggleGroupItem variant={"outline"} key={id} value={value} aria-label={`Toggle ${value}`}>
                              {value}
                            </ToggleGroupItem>
                          ))}
                        </ToggleGroup>
                      </ScrollContainer>
                    )}
                  </div>
                  <div className="max-h-148 overflow-x-auto border border-muted-foreground ring-0">
                    <Table className="border text-xs">
                      <TableHeader>
                        <TableRow className="sticky top-0 bg-blue-100 dark:bg-blue-950">
                          {selectedFiltersFiberTestingData?.headers.map((header) => (
                            <TableHead className="h-7 px-2 py-1 text-xs" key={header.key}>
                              {header.label}
                            </TableHead>
                          ))}
                          <TableHead className="h-7 px-2 py-1 text-xs">Test Count</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedFiltersFiberTestingData?.rows.map((row, i) => (
                          <TableRow key={i} className={i % 2 === 0 ? "bg-blue-50 dark:bg-blue-950/50" : ""}>
                            <TableCell className="h-6 px-2 py-1 text-xs">{row.fiber_number}</TableCell>

                            <TableCell className="h-6 px-2 py-1 text-xs">{row.attribute1_value}</TableCell>

                            <TableCell className="h-6 px-2 py-1 text-xs">{row.attribute2_value}</TableCell>

                            {row?.attribute3_value && (
                              <TableCell className="h-6 px-2 py-1 text-xs">{row?.attribute3_value}</TableCell>
                            )}

                            {row.fiber_wavelengths.map((wavelength, id) => (
                              <TableCell className="h-6 px-2 py-1 text-xs" key={id}>
                                <Input readOnly className="h-6 px-2 py-1 text-xs" value={wavelength.measured_value} />
                              </TableCell>
                            ))}
                            <TableCell className="h-6 px-2 py-1 text-xs">{row.testing_counter}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            {cableProfile && (
              <>
                <div className="grid grid-cols-7 items-center gap-2">
                  <label className="col-span-1" />
                  <label className="col-span-1 font-medium text-foreground">Tube ID</label>
                  <label className="col-span-1 font-medium text-foreground">Tube OD</label>
                  <label className="col-span-1 font-medium text-foreground">FRP</label>
                  <label className="col-span-1 font-medium text-foreground">Inner</label>
                  <label className="col-span-1 font-medium text-foreground">Outer</label>
                  <label className="col-span-1 font-medium text-foreground">Cable Dia</label>
                </div>
                <div className="grid grid-cols-7 items-center gap-2">
                  <label className="col-span-1 font-medium text-foreground">(Min)</label>
                  {batchFiberTestingData?.colorProfile.physical_dimensions[0].map((data, id) => (
                    <Input readOnly className="col-span-1" key={id} value={data.value} />
                  ))}
                </div>
                <div className="grid grid-cols-7 items-center gap-2">
                  <label className="col-span-1 font-medium text-foreground">(Max)</label>
                  {batchFiberTestingData?.colorProfile.physical_dimensions[1].map((data, id) => (
                    <Input readOnly className="col-span-1" key={id} value={data.value} />
                  ))}
                </div>
                <div className="grid grid-cols-7 items-center gap-2">
                  <label className="col-span-1 font-medium text-foreground">Remarks</label>
                  <Input
                    className="col-span-6 w-full"
                    placeholder="OTDR Test Remarks"
                    value={cablePhysicalParameters?.remark}
                    onChange={(e) => setCablePhysicalParameters({ ...cablePhysicalParameters, remark: e.target.value })}
                  />
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
      <div className="col-span-3 space-y-2">
        <Card className="relative h-full overflow-visible rounded-none border border-muted-foreground p-4 ring-0">
          <h2 className="absolute -top-2 bg-background text-sm font-semibold">Physical Parameters</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">IEM</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.iem ?? ""}
                onChange={(e) => setCablePhysicalParameters({ ...cablePhysicalParameters, iem: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">OEM/Length of SFG (m)</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.oem_length_of_sfg_m ?? ""}
                onChange={(e) =>
                  setCablePhysicalParameters({ ...cablePhysicalParameters, oem_length_of_sfg_m: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Inner Sheath (mm)</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.inner_sheath_mm ?? ""}
                onChange={(e) =>
                  setCablePhysicalParameters({ ...cablePhysicalParameters, inner_sheath_mm: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Outer Sheath (mm)</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.outer_sheath_mm ?? ""}
                onChange={(e) =>
                  setCablePhysicalParameters({ ...cablePhysicalParameters, outer_sheath_mm: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Cable Dia (mm)</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.cable_dia_mm ?? ""}
                onChange={(e) =>
                  setCablePhysicalParameters({ ...cablePhysicalParameters, cable_dia_mm: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Stripability/Rib Separation</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.stripability_rib_separation}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      stripability_rib_separation: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Visual Inspection</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.visual_inspection}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      visual_inspection: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <div className="col-span-5 grid grid-cols-5 items-center gap-2">
                <label className="col-span-3 font-medium text-foreground">WPT</label>
                <div className="col-span-2">
                  <Select
                    // defaultValue="OK"
                    value={cablePhysicalParameters?.wpt}
                    onValueChange={(value: OK_NOT_OK) =>
                      setCablePhysicalParameters({
                        ...cablePhysicalParameters,
                        wpt: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {OK_NOT_OK.map((value, id) => (
                          <SelectItem key={id} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="col-span-5 grid grid-cols-5 items-center gap-2">
                <label className="col-span-3 font-medium text-foreground">Drip</label>
                <div className="col-span-2">
                  <Select
                    // defaultValue="OK"
                    value={cablePhysicalParameters?.wpt_drip}
                    onValueChange={(value: OK_NOT_OK) =>
                      setCablePhysicalParameters({
                        ...cablePhysicalParameters,
                        wpt_drip: value,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {OK_NOT_OK.map((value, id) => (
                          <SelectItem key={id} value={value}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Sheath Removal (R/LC)</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.sheath_removal_r_lc}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      sheath_removal_r_lc: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Tube ID/OD (nm)</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.tube_id_od_nm ?? ""}
                onChange={(e) =>
                  setCablePhysicalParameters({ ...cablePhysicalParameters, tube_id_od_nm: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">FRP Dia (nm)</label>
              <Input
                className="col-span-7"
                value={cablePhysicalParameters?.frp_dia_nm ?? ""}
                onChange={(e) => setCablePhysicalParameters({ ...cablePhysicalParameters, frp_dia_nm: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Fiber Seg of Ribbon</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.fiber_seg_of_ribbon}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      fiber_seg_of_ribbon: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Ribbon Print Qty</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.ribbon_print_qty}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      ribbon_print_qty: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Color of Fiber</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.color_of_fiber}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      color_of_fiber: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Vernier No.</label>
              <div className="col-span-7">
                <Select
                  value={cablePhysicalParameters?.vernier_id?.toString()}
                  onValueChange={(value: string) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      vernier_id: value ? parseInt(value) : undefined,
                    })
                  }
                  disabled={isVerniersPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Vernier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {verniers?.map((vernier, id) => (
                        <SelectItem key={id} value={vernier.id.toString()}>
                          {vernier.vernier_no}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Ribbon Rub Test</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.ribbon_rub_test}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      ribbon_rub_test: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Ribbon Stiffness</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.ribbon_stiffness}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      ribbon_stiffness: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Ribbon Separation</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="OK"
                  value={cablePhysicalParameters?.ribbon_separation}
                  onValueChange={(value: OK_NOT_OK) =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      ribbon_separation: value,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {OK_NOT_OK.map((value, id) => (
                        <SelectItem key={id} value={value}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-10 items-center gap-2">
              <label className="col-span-3 font-medium text-foreground">Status</label>
              <div className="col-span-7">
                <Select
                  // defaultValue="PASS"
                  value={cablePhysicalParameters?.status}
                  onValueChange={(value: "PENDING" | "PASS") =>
                    setCablePhysicalParameters({
                      ...cablePhysicalParameters,
                      status: value,
                    })
                  }
                >
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
                onClick={() =>
                  saveBatchCablePhysicalParameters({
                    ...cablePhysicalParameters,
                    batch_cable_profile_id: batchCableProfileLinkId,
                  })
                }
                disabled={
                  isSaveBatchCablePhysicalParametersPending ||
                  isBatchFiberTestingDataLoading ||
                  !batchCableProfileLinkId
                }
                variant="default"
                className="col-span-1 h-8 w-full text-xs"
              >
                Save Results <Save />
              </Button>
              <Button variant="secondary" disabled className="col-span-1 h-8 w-full text-xs">
                Print Sticker <Printer />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
