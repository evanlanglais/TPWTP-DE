import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const { attractionIds, startDate, endDate } = getQuery(event)

  if (!attractionIds || !startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'Missing required params: attractionIds, startDate, endDate' })
  }

  const ids = Array.isArray(attractionIds) ? attractionIds as string[] : (attractionIds as string).split(',')

  const { data, error } = await client
    .from('l2_status_transitions')
    .select('id, attraction_id, transition_time, previous_status, new_status, duration_seconds, attractions!inner(name)')
    .in('attraction_id', ids)
    .gte('transition_time', startDate as string)
    .lte('transition_time', endDate as string)
    .order('transition_time', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data as { id: number; attraction_id: string; transition_time: string; previous_status: string; new_status: string; duration_seconds: number | null; attractions: { name: string } }[]).map(t => ({
    id: t.id,
    attraction_id: t.attraction_id,
    transition_time: t.transition_time,
    previous_status: t.previous_status,
    new_status: t.new_status,
    duration_seconds: t.duration_seconds,
    attraction_name: t.attractions.name
  }))
})
