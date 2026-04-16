import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')
  const { startDate, endDate } = getQuery(event)

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  if (startDate && endDate) {
    // Historical range query
    const { data, error } = await client
      .from('l3_park_crowd_pressure')
      .select('park_id, timestamp, pressure_score, pressure_ema, trend, operating_count, avg_wait')
      .eq('park_id', id)
      .gte('timestamp', startDate as string)
      .lte('timestamp', endDate as string)
      .order('timestamp', { ascending: true })

    if (error) throw createError({ statusCode: 500, message: error.message })
    return data
  }

  // Latest record
  const { data, error } = await client
    .from('l3_park_crowd_pressure')
    .select('park_id, timestamp, pressure_score, pressure_ema, trend, operating_count, avg_wait')
    .eq('park_id', id)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
