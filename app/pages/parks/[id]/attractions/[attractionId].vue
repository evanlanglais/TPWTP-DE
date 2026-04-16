<script setup lang="ts">
const route = useRoute()
const router = useRouter()

const parkId = computed(() => route.params.id as string)
const attractionId = computed(() => route.params.attractionId as string)

function todayInTimezone(timezone?: string | null): string {
  return new Date().toLocaleDateString('en-CA', timezone ? { timeZone: timezone } : undefined)
}

// Read initial state from query params — default to today (local time until park tz loads)
const hasQueryDates = !!(route.query.startDate || route.query.endDate)
const startDate = ref<string>(
  (route.query.startDate as string) || todayInTimezone()
)
const endDate = ref<string>(
  (route.query.endDate as string) || todayInTimezone()
)
const compareIds = ref<string[]>(
  route.query.compare
    ? (route.query.compare as string).split(',').filter(Boolean)
    : []
)

// All attraction IDs to fetch (primary + comparisons), deduplicated
const allAttractionIds = computed(() => {
  const ids = new Set([attractionId.value, ...compareIds.value])
  return Array.from(ids)
})

// Data fetching
const { data: park } = usePark(parkId)
const { data: attractionsList } = useAttractions(parkId)
const { data: liveData, refresh: refreshLive } = useLiveWaitTimesWithVelocity(parkId)

// Current attraction live info
const currentAttraction = computed(() => {
  if (!liveData.value) return null
  return liveData.value.find(a => a.id === attractionId.value) ?? null
})

const currentWait = computed(() => currentAttraction.value?.wait_times[0] ?? null)
const currentVelocity = computed(() => currentAttraction.value?.l2_wait_velocity?.[0] ?? null)

// Timezone handling
const parkTimezone = computed(() => park.value?.timezone ?? null)

// Correct default dates to park timezone once loaded
watch(parkTimezone, (tz) => {
  if (tz && !hasQueryDates) {
    const today = todayInTimezone(tz)
    startDate.value = today
    endDate.value = today
  }
}, { once: true })

function getTimezoneOffset(timezone: string, refDate: Date): number {
  const utc = new Date(refDate.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tz = new Date(refDate.toLocaleString('en-US', { timeZone: timezone }))
  return tz.getTime() - utc.getTime()
}

function parkTimeToUTC(dateStr: string, time: string, timezone: string): string {
  const ref = new Date(`${dateStr}T12:00:00Z`)
  const offset = getTimezoneOffset(timezone, ref)
  const naive = new Date(`${dateStr}T${time}Z`)
  return new Date(naive.getTime() - offset).toISOString()
}

const timezoneShort = computed(() => {
  if (!parkTimezone.value) return null
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: parkTimezone.value,
      timeZoneName: 'short'
    }).formatToParts(new Date())
    return parts.find(p => p.type === 'timeZoneName')?.value ?? parkTimezone.value
  }
  catch {
    return parkTimezone.value
  }
})

const startDateISO = computed(() => {
  if (!startDate.value || !parkTimezone.value) return null
  return parkTimeToUTC(startDate.value, '00:00:00', parkTimezone.value)
})

const endDateISO = computed(() => {
  if (!endDate.value || !parkTimezone.value) return null
  return parkTimeToUTC(endDate.value, '23:59:59', parkTimezone.value)
})

// Historic data
const { data: waitTimes, status, refresh: refreshWaitTimes } = useHistoricWaitTimes(parkId, allAttractionIds, startDateISO, endDateISO)
const { data: velocityData, refresh: refreshVelocity } = useHistoricVelocity(parkId, allAttractionIds, startDateISO, endDateISO)
const { data: transitionData, refresh: refreshTransitions } = useHistoricTransitions(parkId, allAttractionIds, startDateISO, endDateISO)

// Attraction name lookup
const attractionNames = computed(() => {
  const map: Record<string, string> = {}
  if (attractionsList.value) {
    for (const a of attractionsList.value) {
      map[a.id] = a.name
    }
  }
  return map
})

const currentAttractionName = computed(() =>
  attractionNames.value[attractionId.value] ?? 'Attraction'
)

// Comparison select items (exclude current attraction)
const compareItems = computed(() => {
  if (!attractionsList.value) return []
  return attractionsList.value
    .filter(a => a.id !== attractionId.value)
    .map(a => ({ label: a.name, value: a.id }))
})

// Breadcrumbs
const breadcrumbItems = computed(() => [
  { label: 'Home', icon: 'i-lucide-home', to: '/' },
  { label: park.value?.name ?? 'Park', to: `/parks/${parkId.value}` },
  { label: currentAttractionName.value }
])

// URL sync — use replace to avoid polluting history
watch([startDate, endDate, compareIds], () => {
  const query: Record<string, string> = {}
  if (startDate.value) query.startDate = startDate.value
  if (endDate.value) query.endDate = endDate.value
  if (compareIds.value.length) query.compare = compareIds.value.join(',')
  router.replace({ query })
}, { deep: true })

// Summary stats
const operatingPoints = computed(() =>
  waitTimes.value?.filter(w => w.status === 'OPERATING') ?? []
)

const avgWait = computed(() => {
  const waits = operatingPoints.value
    .filter(w => w.standby_wait != null)
    .map(w => w.standby_wait!)
  if (!waits.length) return 0
  return Math.round(waits.reduce((a, b) => a + b, 0) / waits.length)
})

const maxWait = computed(() => {
  const waits = operatingPoints.value
    .filter(w => w.standby_wait != null)
    .map(w => w.standby_wait!)
  return waits.length ? Math.max(...waits) : 0
})

const maxVelocity = computed(() => {
  if (!velocityData.value?.length) return 0
  const vels = velocityData.value
    .filter(v => v.velocity_ema != null)
    .map(v => Math.abs(v.velocity_ema!))
  return vels.length ? Math.round(Math.max(...vels)) : 0
})

const dataPointCount = computed(() => waitTimes.value?.length ?? 0)

const chartXDomain = computed<[number, number] | undefined>(() => {
  if (!startDateISO.value || !endDateISO.value) return undefined
  return [
    new Date(startDateISO.value).getTime(),
    new Date(endDateISO.value).getTime()
  ]
})

// Auto-refresh
const autoRefresh = ref(true)

useIntervalFn(() => {
  if (!autoRefresh.value) return
  refreshLive()
  refreshWaitTimes()
  refreshVelocity()
  refreshTransitions()
}, 60_000)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false">
        <template #left>
          <NuxtLink to="/" class="flex items-center shrink-0">
            <LogoIcon />
          </NuxtLink>
          <USeparator orientation="vertical" class="h-6 mx-2" />
          <UBreadcrumb :items="breadcrumbItems" />
        </template>
        <template #right>
          <div class="flex items-center gap-2">
            <USwitch v-model="autoRefresh" label="Auto-refresh" size="xs" />
            <USelectMenu
              v-model="compareIds"
              :items="compareItems"
              value-key="value"
              multiple
              placeholder="Compare..."
              class="w-56"
            />
            <UInput
              v-model="startDate"
              type="date"
              class="w-40"
            />
            <span class="text-muted">to</span>
            <UInput
              v-model="endDate"
              type="date"
              class="w-40"
            />
          </div>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-6">
        <!-- Attraction Header -->
        <div class="flex items-center gap-4">
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold truncate">{{ currentAttractionName }}</h2>
            <p class="text-sm text-muted">{{ park?.name }}</p>
          </div>
          <div class="flex items-center gap-3 shrink-0">
            <StatusBadge v-if="currentWait" :status="currentWait.status" />
            <WaitTimeDisplay
              v-if="currentWait"
              :minutes="currentWait.standby_wait"
              :status="currentWait.status"
            />
            <TrendIndicator
              :trend="currentVelocity?.trend ?? null"
              :velocity="currentVelocity?.velocity_ema ?? null"
            />
          </div>
        </div>

        <!-- Chart -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold">Wait Time History</h3>
                <UBadge v-if="timezoneShort" color="info" variant="subtle" :label="timezoneShort" />
              </div>
              <UBadge v-if="status === 'pending'" color="neutral" variant="subtle" label="Loading..." />
            </div>
          </template>

          <ExplorerChart
            :data="waitTimes ?? []"
            :attraction-names="attractionNames"
            :timezone="parkTimezone"
            :velocity-data="velocityData ?? []"
            :transitions="transitionData ?? []"
            :x-domain="chartXDomain"
          />
        </UCard>

        <!-- Summary Stats -->
        <div v-if="waitTimes?.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Data Points</span>
              <span class="text-2xl font-bold">{{ dataPointCount.toLocaleString() }}</span>
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
              <span class="text-sm text-muted">Peak Wait</span>
              <span class="text-2xl font-bold text-error">{{ maxWait }} min</span>
            </div>
          </UCard>
          <UCard>
            <div class="flex flex-col gap-1">
              <span class="text-sm text-muted">Max Velocity</span>
              <span class="text-2xl font-bold text-warning">{{ maxVelocity }} min/int</span>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
