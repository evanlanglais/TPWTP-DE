export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const [park] = await dbQuery(`
    SELECT p.id, p.name, p.timezone, p.destination_id,
      (SELECT json_build_object('name', d.name) FROM destinations d WHERE d.id = p.destination_id) AS destinations
    FROM parks p
    WHERE p.id = $1
  `, [id])

  if (!park) throw createError({ statusCode: 404, message: 'Park not found' })
  return park
})
