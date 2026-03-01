import type { WaitTime } from '~/types'

export function useHistoricWaitTimes(
  attractionIds: Ref<string[]>,
  startDate: Ref<string | null>,
  endDate: Ref<string | null>
) {
  return useAsyncData(
    () => `historic-${attractionIds.value.join(',')}-${startDate.value}-${endDate.value}`,
    () => {
      if (!attractionIds.value.length || !startDate.value || !endDate.value) return null

      return $fetch<WaitTime[]>('/api/wait-times', {
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
