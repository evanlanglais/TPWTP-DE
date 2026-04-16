import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const { startDate, endDate, attractionIds, limit } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  if (startDate && endDate) {
    // Historical range query
    let query = client
      .from('l2_status_transitions')
      .select('id, attraction_id, transition_time, previous_status, new_status, duration_seconds, attractions!inner(name, park_id)')
      .eq('attractions.park_id', id)
      .gte('transition_time', startDate as string)
      .lte('transition_time', endDate as string)
      .order('transition_time', { ascending: true })

    if (attractionIds) {
      const ids = Array.isArray(attractionIds) ? attractionIds as string[] : (attractionIds as string).split(',')
      query = query.in('attraction_id', ids)
    }

    const { data, error } = await query

    if (error) throw createError({ statusCode: 500, message: error.message })

    return (data as { id: number; attraction_id: string; transition_time: string; previous_status: string; new_status: string; duration_seconds: number | null; attractions: { name: string; park_id: string } }[]).map(t => ({
      id: t.id,
      attraction_id: t.attraction_id,
      transition_time: t.transition_time,
      previous_status: t.previous_status,
      new_status: t.new_status,
      duration_seconds: t.duration_seconds,
      attraction_name: t.attractions.name
    }))
  }

  // Recent transitions (no date range)
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
