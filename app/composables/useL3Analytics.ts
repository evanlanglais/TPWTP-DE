import type { CrowdPressure, TransitionImpactWithNames, CorrelationPairWithNames } from '~/types'

export function useCrowdPressure(parkId: Ref<string | null>) {
  return useAsyncData(
    () => `crowd-pressure-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<CrowdPressure | null>(`/api/parks/${parkId.value}/crowd-pressure`)
    },
    { watch: [parkId] }
  )
}

export function useTransitionImpacts(parkId: Ref<string | null>, transitionIds?: Ref<number[]>) {
  return useAsyncData(
    () => `transition-impacts-${parkId.value}-${transitionIds?.value?.join(',')}`,
    () => {
      if (!parkId.value) return null
      const query: Record<string, string> = {}
      if (transitionIds?.value?.length) {
        query.transitionIds = transitionIds.value.join(',')
      }
      return $fetch<TransitionImpactWithNames[]>(`/api/parks/${parkId.value}/closure-impacts`, { query })
    },
    { watch: transitionIds ? [parkId, transitionIds] : [parkId] }
  )
}

export function useCorrelationPairs(parkId: Ref<string | null>) {
  return useAsyncData(
    () => `correlations-${parkId.value}`,
    () => {
      if (!parkId.value) return null
      return $fetch<CorrelationPairWithNames[]>(`/api/parks/${parkId.value}/correlations`)
    },
    { watch: [parkId] }
  )
}
