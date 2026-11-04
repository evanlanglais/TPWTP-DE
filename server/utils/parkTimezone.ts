const timezoneCache = new Map<string, { tz: string; cachedAt: number }>()
const TZ_CACHE_TTL = 3_600_000 // 1 hour

export async function getParkTimezone(parkId: string): Promise<string> {
  const cached = timezoneCache.get(parkId)
  if (cached && Date.now() - cached.cachedAt < TZ_CACHE_TTL) return cached.tz

  let rows: { timezone: string }[]
  try {
    rows = await dbQuery<{ timezone: string }>('SELECT timezone FROM parks WHERE id = $1', [parkId])
  } catch (err) {
    // Only used to pick a cache policy, so this must not fail the request
    console.error('Failed to fetch park timezone', err)
    return 'UTC'
  }

  const tz = rows[0]?.timezone ?? 'UTC'
  timezoneCache.set(parkId, { tz, cachedAt: Date.now() })
  return tz
}

export function isHistoricalDate(endDateISO: string, timezone: string): boolean {
  const endDateLocal = new Date(endDateISO).toLocaleDateString('en-CA', { timeZone: timezone })
  const todayLocal = new Date().toLocaleDateString('en-CA', { timeZone: timezone })
  return endDateLocal < todayLocal
}
