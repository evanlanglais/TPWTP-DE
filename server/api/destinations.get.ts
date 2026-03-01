import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = serverSupabaseServiceRole(event)

  const { data, error } = await client
    .from('destinations')
    .select('id, name, slug, parks(id)')
    .order('name')

  if (error) throw createError({ statusCode: 500, message: error.message })

  return (data as { id: string; name: string; slug: string; parks: { id: string }[] }[]).map(d => ({
    ...d,
    park_count: d.parks?.length ?? 0
  }))
})
