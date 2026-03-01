<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn } from '@nuxt/ui'

type ParkRow = {
  id: string
  name: string
  timezone: string
  destination_name: string
  attraction_count: number
}

const { data: parks, status } = useParks()

const searchQuery = ref('')

const filteredParks = computed(() => {
  if (!parks.value) return []
  if (!searchQuery.value) return parks.value
  const q = searchQuery.value.toLowerCase()
  return parks.value.filter(p =>
    p.name.toLowerCase().includes(q) || p.destination_name.toLowerCase().includes(q)
  )
})

const columns: TableColumn<ParkRow>[] = [
  {
    accessorKey: 'name',
    header: 'Park Name'
  },
  {
    accessorKey: 'destination_name',
    header: 'Destination'
  },
  {
    accessorKey: 'timezone',
    header: 'Timezone',
    meta: {
      class: {
        td: 'text-muted'
      }
    }
  },
  {
    accessorKey: 'attraction_count',
    header: '# Attractions',
    meta: {
      class: {
        th: 'text-right',
        td: 'text-right font-medium'
      }
    }
  }
]

const router = useRouter()

function onRowClick(_e: Event, row: any) {
  router.push(`/parks/${row.original.id}`)
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Parks & Attractions" icon="i-lucide-map-pin">
        <template #right>
          <UInput
            v-model="searchQuery"
            placeholder="Search parks..."
            icon="i-lucide-search"
            class="w-64"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UTable
        :data="filteredParks"
        :columns="columns"
        :loading="status === 'pending'"
        sticky
        class="cursor-pointer"
        @select="onRowClick"
      />
    </template>
  </UDashboardPanel>
</template>
