import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const { limit } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const rowLimit = limit ? Number(limit) : 20

  const { data, error } = await client
    .from('l2_status_transitions')
    .select('id, attraction_id, transition_time, previous_status, new_status, duration_seconds, attractions!inner(name, park_id)')
    .eq('attractions.park_id', id)
    .order('transition_time', { ascending: false })
    .limit(rowLimit)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data as { id: number; attraction_id: string; transition_time: string; previous_status: string; new_status: string; duration_seconds: number | null; attractions: { name: string; park_id: string } }[]).map(t => ({
    ...t,
    attraction_name: t.attractions.name
  }))
})
