<script setup lang="ts">
</script>

<template>
  <UDashboardGroup>
    <UDashboardSidebar collapsible resizable>
      <template #header="{ collapsed }">
        <NuxtLink to="/" class="flex items-center gap-2">
          <UIcon name="i-lucide-ferris-wheel" class="size-6 text-primary" :class="collapsed ? 'mx-auto' : ''" />
          <span v-if="!collapsed" class="text-lg font-bold">Park Predictor</span>
        </NuxtLink>
      </template>

      <template #default />

      <template #footer="{ collapsed }">
        <UColorModeButton :class="collapsed ? 'mx-auto' : ''" />
      </template>
    </UDashboardSidebar>

    <slot />
  </UDashboardGroup>
</template>
