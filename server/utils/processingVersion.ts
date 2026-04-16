import { serverSupabaseServiceRole } from '#supabase/server'
import type { H3Event } from 'h3'

interface ProcessingCursor {
  metric_name: string
  logic_version: number
  updated_at: string
  last_processed: string
}

let cachedCursors: ProcessingCursor[] | null = null
let cacheTimestamp = 0
const CACHE_TTL_MS = 60_000 // 1 minute

export async function getProcessingCursors(event: H3Event): Promise<ProcessingCursor[]> {
  const now = Date.now()
  if (cachedCursors && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedCursors
  }

  const client = serverSupabaseServiceRole(event)
  const { data, error } = await client
    .from('l2_processing_cursors')
    .select('metric_name, logic_version, updated_at, last_processed')

  if (error) {
    if (cachedCursors) return cachedCursors
    throw createError({ statusCode: 500, message: `Failed to fetch processing cursors: ${error.message}` })
  }

  cachedCursors = data as ProcessingCursor[]
  cacheTimestamp = now
  return cachedCursors
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
