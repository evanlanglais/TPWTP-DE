import { getParkTimezone, isHistoricalDate } from '../utils/parkTimezone'
import { getProcessingCursors, buildETag } from '../utils/processingVersion'

const CACHE_SHORT = 'public, max-age=60'
const CACHE_HISTORICAL = 'public, max-age=86400, stale-while-revalidate=604800'

// Route pattern → metric_name(s) in l2_processing_cursors for ETag generation
// These values must match what the data pipeline writes to the table.
// Discovered via: SELECT DISTINCT metric_name FROM l2_processing_cursors;
const ETAG_METRIC_MAP: Record<string, string[]> = {
  'l2/velocity': ['velocity'],
  'l2/transitions': ['transitions'],
  'l3/crowd-pressure': ['crowd_pressure'],
  'l3/correlations': ['correlation'],
  'l3/crowd-flow': ['crowd_flow'],
}

// Match /api/parks/:id/(l1|l2|l3)/... and extract parkId + level path
const LEVEL_ROUTE_RE = /^\/api\/parks\/([^/]+)\/(l[123])\/(.+)$/

export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname
  const match = path.match(LEVEL_ROUTE_RE)

  if (!match) return // Not a leveled route, skip (handled by routeRules or no caching)

  const [, parkId, level, endpoint] = match
  const levelEndpoint = `${level}/${endpoint}`
  const query = getQuery(event)
  const hasDateRange = !!(query.startDate && query.endDate)

  // Determine cache policy based on date range and timezone
  if (hasDateRange) {
    const timezone = await getParkTimezone(event, parkId)
    const historical = isHistoricalDate(query.endDate as string, timezone)
    setResponseHeader(event, 'cache-control', historical ? CACHE_HISTORICAL : CACHE_SHORT)
  } else {
    setResponseHeader(event, 'cache-control', CACHE_SHORT)
  }

  // ETag handling for L2/L3 routes
  if (level === 'l2' || level === 'l3') {
    const metricNames = ETAG_METRIC_MAP[levelEndpoint]
    if (metricNames) {
      try {
        const cursors = await getProcessingCursors(event)
        const etag = buildETag(cursors, metricNames)

        const ifNoneMatch = getRequestHeader(event, 'if-none-match')
        if (ifNoneMatch && ifNoneMatch === etag) {
          setResponseStatus(event, 304)
          setResponseHeader(event, 'etag', etag)
          return ''
        }

        setResponseHeader(event, 'etag', etag)
      } catch {
        // ETag generation failed — proceed without ETag, caching still works
      }
    }
  }
})
