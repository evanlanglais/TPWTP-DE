export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  return dbQuery(`
    SELECT id, name, external_id, park_id
    FROM attractions
    WHERE park_id = $1
    ORDER BY name
  `, [id])
})
