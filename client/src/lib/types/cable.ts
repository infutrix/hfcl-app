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

export type CableProfile = {
  id: number
  cable_profile_name: string
  profile_key_value: string
  status: boolean
  deleted: boolean
  created_at: string
  modified_at: string
}
