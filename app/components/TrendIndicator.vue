<script setup lang="ts">
import type { VelocityTrend } from '~/types'

const props = defineProps<{
  trend: VelocityTrend | null
  velocity: number | null
}>()

const icon = computed(() => {
  switch (props.trend) {
    case 'RISING': return 'i-lucide-trending-up'
    case 'FALLING': return 'i-lucide-trending-down'
    case 'STABLE': return 'i-lucide-minus'
    default: return null
  }
})

const color = computed(() => {
  switch (props.trend) {
    case 'RISING': return 'text-error'
    case 'FALLING': return 'text-success'
    case 'STABLE': return 'text-muted'
    default: return 'text-muted'
  }
})

const label = computed(() => {
  if (props.velocity == null) return null
  const sign = props.velocity > 0 ? '+' : ''
  return `${sign}${Math.round(props.velocity)} min/int`
})
</script>

<template>
  <span v-if="icon" class="inline-flex items-center gap-1" :class="color">
    <UIcon :name="icon" class="size-4" />
    <span v-if="label" class="text-xs">{{ label }}</span>
  </span>
  <span v-else class="text-muted">&mdash;</span>
</template>
