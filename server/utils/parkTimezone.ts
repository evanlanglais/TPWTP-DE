import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

const timezoneCache = new Map<string, { tz: string; cachedAt: number }>()
const TZ_CACHE_TTL = 3_600_000 // 1 hour

export async function getParkTimezone(event: H3Event, parkId: string): Promise<string> {
  const cached = timezoneCache.get(parkId)
  if (cached && Date.now() - cached.cachedAt < TZ_CACHE_TTL) return cached.tz

  const client = serverSupabaseServiceRole(event)
  const { data } = await client
    .from('parks')
    .select('timezone')
    .eq('id', parkId)
    .single()

  const tz = data?.timezone ?? 'UTC'
  timezoneCache.set(parkId, { tz, cachedAt: Date.now() })
  return tz
}

export function isHistoricalDate(endDateISO: string, timezone: string): boolean {
  const endDateLocal = new Date(endDateISO).toLocaleDateString('en-CA', { timeZone: timezone })
  const todayLocal = new Date().toLocaleDateString('en-CA', { timeZone: timezone })
  return endDateLocal < todayLocal
}
