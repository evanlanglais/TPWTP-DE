<script setup lang="ts">
const props = defineProps<{
  minutes: number | null
  status?: string
}>()

const displayValue = computed(() => {
  if (props.status && props.status !== 'OPERATING') return '\u2014'
  if (props.minutes === null || props.minutes === undefined) return '\u2014'
  return `${props.minutes} min`
})

const colorClass = computed(() => {
  if (props.minutes === null || props.minutes === undefined) return 'text-muted'
  if (props.minutes <= 15) return 'text-success'
  if (props.minutes <= 45) return 'text-warning'
  return 'text-error'
})
</script>

<template>
  <span :class="['font-medium', colorClass]">{{ displayValue }}</span>
</template>
