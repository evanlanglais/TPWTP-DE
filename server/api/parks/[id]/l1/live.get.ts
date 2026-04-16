import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const { data, error } = await client
    .from('attractions')
    .select('id, name, park_id, external_id, wait_times!inner(timestamp, status, standby_wait, single_rider_wait, return_time_state, return_time_start, return_time_end), l2_wait_velocity(attraction_id, timestamp, velocity, velocity_ema, trend, sample_count)')
    .eq('park_id', id)
    .order('timestamp', { referencedTable: 'wait_times', ascending: false })
    .limit(1, { referencedTable: 'wait_times' })
    .order('timestamp', { referencedTable: 'l2_wait_velocity', ascending: false })
    .limit(1, { referencedTable: 'l2_wait_velocity' })

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
