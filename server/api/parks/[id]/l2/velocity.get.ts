export default defineEventHandler((event) => {
  const { attractionIds, startDate, endDate } = getQuery(event)

  if (!attractionIds || !startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'Missing required params: attractionIds, startDate, endDate' })
  }

  const ids = Array.isArray(attractionIds) ? attractionIds : String(attractionIds).split(',')

  return dbQuery(`
    SELECT attraction_id, "timestamp", velocity, velocity_ema, trend, sample_count
    FROM l2_wait_velocity
    WHERE attraction_id = ANY($1) AND "timestamp" >= $2 AND "timestamp" <= $3
    ORDER BY "timestamp" ASC
    LIMIT ${MAX_ROWS}
  `, [ids, startDate, endDate])
})
