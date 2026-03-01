<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const navigationItems: NavigationMenuItem[] = [
  {
    label: 'Live Wait Times',
    icon: 'i-lucide-timer',
    to: '/'
  },
  {
    label: 'Parks & Attractions',
    icon: 'i-lucide-map-pin',
    to: '/parks'
  },
  {
    label: 'Data Explorer',
    icon: 'i-lucide-chart-line',
    to: '/explorer'
  }
]
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <div v-if="!collapsed" class="flex items-center gap-2">
          <UIcon name="i-lucide-ferris-wheel" class="size-6 text-primary" />
          <span class="text-lg font-bold">Park Predictor</span>
        </div>
        <UIcon v-else name="i-lucide-ferris-wheel" class="size-6 text-primary mx-auto" />
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="navigationItems"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <UColorModeButton :class="collapsed ? 'mx-auto' : ''" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
