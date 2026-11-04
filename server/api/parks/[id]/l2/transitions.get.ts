const SELECT_TRANSITIONS = `
  SELECT t.id, t.attraction_id, t.transition_time, t.previous_status, t.new_status, t.duration_seconds,
    a.name AS attraction_name
  FROM l2_status_transitions t
  JOIN attractions a ON a.id = t.attraction_id
  WHERE a.park_id = $1
`

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const { startDate, endDate, attractionIds, limit } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  if (startDate && endDate) {
    // Historical range query
    const params: unknown[] = [id, startDate, endDate]
    let attractionFilter = ''

    if (attractionIds) {
      params.push(Array.isArray(attractionIds) ? attractionIds : String(attractionIds).split(','))
      attractionFilter = 'AND t.attraction_id = ANY($4)'
    }

    return dbQuery(`
      ${SELECT_TRANSITIONS}
        AND t.transition_time >= $2 AND t.transition_time <= $3
        ${attractionFilter}
      ORDER BY t.transition_time ASC
      LIMIT ${MAX_ROWS}
    `, params)
  }

  // Recent transitions (no date range)
  const rowLimit = limit ? Math.min(Number(limit), MAX_ROWS) : 20

  return dbQuery(`
    ${SELECT_TRANSITIONS}
    ORDER BY t.transition_time DESC
    LIMIT $2
  `, [id, rowLimit])
})
