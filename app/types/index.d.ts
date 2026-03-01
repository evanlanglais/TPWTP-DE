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

export type PressureTrend = 'RISING' | 'FALLING' | 'STABLE'

export interface CrowdPressure {
  park_id: string
  timestamp: string
  pressure_score: number
  pressure_ema: number
  trend: PressureTrend
  operating_count: number
  avg_wait: number
}

export type TransitionEventType = 'closure' | 'reopening'

export interface TransitionImpactWithNames {
  id: number
  transition_id: number
  event_type: TransitionEventType
  transitioned_attraction: string
  impacted_attraction: string
  park_id: string
  transition_time: string
  velocity_before: number | null
  velocity_after: number | null
  velocity_delta: number | null
  baseline_delta: number | null
  excess_delta: number | null
  wait_before: number | null
  wait_after: number | null
  wait_delta: number | null
  absorption_score: number | null
  drain_score: number | null
  transitioned_attraction_name: string
  impacted_attraction_name: string
}

export interface CorrelationPairWithNames {
  park_id: string
  attraction_a: string
  attraction_b: string
  computed_at: string
  window_start: string
  window_end: string
  correlation: number
  sample_count: number
  attraction_a_name: string
  attraction_b_name: string
}
