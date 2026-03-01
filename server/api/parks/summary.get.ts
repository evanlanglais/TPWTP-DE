import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)

  // Fetch parks with destinations and attraction counts
  const { data: parks, error: parksError } = await client
    .from('parks')
    .select('id, name, timezone, destination_id, destinations(name), attractions!attractions_park_id_fkey(id)')
    .order('name')

  if (parksError) throw createError({ statusCode: 500, message: parksError.message })

  // Fetch latest crowd pressure per park (deduplicated)
  const { data: pressureRows, error: pressureError } = await client
    .from('l3_park_crowd_pressure')
    .select('park_id, pressure_ema, trend, operating_count, avg_wait')
    .order('timestamp', { ascending: false })

  if (pressureError) throw createError({ statusCode: 500, message: pressureError.message })

  // Deduplicate to most recent per park
  const pressureByPark = new Map<string, typeof pressureRows[0]>()
  for (const row of pressureRows ?? []) {
    if (!pressureByPark.has(row.park_id)) {
      pressureByPark.set(row.park_id, row)
    }
  }

  return (parks as { id: string; name: string; timezone: string; destination_id: string; destinations: { name: string }; attractions: { id: string }[] }[]).map(p => {
    const pressure = pressureByPark.get(p.id)
    return {
      id: p.id,
      name: p.name,
      timezone: p.timezone,
      destination_name: p.destinations?.name ?? '',
      attraction_count: p.attractions?.length ?? 0,
      crowd_pressure: pressure
        ? {
            pressure_ema: pressure.pressure_ema,
            trend: pressure.trend,
            operating_count: pressure.operating_count,
            avg_wait: pressure.avg_wait
          }
        : null
    }
  })
})
