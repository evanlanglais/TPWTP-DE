import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  // Get the latest computed_at for this park
  const { data: latest, error: latestError } = await client
    .from('l3_correlation_pairs')
    .select('computed_at')
    .eq('park_id', id)
    .order('computed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (latestError) throw createError({ statusCode: 500, message: latestError.message })
  if (!latest) return []

  // Get all pairs from that window
  const { data, error } = await client
    .from('l3_correlation_pairs')
    .select('park_id, attraction_a, attraction_b, computed_at, window_start, window_end, correlation, sample_count, attr_a:attractions!l3_correlation_pairs_attraction_a_fkey(name), attr_b:attractions!l3_correlation_pairs_attraction_b_fkey(name)')
    .eq('park_id', id)
    .eq('computed_at', latest.computed_at)
    .order('correlation', { ascending: false })

  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data as any[]).map(row => ({
    park_id: row.park_id,
    attraction_a: row.attraction_a,
    attraction_b: row.attraction_b,
    computed_at: row.computed_at,
    window_start: row.window_start,
    window_end: row.window_end,
    correlation: row.correlation,
    sample_count: row.sample_count,
    attraction_a_name: row.attr_a?.name ?? '',
    attraction_b_name: row.attr_b?.name ?? ''
  }))
})
