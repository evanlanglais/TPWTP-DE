<script setup lang="ts">
defineProps<{
  error: {
    statusCode: number
    message: string
  }
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen gap-4">
    <UIcon name="i-lucide-alert-triangle" class="size-16 text-error" />
    <h1 class="text-4xl font-bold">{{ error.statusCode }}</h1>
    <p class="text-lg text-muted">{{ error.message }}</p>
    <UButton label="Go Home" to="/" color="primary" />
  </div>
</template>
