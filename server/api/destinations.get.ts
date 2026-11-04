export default defineEventHandler(() => dbQuery(`
  SELECT d.id, d.name, d.slug,
    (SELECT count(*) FROM parks p WHERE p.destination_id = d.id) AS park_count
  FROM destinations d
  ORDER BY d.name
`))
