import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const { data, error } = await client
    .from('parks')
    .select('id, name, timezone, destination_id, destinations(name)')
    .eq('id', id)
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
