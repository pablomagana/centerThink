import { supabase } from '@/lib/supabase'

export const cityService = {
  async list(sortOrder = null, limit = 1000) {
    let query = supabase
      .from('cities')
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
      .from('cities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(cityData) {
    const { data, error } = await supabase
      .from('cities')
      .insert([cityData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, cityData) {
    const { data, error } = await supabase
      .from('cities')
      .update(cityData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
