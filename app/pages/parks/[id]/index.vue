<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { AttractionWithLatestWaitAndVelocity } from '~/types'

const route = useRoute()
const router = useRouter()
const parkId = computed(() => route.params.id as string)

const { data: park } = usePark(parkId)
const { data: attractions, status } = useLiveWaitTimesWithVelocity(parkId)
const { data: transitions } = useRecentTransitions(parkId)
const { data: crowdPressure } = useCrowdPressure(parkId)
const { data: correlationPairs } = useCorrelationPairs(parkId)

const impactTransitionIds = computed(() => {
  if (!transitions.value) return []
  return transitions.value
    .filter(t =>
      t.new_status === 'CLOSED' || t.new_status === 'DOWN'
      || t.previous_status === 'CLOSED' || t.previous_status === 'DOWN'
    )
    .map(t => t.id)
})

const { data: transitionImpacts } = useTransitionImpacts(parkId, impactTransitionIds)

const breadcrumbItems = computed(() => [
  { label: 'Home', icon: 'i-lucide-home', to: '/' },
  { label: park.value?.name ?? 'Park' }
])

const pressureLabel = computed(() => {
  if (!crowdPressure.value) return null
  const ema = crowdPressure.value.pressure_ema
  if (ema > 1) return { text: 'High', color: 'text-error' }
  if (ema > 0.3) return { text: 'Moderate', color: 'text-warning' }
  if (ema > -0.3) return { text: 'Normal', color: 'text-success' }
  return { text: 'Low', color: 'text-info' }
})

const impactsByTransition = computed(() => {
  if (!transitionImpacts.value) return new Map()
  const map = new Map<number, typeof transitionImpacts.value>()
  for (const impact of transitionImpacts.value) {
    if (impact.excess_delta == null || impact.excess_delta === 0) continue
    const arr = map.get(impact.transition_id) ?? []
    arr.push(impact)
    map.set(impact.transition_id, arr)
  }
  for (const [key, arr] of map) {
    map.set(key, arr.slice(0, 5))
  }
  return map
})

const positiveCorrelations = computed(() =>
  correlationPairs.value?.filter(p => p.correlation > 0.7).slice(0, 5) ?? []
)

const negativeCorrelations = computed(() =>
  correlationPairs.value?.filter(p => p.correlation < -0.7).slice(0, 5) ?? []
)

const correlationWindow = computed(() => {
  if (!correlationPairs.value?.length) return null
  const first = correlationPairs.value[0]
  return { start: first.window_start, end: first.window_end }
})

const totalAttractions = computed(() => attractions.value?.length ?? 0)

const operatingCount = computed(() =>
  attractions.value?.filter(a => a.wait_times[0]?.status === 'OPERATING').length ?? 0
)

const avgWait = computed(() => {
  const waits = attractions.value
    ?.filter(a => a.wait_times[0]?.status === 'OPERATING' && a.wait_times[0]?.standby_wait != null)
    .map(a => a.wait_times[0].standby_wait!) ?? []
  if (!waits.length) return 0
  return Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
})

const busiestRide = computed(() => {
  if (!attractions.value?.length) return '\u2014'
  const sorted = [...attractions.value]
    .filter(a => a.wait_times[0]?.standby_wait != null)
    .sort((a, b) => (b.wait_times[0].standby_wait ?? 0) - (a.wait_times[0].standby_wait ?? 0))
  return sorted[0]?.name ?? '\u2014'
})

const risingCount = computed(() =>
  attractions.value?.filter(a => a.l2_wait_velocity?.[0]?.trend === 'RISING').length ?? 0
)
const stableCount = computed(() =>
  attractions.value?.filter(a => a.l2_wait_velocity?.[0]?.trend === 'STABLE').length ?? 0
)
const fallingCount = computed(() =>
  attractions.value?.filter(a => a.l2_wait_velocity?.[0]?.trend === 'FALLING').length ?? 0
)

const sortedAttractions = computed(() => {
  if (!attractions.value) return []
  return [...attractions.value].sort((a, b) => {
    const aWait = a.wait_times[0]?.standby_wait ?? -1
    const bWait = b.wait_times[0]?.standby_wait ?? -1
    return bWait - aWait
  })
})

const UBadge = resolveComponent('UBadge')
const TrendIndicatorComp = resolveComponent('TrendIndicator')

const columns: TableColumn<AttractionWithLatestWaitAndVelocity>[] = [
  {
    accessorKey: 'name',
    header: 'Attraction'
  },
  {
    id: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const wt = row.original.wait_times[0]
      if (!wt) return '\u2014'
      const colorMap: Record<string, string> = {
        OPERATING: 'success',
        CLOSED: 'neutral',
        DOWN: 'error',
        REFURBISHMENT: 'warning'
      }
      const labelMap: Record<string, string> = {
        OPERATING: 'Operating',
        CLOSED: 'Closed',
        DOWN: 'Down',
        REFURBISHMENT: 'Refurb'
      }
      return h(UBadge, {
        color: colorMap[wt.status] || 'neutral',
        variant: 'subtle',
        label: labelMap[wt.status] || wt.status
      })
    }
  },
  {
    id: 'standby_wait',
    header: 'Current Wait',
    cell: ({ row }) => {
      const wt = row.original.wait_times[0]
      if (!wt || wt.status !== 'OPERATING' || wt.standby_wait == null) return '\u2014'
      return `${wt.standby_wait} min`
    },
    meta: {
      class: {
        td: 'font-medium'
      }
    }
  },
  {
    id: 'trend',
    header: 'Trend',
    cell: ({ row }) => {
      const vel = row.original.l2_wait_velocity?.[0]
      if (!vel || row.original.wait_times[0]?.status !== 'OPERATING') {
        return h(TrendIndicatorComp, { trend: null, velocity: null })
      }
      return h(TrendIndicatorComp, { trend: vel.trend, velocity: vel.velocity })
    }
  }
]

function onRowClick(_e: Event, row: any) {
  router.push(`/parks/${parkId.value}/attractions/${row.original.id}`)
}

function formatTransitionTime(timestamp: string) {
  return new Date(timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

function formatTransitionDate(timestamp: string) {
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar>
        <template #left>
          <UBreadcrumb :items="breadcrumbItems" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Total Attractions</span>
              <span class="text-2xl font-bold">{{ totalAttractions }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Currently Operating</span>
              <span class="text-2xl font-bold text-success">{{ operatingCount }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Avg Wait Time</span>
              <span class="text-2xl font-bold">{{ avgWait }} min</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Busiest Ride</span>
              <span class="text-lg font-bold truncate">{{ busiestRide }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted flex items-center gap-1">
                Crowd Pressure
                <UTooltip text="Measures how fast wait times are rising across the park. Based on a smoothed average of ride wait-time velocities — High means waits are climbing quickly, Low means they're dropping.">
                  <UIcon name="i-lucide-info" class="size-3.5 text-muted" />
                </UTooltip>
              </span>
              <template v-if="crowdPressure && pressureLabel">
                <span class="text-2xl font-bold" :class="pressureLabel.color">{{ pressureLabel.text }}</span>
                <TrendIndicator :trend="crowdPressure.trend" :velocity="crowdPressure.pressure_score" />
              </template>
              <span v-else class="text-2xl font-bold text-muted">&mdash;</span>
            </div>
          </UCard>
        </div>

        <!-- Velocity Trend Summary -->
        <div class="grid grid-cols-3 gap-4">
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Rising</span>
              <span class="text-2xl font-bold text-error">{{ risingCount }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Stable</span>
              <span class="text-2xl font-bold text-muted">{{ stableCount }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Falling</span>
              <span class="text-2xl font-bold text-success">{{ fallingCount }}</span>
            </div>
          </UCard>
        </div>

        <!-- Attractions Table -->
        <UTable
          :data="sortedAttractions"
          :columns="columns"
          :loading="status === 'pending'"
          sticky
          class="cursor-pointer"
          @select="onRowClick"
        />

        <!-- Correlation Pairs -->
        <UCard v-if="positiveCorrelations.length || negativeCorrelations.length">
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-link" class="size-5" />
                <h3 class="text-lg font-semibold">Correlation Pairs</h3>
              </div>
              <span v-if="correlationWindow" class="text-sm text-muted">
                {{ new Date(correlationWindow.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
                &ndash;
                {{ new Date(correlationWindow.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}
              </span>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-if="positiveCorrelations.length">
              <h4 class="text-sm font-medium text-muted mb-3">Move Together</h4>
              <div class="flex flex-col gap-2">
                <div v-for="pair in positiveCorrelations" :key="`${pair.attraction_a}-${pair.attraction_b}`" class="flex items-center justify-between gap-2">
                  <span class="text-sm truncate">{{ pair.attraction_a_name }} &harr; {{ pair.attraction_b_name }}</span>
                  <UBadge color="success" variant="subtle" :label="`${Math.round(pair.correlation * 100)}%`" />
                </div>
              </div>
            </div>
            <div v-if="negativeCorrelations.length">
              <h4 class="text-sm font-medium text-muted mb-3">Move Opposite</h4>
              <div class="flex flex-col gap-2">
                <div v-for="pair in negativeCorrelations" :key="`${pair.attraction_a}-${pair.attraction_b}`" class="flex items-center justify-between gap-2">
                  <span class="text-sm truncate">{{ pair.attraction_a_name }} &harr; {{ pair.attraction_b_name }}</span>
                  <UBadge color="error" variant="subtle" :label="`${Math.round(pair.correlation * 100)}%`" />
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Recent Activity Feed -->
        <UCard v-if="transitions?.length">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-activity" class="size-5" />
              <h3 class="text-lg font-semibold">Recent Activity</h3>
            </div>
          </template>

          <div class="flex flex-col divide-y divide-default">
            <div
              v-for="t in transitions"
              :key="t.id"
              class="py-3 first:pt-0 last:pb-0"
            >
              <div class="flex items-center gap-3">
                <div class="flex-1 min-w-0">
                  <span class="font-medium truncate">{{ t.attraction_name }}</span>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                  <StatusBadge :status="t.previous_status" />
                  <UIcon name="i-lucide-arrow-right" class="size-4 text-muted" />
                  <StatusBadge :status="t.new_status" />
                </div>
                <div class="text-sm text-muted shrink-0">
                  {{ formatTransitionDate(t.transition_time) }} {{ formatTransitionTime(t.transition_time) }}
                </div>
              </div>
              <!-- Transition Impact Sub-items -->
              <div
                v-if="impactsByTransition.get(t.id)?.length"
                class="mt-2 ml-4 pl-3 border-l-2 border-default flex flex-col gap-1.5"
              >
                <span class="text-xs text-muted">
                  {{ impactsByTransition.get(t.id)![0].event_type === 'CLOSURE' ? 'Absorbed crowds' : 'Drained crowds' }}
                </span>
                <div
                  v-for="impact in impactsByTransition.get(t.id)"
                  :key="impact.id"
                  class="flex items-center gap-2 text-sm"
                >
                  <UIcon :name="impact.event_type === 'CLOSURE' ? 'i-lucide-git-merge' :'i-lucide-git-branch'" class="size-3.5 text-muted shrink-0" />
                  <span class="truncate">{{ impact.impacted_attraction_name }}</span>
                  <UBadge
                    :color="(impact.excess_delta ?? 0) > 0 ? 'error' : 'success'"
                    variant="subtle"
                    size="xs"
                    :label="`${(impact.excess_delta ?? 0) > 0 ? '+' : ''}${Math.round(impact.excess_delta ?? 0)} min`"
                  />
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
