<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn } from '@nuxt/ui'
import type { AttractionWithLatestWaitAndVelocity } from '~/types'

const selectedParkId = ref<string | null>(null)

const { data: parks } = useParks()
const { data: attractions, status, refresh } = useLiveWaitTimesWithVelocity(selectedParkId)
const { data: crowdPressure, refresh: refreshPressure } = useCrowdPressure(selectedParkId)

const selectedParkTimezone = computed(() => {
  if (!selectedParkId.value || !parks.value) return null
  return parks.value.find(p => p.id === selectedParkId.value)?.timezone ?? null
})

const operatingCount = computed(() =>
  attractions.value?.filter(a => a.wait_times[0]?.status === 'OPERATING').length ?? 0
)

const closedCount = computed(() =>
  attractions.value?.filter(a => a.wait_times[0]?.status !== 'OPERATING').length ?? 0
)

const avgWait = computed(() => {
  const waits = attractions.value
    ?.filter(a => a.wait_times[0]?.status === 'OPERATING' && a.wait_times[0]?.standby_wait != null)
    .map(a => a.wait_times[0].standby_wait!) ?? []
  if (!waits.length) return 0
  return Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
})

const longestWait = computed(() => {
  const waits = attractions.value
    ?.filter(a => a.wait_times[0]?.standby_wait != null)
    .map(a => a.wait_times[0].standby_wait!) ?? []
  return waits.length ? Math.max(...waits) : 0
})

const pressureLabel = computed(() => {
  if (!crowdPressure.value) return null
  const ema = crowdPressure.value.pressure_ema
  if (ema > 1) return { text: 'High', color: 'text-error' }
  if (ema > 0.3) return { text: 'Moderate', color: 'text-warning' }
  if (ema > -0.3) return { text: 'Normal', color: 'text-success' }
  return { text: 'Low', color: 'text-info' }
})

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

function exploreTodayUrl(attraction: AttractionWithLatestWaitAndVelocity) {
  const today = selectedParkTimezone.value
    ? new Date().toLocaleDateString('en-CA', { timeZone: selectedParkTimezone.value })
    : new Date().toISOString().slice(0, 10)
  return `/explorer?parkId=${attraction.park_id}&attractionIds=${attraction.id}&startDate=${today}&endDate=${today}`
}

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
    header: 'Standby Wait',
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
    id: 'last_updated',
    header: 'Last Updated',
    cell: ({ row }) => {
      const wt = row.original.wait_times[0]
      if (!wt) return '\u2014'
      return new Date(wt.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      })
    },
    meta: {
      class: {
        td: 'text-muted'
      }
    }
  },
  {
    id: 'explore',
    header: '',
    cell: ({ row }) => {
      return h(UButton, {
        to: exploreTodayUrl(row.original),
        icon: 'i-lucide-chart-line',
        color: 'neutral',
        variant: 'ghost',
        size: 'xs',
        label: 'Explore'
      })
    }
  }
]

// Auto-refresh every 60 seconds
let refreshInterval: ReturnType<typeof setInterval> | null = null

watch(selectedParkId, () => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (selectedParkId.value) {
    refreshInterval = setInterval(() => { refresh(); refreshPressure() }, 60000)
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Live Wait Times" icon="i-lucide-timer">
        <template #right>
          <ParkSelector v-model="selectedParkId" />
          <UButton
            v-if="selectedParkId"
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            :loading="status === 'pending'"
            @click="refresh()"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="!selectedParkId" class="flex flex-col items-center justify-center h-full gap-4 text-muted">
        <UIcon name="i-lucide-ferris-wheel" class="size-16" />
        <p class="text-lg">Select a park to view live wait times</p>
      </div>

      <div v-else-if="attractions" class="flex flex-col gap-6">
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Operating</span>
              <span class="text-2xl font-bold text-success">{{ operatingCount }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Closed / Down</span>
              <span class="text-2xl font-bold">{{ closedCount }}</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Average Wait</span>
              <span class="text-2xl font-bold">{{ avgWait }} min</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Longest Wait</span>
              <span class="text-2xl font-bold text-error">{{ longestWait }} min</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Crowd Pressure</span>
              <template v-if="crowdPressure && pressureLabel">
                <span class="text-2xl font-bold" :class="pressureLabel.color">{{ pressureLabel.text }}</span>
                <TrendIndicator :trend="crowdPressure.trend" :velocity="crowdPressure.pressure_score" />
              </template>
              <span v-else class="text-2xl font-bold text-muted">&mdash;</span>
            </div>
          </UCard>
        </div>

        <!-- Wait Times Table -->
        <UTable
          :data="sortedAttractions"
          :columns="columns"
          :loading="status === 'pending'"
          sticky
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
