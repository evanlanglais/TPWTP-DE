export interface Destination {
  id: string
  name: string
  slug: string
  parks?: Park[]
}

export interface Park {
  id: string
  destination_id: string
  name: string
  timezone: string
  destination?: Destination
  attractions?: Attraction[]
}

export interface Attraction {
  id: string
  park_id: string
  name: string
  external_id: string | null
  wait_times?: WaitTime[]
}

export interface WaitTime {
  attraction_id: string
  timestamp: string
  status: WaitTimeStatus
  standby_wait: number | null
  single_rider_wait: number | null
  return_time_state: string | null
  return_time_start: string | null
  return_time_end: string | null
}

export type WaitTimeStatus = 'OPERATING' | 'CLOSED' | 'DOWN' | 'REFURBISHMENT'

export interface AttractionWithLatestWait extends Attraction {
  wait_times: WaitTime[]
}

export type VelocityTrend = 'STABLE' | 'RISING' | 'FALLING'

export interface WaitVelocity {
  attraction_id: string
  timestamp: string
  velocity: number | null
  velocity_ema: number | null
  trend: VelocityTrend
  sample_count: number
}

export interface StatusTransition {
  id: number
  attraction_id: string
  transition_time: string
  previous_status: WaitTimeStatus
  new_status: WaitTimeStatus
  duration_seconds: number | null
}

export interface AttractionWithLatestWaitAndVelocity extends Attraction {
  wait_times: WaitTime[]
  l2_wait_velocity: WaitVelocity[]
}
