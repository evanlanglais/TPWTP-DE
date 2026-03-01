import type { Destination, Park, Attraction } from '~/types'

export function useDestinations() {
  return useFetch<(Destination & { park_count: number })[]>('/api/destinations')
}

export function useParks(destinationId?: Ref<string | null>) {
  return useFetch<(Park & { destination_name: string; attraction_count: number })[]>('/api/parks', {
    query: computed(() => ({
      destinationId: destinationId?.value || undefined
    })),
    watch: destinationId ? [destinationId] : undefined
  })
}

export function usePark(parkId: Ref<string>) {
  return useFetch<Park & { destinations: { name: string } }>(() => `/api/parks/${parkId.value}`, {
    watch: [parkId]
  })
}

export function useAttractions(parkId: Ref<string>) {
  return useAsyncData(
    () => `attractions-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<Attraction[]>(`/api/parks/${parkId.value}/attractions`)
    },
    { watch: [parkId] }
  )
}
