import type { AttractionWithLatestWaitAndVelocity, WaitVelocity, StatusTransition } from '~/types'

export function useLiveWaitTimesWithVelocity(parkId: Ref<string | null>) {
  return useAsyncData(
    () => `live-velocity-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<AttractionWithLatestWaitAndVelocity[]>(`/api/parks/${parkId.value}/live`)
    },
    { watch: [parkId] }
  )
}

export function useRecentTransitions(parkId: Ref<string | null>, limit = 20) {
  return useAsyncData(
    () => `transitions-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<(StatusTransition & { attraction_name: string })[]>(`/api/parks/${parkId.value}/transitions`, {
        query: { limit }
      })
    },
    { watch: [parkId] }
  )
}

export function useHistoricVelocity(
  attractionIds: Ref<string[]>,
  startDate: Ref<string | null>,
  endDate: Ref<string | null>
) {
  return useAsyncData(
    () => `historic-velocity-${attractionIds.value.join(',')}-${startDate.value}-${endDate.value}`,
    () => {
      if (!attractionIds.value.length || !startDate.value || !endDate.value) return null

      return $fetch<WaitVelocity[]>('/api/velocity', {
        query: {
          attractionIds: attractionIds.value.join(','),
          startDate: startDate.value,
          endDate: endDate.value
        }
      })
    },
    { watch: [attractionIds, startDate, endDate] }
  )
}
