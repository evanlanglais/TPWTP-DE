interface ProcessingCursor {
  metric_name: string
  logic_version: number
  updated_at: string
  last_processed: string
}

let cachedCursors: ProcessingCursor[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60_000 // 1 minute

export async function getProcessingCursors(): Promise<ProcessingCursor[]> {
  const now = Date.now()
  if (cachedCursors && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedCursors
  }

  try {
    cachedCursors = await dbQuery<ProcessingCursor>(
      'SELECT metric_name, logic_version, updated_at, last_processed FROM l2_processing_cursors'
    )
    cacheTimestamp = now
    return cachedCursors
  } catch (err) {
    if (cachedCursors) return cachedCursors
    throw err
  }
}

export function buildETag(cursors: ProcessingCursor[], metricNames: string[]): string {
  const relevant = cursors
    .filter(c => metricNames.includes(c.metric_name))
    .sort((a, b) => a.metric_name.localeCompare(b.metric_name))
    .map(c => `${c.metric_name}:${c.logic_version}:${c.updated_at}`)
    .join('|')

  if (!relevant) return '"unknown"'

  let hash = 0
  for (let i = 0; i < relevant.length; i++) {
    const char = relevant.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return `"v${Math.abs(hash).toString(36)}"`
}
