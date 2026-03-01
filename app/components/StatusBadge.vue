<script setup lang="ts">
import type { WaitTimeStatus } from '~/types'

const props = defineProps<{
  status: WaitTimeStatus
}>()

const colorMap: Record<WaitTimeStatus, 'success' | 'neutral' | 'error' | 'warning'> = {
  OPERATING: 'success',
  CLOSED: 'neutral',
  DOWN: 'error',
  REFURBISHMENT: 'warning'
}

const labelMap: Record<WaitTimeStatus, string> = {
  OPERATING: 'Operating',
  CLOSED: 'Closed',
  DOWN: 'Down',
  REFURBISHMENT: 'Refurb'
}
</script>

<template>
  <UBadge :color="colorMap[props.status]" variant="subtle" :label="labelMap[props.status]" />
</template>
