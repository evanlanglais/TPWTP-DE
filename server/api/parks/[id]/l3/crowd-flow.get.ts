export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const { startDate, endDate, transitionIds } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const params: unknown[] = [id]
  const conditions = ['i.park_id = $1']
  let orderBy = ''
  let limit = MAX_ROWS

  if (startDate && endDate) {
    params.push(startDate, endDate)
    conditions.push(`i.transition_time >= $${params.length - 1}`, `i.transition_time <= $${params.length}`)
    orderBy = 'ORDER BY i.transition_time ASC'
  }

  if (transitionIds) {
    const ids = String(transitionIds).split(',').map(Number).filter(n => !isNaN(n))
    if (ids.length) {
      params.push(ids)
      conditions.push(`i.transition_id = ANY($${params.length})`)
    }
  }

  if (!startDate && !transitionIds) {
    orderBy = 'ORDER BY i.transition_time DESC'
    limit = 50
  }

  return dbQuery(`
    SELECT i.id, i.transition_id, i.event_type, i.transitioned_attraction, i.impacted_attraction, i.park_id,
      i.transition_time, i.velocity_before, i.velocity_after, i.velocity_delta, i.baseline_delta, i.excess_delta,
      i.wait_before, i.wait_after, i.wait_delta, i.absorption_score, i.drain_score,
      COALESCE(transitioned.name, '') AS transitioned_attraction_name,
      COALESCE(impacted.name, '') AS impacted_attraction_name
    FROM l3_transition_impact i
    LEFT JOIN attractions transitioned ON transitioned.id = i.transitioned_attraction
    LEFT JOIN attractions impacted ON impacted.id = i.impacted_attraction
    WHERE ${conditions.join(' AND ')}
    ${orderBy}
    LIMIT ${limit}
  `, params)
})
