export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  // Attractions with no wait times are excluded; a missing velocity yields an empty array
  return dbQuery(`
    SELECT a.id, a.name, a.park_id, a.external_id,
      json_build_array(to_json(latest_wait)) AS wait_times,
      COALESCE((
        SELECT json_agg(latest_velocity)
        FROM (
          SELECT v.attraction_id, v."timestamp", v.velocity, v.velocity_ema, v.trend, v.sample_count
          FROM l2_wait_velocity v
          WHERE v.attraction_id = a.id
          ORDER BY v."timestamp" DESC
          LIMIT 1
        ) latest_velocity
      ), '[]'::json) AS l2_wait_velocity
    FROM attractions a
    CROSS JOIN LATERAL (
      SELECT w."timestamp", w.status, w.standby_wait, w.single_rider_wait,
        w.return_time_state, w.return_time_start, w.return_time_end
      FROM wait_times w
      WHERE w.attraction_id = a.id
      ORDER BY w."timestamp" DESC
      LIMIT 1
    ) latest_wait
    WHERE a.park_id = $1
    ORDER BY a.name
  `, [id])
})
