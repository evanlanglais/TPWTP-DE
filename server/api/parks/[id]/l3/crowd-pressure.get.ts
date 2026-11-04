const SELECT_PRESSURE = `
  SELECT park_id, "timestamp", pressure_score, pressure_ema, trend, operating_count, avg_wait
  FROM l3_park_crowd_pressure
  WHERE park_id = $1
`

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const { startDate, endDate } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  if (startDate && endDate) {
    // Historical range query
    return dbQuery(`
      ${SELECT_PRESSURE}
        AND "timestamp" >= $2 AND "timestamp" <= $3
      ORDER BY "timestamp" ASC
      LIMIT ${MAX_ROWS}
    `, [id, startDate, endDate])
  }

  // Latest record
  const [latest] = await dbQuery(`
    ${SELECT_PRESSURE}
    ORDER BY "timestamp" DESC
    LIMIT 1
  `, [id])

  return latest ?? null
})
