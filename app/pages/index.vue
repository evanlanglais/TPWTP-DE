<script setup lang="ts">
import type { ParkSummary } from '~/types'

const { data: parks, status, refresh: refreshParks } = useParksSummary()

const router = useRouter()

// Auto-refresh
const autoRefresh = ref(true)

useIntervalFn(() => {
  if (!autoRefresh.value) return
  refreshParks()
}, 60_000)

function pressureLabel(park: ParkSummary) {
  if (!park.crowd_pressure) return null
  const ema = park.crowd_pressure.pressure_ema
  if (ema > 1) return { text: 'High', color: 'error' as const }
  if (ema > 0.3) return { text: 'Moderate', color: 'warning' as const }
  if (ema > -0.3) return { text: 'Normal', color: 'success' as const }
  return { text: 'Low', color: 'info' as const }
}

function operatingLabel(park: ParkSummary) {
  if (!park.crowd_pressure) return `${park.attraction_count} rides`
  return `${park.crowd_pressure.operating_count}/${park.attraction_count} rides operating`
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar :toggle="false">
        <template #left>
          <NuxtLink to="/" class="flex items-center">
            <LogoFull :scale="0.5" />
          </NuxtLink>
        </template>
        <template #right>
          <USwitch v-model="autoRefresh" label="Auto-refresh" size="xs" />
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div v-if="status === 'pending' && !parks" class="flex items-center justify-center h-full">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>

      <div v-else-if="parks?.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="park in parks"
          :key="park.id"
          class="cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
          @click="router.push(`/parks/${park.id}`)"
        >
          <div class="flex flex-col gap-3">
            <div>
              <h3 class="text-lg font-semibold truncate">{{ park.name }}</h3>
              <p class="text-sm text-muted truncate">{{ park.destination_name }}</p>
            </div>

            <div class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-ticket" class="size-4" />
              <span>{{ operatingLabel(park) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <UBadge
                v-if="pressureLabel(park)"
                :color="pressureLabel(park)!.color"
                variant="subtle"
                :label="pressureLabel(park)!.text"
              />
              <span v-else class="text-sm text-muted">&mdash;</span>

              <span v-if="park.crowd_pressure" class="text-sm font-medium">
                {{ Math.round(park.crowd_pressure.avg_wait) }} min avg
              </span>
            </div>
          </div>
        </UCard>
      </div>

      <div v-else class="flex flex-col items-center justify-center h-full gap-4 text-muted">
        <UIcon name="i-lucide-ferris-wheel" class="size-16" />
        <p class="text-lg">No parks found</p>
      </div>
    </template>
  </UDashboardPanel>
</template>
