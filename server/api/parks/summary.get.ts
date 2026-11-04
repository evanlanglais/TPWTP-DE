export default defineEventHandler(() => dbQuery(`
  SELECT p.id, p.name, p.timezone,
    COALESCE(d.name, '') AS destination_name,
    (SELECT count(*) FROM attractions a WHERE a.park_id = p.id) AS attraction_count,
    (
      SELECT to_json(latest)
      FROM (
        SELECT cp.pressure_ema, cp.trend, cp.operating_count, cp.avg_wait
        FROM l3_park_crowd_pressure cp
        WHERE cp.park_id = p.id
        ORDER BY cp."timestamp" DESC
        LIMIT 1
      ) latest
    ) AS crowd_pressure
  FROM parks p
  LEFT JOIN destinations d ON d.id = p.destination_id
  ORDER BY p.name
`))
