import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const { startDate, endDate, transitionIds } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const selectCols = 'id, transition_id, event_type, transitioned_attraction, impacted_attraction, park_id, transition_time, velocity_before, velocity_after, velocity_delta, baseline_delta, excess_delta, wait_before, wait_after, wait_delta, absorption_score, drain_score, transitioned:attractions!l3_transition_impact_transitioned_attraction_fkey(name), impacted:attractions!l3_transition_impact_impacted_attraction_fkey(name)'

  const mapRow = (row: any) => ({
    id: row.id,
    transition_id: row.transition_id,
    event_type: row.event_type,
    transitioned_attraction: row.transitioned_attraction,
    impacted_attraction: row.impacted_attraction,
    park_id: row.park_id,
    transition_time: row.transition_time,
    velocity_before: row.velocity_before,
    velocity_after: row.velocity_after,
    velocity_delta: row.velocity_delta,
    baseline_delta: row.baseline_delta,
    excess_delta: row.excess_delta,
    wait_before: row.wait_before,
    wait_after: row.wait_after,
    wait_delta: row.wait_delta,
    absorption_score: row.absorption_score,
    drain_score: row.drain_score,
    transitioned_attraction_name: row.transitioned?.name ?? '',
    impacted_attraction_name: row.impacted?.name ?? ''
  })

  let query = client
    .from('l3_transition_impact')
    .select(selectCols)
    .eq('park_id', id)

  if (startDate && endDate) {
    query = query
      .gte('transition_time', startDate as string)
      .lte('transition_time', endDate as string)
      .order('transition_time', { ascending: true })
  }

  if (transitionIds) {
    const ids = String(transitionIds).split(',').map(Number).filter(n => !isNaN(n))
    if (ids.length) {
      query = query.in('transition_id', ids)
    }
  }

  if (!startDate && !transitionIds) {
    query = query.order('transition_time', { ascending: false }).limit(50)
  }

  const { data, error } = await query

  if (error) throw createError({ statusCode: 500, message: error.message })
  return (data as any[]).map(mapRow)
})
