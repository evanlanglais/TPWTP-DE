export default defineEventHandler((event) => {
  const { destinationId } = getQuery(event)
  const params = destinationId ? [destinationId] : []

  return dbQuery(`
    SELECT p.id, p.name, p.timezone, p.destination_id,
      COALESCE(d.name, '') AS destination_name,
      (SELECT count(*) FROM attractions a WHERE a.park_id = p.id) AS attraction_count
    FROM parks p
    LEFT JOIN destinations d ON d.id = p.destination_id
    ${destinationId ? 'WHERE p.destination_id = $1' : ''}
    ORDER BY p.name
  `, params)
})
