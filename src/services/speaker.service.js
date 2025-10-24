import { supabase } from '@/lib/supabase'

export const speakerService = {
  async list(sortOrder = null, limit = 1000) {
    let query = supabase
      .from('speakers')
      .select('*')
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
      .from('speakers')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(speakerData) {
    const { data, error } = await supabase
      .from('speakers')
      .insert([{
        ...speakerData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, speakerData) {
    const { data, error } = await supabase
      .from('speakers')
      .update({
        ...speakerData,
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
      .from('speakers')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
