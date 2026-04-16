import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const { attractionIds, startDate, endDate } = getQuery(event)

  if (!attractionIds || !startDate || !endDate) {
    throw createError({ statusCode: 400, message: 'Missing required params: attractionIds, startDate, endDate' })
  }

  const ids = Array.isArray(attractionIds) ? attractionIds as string[] : (attractionIds as string).split(',')

  const { data, error } = await client
    .from('l2_wait_velocity')
    .select('attraction_id, timestamp, velocity, velocity_ema, trend, sample_count')
    .in('attraction_id', ids)
    .gte('timestamp', startDate as string)
    .lte('timestamp', endDate as string)
    .order('timestamp', { ascending: true })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
