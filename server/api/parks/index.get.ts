import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const { destinationId } = getQuery(event)

  let query = client
    .from('parks')
    .select('id, name, timezone, destination_id, destinations(name), attractions!attractions_park_id_fkey(id)')
    .order('name')

  if (destinationId) {
    query = query.eq('destination_id', destinationId as string)
  }

  const { data, error } = await query
  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data as { id: string; name: string; timezone: string; destination_id: string; destinations: { name: string }; attractions: { id: string }[] }[]).map(p => ({
    ...p,
    destination_name: p.destinations?.name ?? '',
    attraction_count: p.attractions?.length ?? 0
  }))
})
