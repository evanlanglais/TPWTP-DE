<script setup lang="ts">
import { format, subDays } from 'date-fns'

const route = useRoute()

const selectedParkId = ref<string | null>((route.query.parkId as string) || null)
const selectedAttractionIds = ref<string[]>(
  route.query.attractionIds
    ? Array.isArray(route.query.attractionIds)
      ? (route.query.attractionIds as string[])
      : [route.query.attractionIds as string]
    : []
)
const startDate = ref<string | null>((route.query.startDate as string) || format(subDays(new Date(), 1), 'yyyy-MM-dd'))
const endDate = ref<string | null>((route.query.endDate as string) || format(new Date(), 'yyyy-MM-dd'))

const { data: parks } = useParks()
const { data: attractionsList } = useAttractions(computed(() => selectedParkId.value ?? ''))

const selectedParkTimezone = computed(() => {
  if (!selectedParkId.value || !parks.value) return null
  return parks.value.find(p => p.id === selectedParkId.value)?.timezone ?? null
})

const timezoneShort = computed(() => {
  if (!selectedParkTimezone.value) return null
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: selectedParkTimezone.value,
      timeZoneName: 'short'
    }).formatToParts(new Date())
    return parts.find(p => p.type === 'timeZoneName')?.value ?? selectedParkTimezone.value
  }
  catch {
    return selectedParkTimezone.value
  }
})

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

const attractionItems = computed(() => {
  if (!attractionsList.value) return []
  return attractionsList.value.map(a => ({ label: a.name, value: a.id }))
})

const attractionNames = computed(() => {
  const map: Record<string, string> = {}
  if (attractionsList.value) {
    for (const a of attractionsList.value) {
      map[a.id] = a.name
    }
  }
  return map
})

const startDateISO = computed(() => {
  if (!startDate.value) return null
  if (selectedParkTimezone.value) return parkTimeToUTC(startDate.value, '00:00:00', selectedParkTimezone.value)
  return `${startDate.value}T00:00:00Z`
})
const endDateISO = computed(() => {
  if (!endDate.value) return null
  if (selectedParkTimezone.value) return parkTimeToUTC(endDate.value, '23:59:59', selectedParkTimezone.value)
  return `${endDate.value}T23:59:59Z`
})

const { data: waitTimes, status } = useHistoricWaitTimes(
  selectedAttractionIds,
  startDateISO,
  endDateISO
)

const { data: velocityData } = useHistoricVelocity(
  selectedAttractionIds,
  startDateISO,
  endDateISO
)

// Reset attractions when park changes
watch(selectedParkId, () => {
  selectedAttractionIds.value = []
})

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
    .filter(v => v.velocity != null)
    .map(v => Math.abs(v.velocity!))
  return vels.length ? Math.round(Math.max(...vels)) : 0
})

const dataPointCount = computed(() => waitTimes.value?.length ?? 0)
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Data Explorer" icon="i-lucide-chart-line">
        <template #right>
          <div class="flex items-center gap-2">
            <ParkSelector v-model="selectedParkId" />

            <USelectMenu
              v-model="selectedAttractionIds"
              :items="attractionItems"
              value-key="value"
              multiple
              placeholder="Select attractions..."
              class="w-64"
              :disabled="!selectedParkId"
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
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="!selectedParkId" class="flex flex-col items-center justify-center h-full gap-4 text-muted">
        <UIcon name="i-lucide-chart-line" class="size-16" />
        <p class="text-lg">Select a park and attractions to explore historical data</p>
      </div>

      <div v-else class="flex flex-col gap-6">
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
            :timezone="selectedParkTimezone"
            :velocity-data="velocityData ?? []"
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
