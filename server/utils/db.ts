import pg from 'pg'
import type { QueryResultRow } from 'pg'

// Upper bound for queries whose size depends on request input.
export const MAX_ROWS = 1000

const OID = { INT8: 20, TIMESTAMP: 1114, TIMESTAMPTZ: 1184, DATE: 1082, NUMERIC: 1700 }

// Postgres renders timestamps as "2026-03-01 12:00:00.5+00", which not every browser can
// parse. Keep full precision as a string, but in ISO 8601 form (same as JSON output).
const toISOTimestamp = (value: string) => value.replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00')

// API consumers expect JSON numbers and ISO timestamp strings, not pg's defaults
// (strings for int8/numeric, Date objects for timestamps).
pg.types.setTypeParser(OID.INT8, Number)
pg.types.setTypeParser(OID.NUMERIC, Number)
pg.types.setTypeParser(OID.TIMESTAMP, toISOTimestamp)
pg.types.setTypeParser(OID.TIMESTAMPTZ, toISOTimestamp)
pg.types.setTypeParser(OID.DATE, (value: string) => value)

let pool: pg.Pool | undefined

function getPool(): pg.Pool {
  if (pool) return pool

  const connectionString = useRuntimeConfig().databaseUrl
  if (!connectionString) throw new Error('NUXT_DATABASE_URL is not set')

  pool = new pg.Pool({
    connectionString,
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    query_timeout: 30_000
  })
  // Without a listener, an error on an idle client would crash the process
  pool.on('error', err => console.error('Idle Postgres client error', err))

  return pool
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(text: string, params: unknown[] = []): Promise<T[]> {
  const { rows } = await getPool().query<T>(text, params)
  return rows
}
