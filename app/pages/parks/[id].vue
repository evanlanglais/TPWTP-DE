<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { AttractionWithLatestWaitAndVelocity } from '~/types'
import { format, subDays } from 'date-fns'

const route = useRoute()
const parkId = computed(() => route.params.id as string)

const { data: park } = usePark(parkId)
const { data: attractions, status } = useLiveWaitTimesWithVelocity(parkId)
const { data: transitions } = useRecentTransitions(parkId)

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
const UButton = resolveComponent('UButton')
const TrendIndicatorComp = resolveComponent('TrendIndicator')
const StatusBadgeComp = resolveComponent('StatusBadge')

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
  },
  {
    id: 'explore',
    header: '',
    cell: ({ row }) => {
      const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
      const today = format(new Date(), 'yyyy-MM-dd')
      return h(UButton, {
        icon: 'i-lucide-chart-line',
        color: 'neutral',
        variant: 'ghost',
        size: 'xs',
        to: `/explorer?parkId=${parkId.value}&attractionIds=${row.original.id}&startDate=${yesterday}&endDate=${today}`
      })
    }
  }
]

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
      <UDashboardNavbar :title="park?.name ?? 'Park'" icon="i-lucide-map-pin">
        <template #leading>
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/parks"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <!-- Stats Row -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
        />

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
              class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
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
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
