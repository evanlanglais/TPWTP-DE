import type { WaitTime } from '~/types'

export function useHistoricWaitTimes(
  parkId: Ref<string | null>,
  attractionIds: Ref<string[]>,
  startDate: Ref<string | null>,
  endDate: Ref<string | null>
) {
  return useAsyncData(
    () => `historic-${attractionIds.value.join(',')}-${startDate.value}-${endDate.value}`,
    () => {
      if (!parkId.value || !attractionIds.value.length || !startDate.value || !endDate.value) return null

      return $fetch<WaitTime[]>(`/api/parks/${parkId.value}/l1/wait-times`, {
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
