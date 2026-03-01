<script setup lang="ts">
const model = defineModel<string | null>({ default: null })

const { data: parks, status } = useParks()

const items = computed(() => {
  if (!parks.value) return []

  const grouped = new Map<string, { label: string, value: string }[]>()
  for (const park of parks.value) {
    const dest = park.destination_name || 'Other'
    if (!grouped.has(dest)) grouped.set(dest, [])
    grouped.get(dest)!.push({ label: park.name, value: park.id })
  }

  return Array.from(grouped.entries()).map(([label, children]) => ({
    label,
    type: 'label' as const,
    children
  }))
})

const flatItems = computed(() => {
  if (!parks.value) return []
  return parks.value.map(p => ({ label: p.name, value: p.id }))
})

const selectedLabel = computed(() => {
  if (!model.value || !parks.value) return undefined
  return parks.value.find(p => p.id === model.value)?.name
})
</script>

<template>
  <USelectMenu
    v-model="model"
    :items="flatItems"
    value-key="value"
    placeholder="Select a park..."
    class="w-64"
    :loading="status === 'pending'"
  />
</template>
