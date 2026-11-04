const SELECT_CORRELATIONS = `
  SELECT c.park_id, c.attraction_a, c.attraction_b, c.computed_at, c.window_start, c.window_end,
    c.correlation, c.sample_count,
    COALESCE(a.name, '') AS attraction_a_name,
    COALESCE(b.name, '') AS attraction_b_name
  FROM l3_correlation_pairs c
  LEFT JOIN attractions a ON a.id = c.attraction_a
  LEFT JOIN attractions b ON b.id = c.attraction_b
  WHERE c.park_id = $1
`

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')
  const { startDate, endDate } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  if (startDate && endDate) {
    // Historical range query by computed_at
    return dbQuery(`
      ${SELECT_CORRELATIONS}
        AND c.computed_at >= $2 AND c.computed_at <= $3
      ORDER BY c.computed_at ASC, c.correlation DESC
      LIMIT ${MAX_ROWS}
    `, [id, startDate, endDate])
  }

  // Latest computed batch
  return dbQuery(`
    ${SELECT_CORRELATIONS}
      AND c.computed_at = (SELECT max(computed_at) FROM l3_correlation_pairs WHERE park_id = $1)
    ORDER BY c.correlation DESC
    LIMIT ${MAX_ROWS}
  `, [id])
})
