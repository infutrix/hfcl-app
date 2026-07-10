export type BatchCableProfileLinkPayload = {
  batch_id: number
  otdr_device_id: number
  cable_profile_id: number
  customer_id: number
  stage_id: number
  drum_number: string
  fiber_type: string
}

export type BatchCablePhysicalParametersPayload = {
  batch_cable_profile_id: number
  vernier_id: number
  iem: string
  oem_length_of_sfg_m: string
  inner_sheath_mm: string
  outer_sheath_mm: string
  cable_dia_mm: string
  tube_id_od_nm: string
  frp_dia_nm: string
  stripability_rib_separation: OK_NOT_OK
  visual_inspection: OK_NOT_OK
  wpt: OK_NOT_OK
  wpt_drip: OK_NOT_OK
  sheath_removal_r_lc: OK_NOT_OK
  fiber_seg_of_ribbon: OK_NOT_OK
  ribbon_print_qty: OK_NOT_OK
  color_of_fiber: OK_NOT_OK
  ribbon_rub_test: OK_NOT_OK
  ribbon_stiffness: OK_NOT_OK
  ribbon_separation: OK_NOT_OK
  remark: string
  status: "PENDING" | "PASS"
}

export const OK_NOT_OK = ["OK", "Not Ok", "N/A"] as const
export type OK_NOT_OK = (typeof OK_NOT_OK)[number]

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

export type CableProfile = IbrCableProfile | FlatRibbonCableProfile | MultiTubeCableProfile

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
  testing_counter: 0

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

export type BatchFiberTestingData = {
  headers: Header[]
  rows: BaseFiberRow[]
  batch_cable_profile: {
    physical_params: Partial<{
      id: number
      vernier: null | {
        id: number
        status: boolean
        vernier_no: string
      }
      iem: string
      oem_length_of_sfg_m: string
      inner_sheath_mm: string
      outer_sheath_mm: string
      cable_dia_mm: string
      tube_id_od_nm: string
      frp_dia_nm: string
      stripability_rib_separation: OK_NOT_OK
      visual_inspection: OK_NOT_OK
      wpt: OK_NOT_OK
      wpt_drip: OK_NOT_OK
      sheath_removal_r_lc: OK_NOT_OK
      fiber_seg_of_ribbon: OK_NOT_OK
      ribbon_print_qty: OK_NOT_OK
      color_of_fiber: OK_NOT_OK
      ribbon_rub_test: OK_NOT_OK
      ribbon_stiffness: OK_NOT_OK
      ribbon_separation: OK_NOT_OK
      remark: string
      status: "PASS" | "PENDING"
    }>
  }
  colorProfile: {
    cable_type: CableType
    physical_dimensions: [Array<{ key: string; value: number }>, Array<{ key: string; value: number }>]
  }
}

export type VernierResponse = {
  id: number
  vernier_no: string
  status: boolean
  created_at: string
  modified_at: string
}

export type SaveBatchFiberTestingDataPayload = {
  fiber_wavelengths: FiberWavelength[]
  ai_response: string
  fibre_id: number
}
