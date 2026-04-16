import type { AttractionWithLatestWaitAndVelocity, WaitVelocity, StatusTransition } from '~/types'

export function useLiveWaitTimesWithVelocity(parkId: Ref<string | null>) {
  return useAsyncData(
    () => `live-velocity-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<AttractionWithLatestWaitAndVelocity[]>(`/api/parks/${parkId.value}/l1/live`)
    },
    { watch: [parkId] }
  )
}

export function useRecentTransitions(parkId: Ref<string | null>, limit = 20) {
  return useAsyncData(
    () => `transitions-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<(StatusTransition & { attraction_name: string })[]>(`/api/parks/${parkId.value}/l2/transitions`, {
        query: { limit }
      })
    },
    { watch: [parkId] }
  )
}

export function useHistoricVelocity(
  parkId: Ref<string | null>,
  attractionIds: Ref<string[]>,
  startDate: Ref<string | null>,
  endDate: Ref<string | null>
) {
  return useAsyncData(
    () => `historic-velocity-${attractionIds.value.join(',')}-${startDate.value}-${endDate.value}`,
    () => {
      if (!parkId.value || !attractionIds.value.length || !startDate.value || !endDate.value) return null

      return $fetch<WaitVelocity[]>(`/api/parks/${parkId.value}/l2/velocity`, {
        query: {
          attractionIds: attractionIds.value.join(','),
          startDate: startDate.value,
          endDate: endDate.value
        }
      })
    },
    { watch: [parkId, attractionIds, startDate, endDate] }
  )
}

export function useHistoricTransitions(
  parkId: Ref<string | null>,
  attractionIds: Ref<string[]>,
  startDate: Ref<string | null>,
  endDate: Ref<string | null>
) {
  return useAsyncData(
    () => `historic-transitions-${attractionIds.value.join(',')}-${startDate.value}-${endDate.value}`,
    () => {
      if (!parkId.value || !attractionIds.value.length || !startDate.value || !endDate.value) return null

      return $fetch<(StatusTransition & { attraction_name: string })[]>(`/api/parks/${parkId.value}/l2/transitions`, {
        query: {
          attractionIds: attractionIds.value.join(','),
          startDate: startDate.value,
          endDate: endDate.value
        }
      })
    },
    { watch: [parkId, attractionIds, startDate, endDate] }
  )
}
