import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Missing park id' })

  const { data, error } = await client
    .from('attractions')
    .select('id, name, external_id, park_id')
    .eq('park_id', id)
    .order('name')

  if (error) throw createError({ statusCode: 500, message: error.message })
  return data
})
