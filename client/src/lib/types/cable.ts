export type BatchCableProfileLinkPayload = {
  batch_id: number
  otdr_device_id: number
  cable_profile_id: number
  customer_id: number
  stage_id: number
  drum_number: string
  fiber_type: string
}

export type BatchCableProfileLinkResponse = {
  id: number
}

export type Batch = {
  id: number
  plant: {
    id: number
    plant_name: string
    location: string
    status: boolean
    created_at: string
    modified_at: string
  }
  customer: {
    id: number
    name: string
    phone: string
    email: string
    company_name: string
    address: string
    status: boolean
    deleted: boolean
    created_at: string
    updated_at: string
  }
  batch: string
  drum_number: string
  fiber_type: string
  status: boolean
  created_at: string
  modified_at: string
}

export type SfgStage = {
  id: number
  name: string
  code: null | string
  sequence: number
  status: boolean
  deleted: boolean
  created_at: string
  updated_at: string
}

type WavelengthConfig = {
  id: number
  wavelength: number
  gri: string
  min_attenuation: string
  max_attenuation: string
  unit: string
  created_at: string
  updated_at: string
}

type BaseCableProfile = {
  id: number
  cable_profile_name: string
  profile_key_value: string
  status: boolean
  deleted: boolean
  created_at: string
  modified_at: string
  wavelength_configs: WavelengthConfig[]
}

export type CableType = "IBR" | "MULTI_TUBE" | "FLAT_RIBBON"

export type IbrColorProfile = {
  cable_type: "IBR"
  profile_display_name: string
  profile_key_value: string
  strandCount: number
  ribbonCount: number
  fiberCount: number
  totalFibers: number
  strandColors: string[]
  fiberColors: string[]
}

export type FlatRibbonColorProfile = {
  cable_type: "FLAT_RIBBON"
  profile_display_name: string
  profile_key_value: string
  ribbonCount: number
  fiberCount: number
  totalFibers: number
  fiberColors: string[]
}

export type MultiTubeColorProfile = {
  cable_type: "MULTI_TUBE"
  profile_display_name: string
  profile_key_value: string
  tubeCount: number
  fiberCount: number
  totalFibers: number
  tubeColors: {
    innerLayer: string[]
    outerLayer: string[]
  }
  fiberColors: string[]
}

export type IbrCableProfile = BaseCableProfile & {
  colorProfile: IbrColorProfile
}

export type FlatRibbonCableProfile = BaseCableProfile & {
  colorProfile: FlatRibbonColorProfile
}

export type MultiTubeCableProfile = BaseCableProfile & {
  colorProfile: MultiTubeColorProfile
}

export type CableProfile =
  | IbrCableProfile
  | FlatRibbonCableProfile
  | MultiTubeCableProfile

type Header = {
  key: string
  label: string
}

type FiberWavelength = {
  wavelength_nm: string
  measured_value: string
}

type BaseFiberRow = {
  id: number
  fiber_number: number

  attribute1_name: string
  attribute1_value: string

  attribute2_name: string
  attribute2_value: string

  attribute3_name?: string
  attribute3_value?: string

  fiber_wavelengths: FiberWavelength[]

  status: boolean
  created_at: string
  modified_at: string
}

type BaseBatchFiberTestingData<TType extends string, TRow> = {
  headers: Header[]
  rows: TRow[]

  colorProfile: {
    cable_type: TType
  }
}

type BatchFiberTestingDataIbr = BaseBatchFiberTestingData<"IBR", BaseFiberRow>

type BatchFiberTestingDataFlatRibbon = BaseBatchFiberTestingData<
  "FLAT_RIBBON",
  BaseFiberRow
>

type BatchFiberTestingDataMultiTube = BaseBatchFiberTestingData<
  "MULTI_TUBE",
  BaseFiberRow
>

export type BatchFiberTestingData =
  | BatchFiberTestingDataIbr
  | BatchFiberTestingDataFlatRibbon
  | BatchFiberTestingDataMultiTube
