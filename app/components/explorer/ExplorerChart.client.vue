<script setup lang="ts">
import { VisXYContainer, VisLine, VisAxis, VisCrosshair, VisTooltip, VisPlotline } from '@unovis/vue'
import type { WaitTime, WaitVelocity, StatusTransition } from '~/types'

const props = defineProps<{
  data: WaitTime[]
  attractionNames: Record<string, string>
  timezone?: string | null
  velocityData?: WaitVelocity[]
  transitions?: (StatusTransition & { attraction_name: string })[]
}>()

const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316']

const attractionIds = computed(() => {
  const ids = new Set<string>()
  for (const d of props.data) {
    ids.add(d.attraction_id)
  }
  return Array.from(ids)
})

type ChartPoint = {
  timestamp: number
  [key: string]: number | undefined
}

// Build a lookup map for velocity data: "timestamp_attractionId" -> velocity_ema
const velocityLookup = computed(() => {
  const map = new Map<string, WaitVelocity>()
  if (!props.velocityData) return map
  for (const v of props.velocityData) {
    const ts = new Date(v.timestamp).getTime()
    map.set(`${ts}_${v.attraction_id}`, v)
  }
  return map
})

// Track which (timestamp, attractionId) pairs have non-operating data
const downAt = computed(() => {
  const set = new Set<string>()
  for (const d of props.data) {
    if (d.status !== 'OPERATING' || d.standby_wait == null) {
      set.add(`${new Date(d.timestamp).getTime()}_${d.attraction_id}`)
    }
  }
  return set
})

const chartData = computed(() => {
  const byTime = new Map<number, ChartPoint>()

  for (const d of props.data) {
    const ts = new Date(d.timestamp).getTime()
    if (!byTime.has(ts)) {
      byTime.set(ts, { timestamp: ts })
    }
    // Only set value for OPERATING with a valid wait time
    if (d.status === 'OPERATING' && d.standby_wait != null) {
      byTime.get(ts)![d.attraction_id] = d.standby_wait
    }
    // Non-operating or null wait → left as undefined (creates gap in solid line)
  }

  return Array.from(byTime.values()).sort((a, b) => a.timestamp - b.timestamp)
})

const x = (d: ChartPoint) => d.timestamp
const yAccessors = computed(() =>
  attractionIds.value.map(id => (d: ChartPoint) => d[id] as number | undefined)
)

const colorAccessor = (i: number) => colors[i % colors.length]
const dashColorAccessor = (i: number) => `${colors[i % colors.length]}99`

function formatTime(ts: number) {
  return new Date(ts).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: props.timezone || undefined
  })
}

function findClosestVelocity(ts: number, attractionId: string): WaitVelocity | null {
  // Exact match first
  const exact = velocityLookup.value.get(`${ts}_${attractionId}`)
  if (exact) return exact

  // Find closest within 10 minutes
  if (!props.velocityData) return null
  let closest: WaitVelocity | null = null
  let minDiff = 10 * 60 * 1000
  for (const v of props.velocityData) {
    if (v.attraction_id !== attractionId) continue
    const diff = Math.abs(new Date(v.timestamp).getTime() - ts)
    if (diff < minDiff) {
      minDiff = diff
      closest = v
    }
  }
  return closest
}

function formatVelocityInline(vel: WaitVelocity | null): string {
  if (!vel || vel.velocity_ema == null) return ''
  const sign = vel.velocity_ema > 0 ? '+' : ''
  const value = Math.round(vel.velocity_ema)
  const color = vel.velocity_ema > 0 ? '#ef4444' : vel.velocity_ema < 0 ? '#22c55e' : '#9ca3af'
  return ` <span style="color:${color}">${sign}${value}/int</span>`
}

function tooltipTemplate(d: ChartPoint) {
  let html = `<div class="text-xs font-medium mb-1">${formatTime(d.timestamp)}</div>`
  for (let i = 0; i < attractionIds.value.length; i++) {
    const id = attractionIds.value[i]
    const val = d[id]
    const name = props.attractionNames[id] || id.slice(0, 8)
    const color = colors[i % colors.length]
    const isDown = downAt.value.has(`${d.timestamp}_${id}`)

    let display: string
    if (val != null) {
      const vel = findClosestVelocity(d.timestamp, id)
      display = `${val} min${formatVelocityInline(vel)}`
    } else if (isDown) {
      display = 'Down'
    } else {
      display = '\u2014'
    }

    html += `<div class="flex items-center gap-2 text-xs">
      <span class="inline-block w-2 h-2 rounded-full" style="background:${color}"></span>
      <span>${name}: ${display}</span>
    </div>`
  }
  return html
}

type TransitionMarker = {
  timestamp: number
  label: string
  color: string
  isClosure: boolean
}

const transitionMarkers = computed<TransitionMarker[]>(() => {
  if (!props.transitions?.length) return []
  return props.transitions.map((t) => {
    const isClosure = t.new_status !== 'OPERATING'
    return {
      timestamp: new Date(t.transition_time).getTime(),
      label: `${t.attraction_name} ${isClosure ? '\u25BC' : '\u25B2'}`,
      color: isClosure ? '#ef4444' : '#22c55e',
      isClosure
    }
  })
})

const hasClosures = computed(() => transitionMarkers.value.some(m => m.isClosure))
const hasReopenings = computed(() => transitionMarkers.value.some(m => !m.isClosure))
</script>

<template>
  <div v-if="chartData.length" class="w-full h-[400px]">
    <VisXYContainer :data="chartData" :yDomain="[0, undefined]" :margin="{ top: 10, right: 10, bottom: 40, left: 50 }">
      <!-- Dashed bridge lines (behind solid, interpolates through gaps) -->
      <VisLine
        v-for="(yFn, i) in yAccessors"
        :key="`${attractionIds[i]}_dash`"
        :x="x"
        :y="yFn"
        :color="dashColorAccessor(i)"
        :lineDashArray="[6, 4]"
        :lineWidth="1.5"
        :interpolateMissingData="true"
        :curveType="'linear'"
      />
      <!-- Solid lines (on top, gaps where ride is down) -->
      <VisLine
        v-for="(yFn, i) in yAccessors"
        :key="attractionIds[i]"
        :x="x"
        :y="yFn"
        :color="colorAccessor(i)"
        :curveType="'linear'"
      />
      <VisAxis
        type="x"
        :x="x"
        :tick-format="(v: number) => formatTime(v)"
        :num-ticks="6"
        label="Time"
      />
      <VisAxis type="y" label="Wait (min)" />
      <VisPlotline
        v-for="(marker, i) in transitionMarkers"
        :key="`transition-${i}`"
        axis="x"
        :value="marker.timestamp"
        :color="marker.color"
        :lineStyle="[6, 4]"
        :lineWidth="1"
        :labelText="marker.label"
        labelOrientation="vertical"
        labelPosition="top"
        :labelColor="marker.color"
        :labelSize="10"
      />
      <VisCrosshair :template="tooltipTemplate" />
      <VisTooltip />
    </VisXYContainer>

    <!-- Legend -->
    <div class="flex flex-wrap gap-4 mt-4 justify-center">
      <div
        v-for="(id, i) in attractionIds"
        :key="id"
        class="flex items-center gap-2 text-sm"
      >
        <span class="inline-block w-3 h-3 rounded-full" :style="{ background: colors[i % colors.length] }" />
        <span>{{ attractionNames[id] || id.slice(0, 8) }}</span>
      </div>
      <div v-if="hasClosures" class="flex items-center gap-2 text-sm">
        <span class="inline-block w-3 border-l-2 border-dashed h-3" style="border-color: #ef4444" />
        <span class="text-[#ef4444]">Closure</span>
      </div>
      <div v-if="hasReopenings" class="flex items-center gap-2 text-sm">
        <span class="inline-block w-3 border-l-2 border-dashed h-3" style="border-color: #22c55e" />
        <span class="text-[#22c55e]">Reopening</span>
      </div>
    </div>
  </div>

  <div v-else class="flex items-center justify-center h-[400px] text-muted">
    <p>No data to display. Select attractions and a date range.</p>
  </div>
</template>

<style scoped>
:deep(.unovis-axis-grid-line line) {
  stroke: var(--ui-border);
}
</style>
