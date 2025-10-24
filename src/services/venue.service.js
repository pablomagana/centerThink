import { supabase } from '@/lib/supabase'

export const venueService = {
  async list(sortOrder = null, limit = 1000) {
    let query = supabase
      .from('venues')
      .select('*, city:cities(*)')
      .limit(limit)

    if (sortOrder) {
      const desc = sortOrder.startsWith('-')
      const field = sortOrder.replace('-', '')
      query = query.order(field, { ascending: !desc })
    } else {
      query = query.order('name', { ascending: true })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async get(id) {
    const { data, error } = await supabase
      .from('venues')
      .select('*, city:cities(*)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(venueData) {
    const { data, error } = await supabase
      .from('venues')
      .insert([{
        ...venueData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, venueData) {
    const { data, error } = await supabase
      .from('venues')
      .update({
        ...venueData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('venues')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
