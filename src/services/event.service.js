import { supabase } from '@/lib/supabase'

export const eventService = {
  async list(sortOrder = null, limit = 1000) {
    let query = supabase
      .from('events')
      .select(`
        *,
        city:cities(*),
        speaker:speakers(*),
        venue:venues(*)
      `)
      .limit(limit)

    if (sortOrder) {
      const desc = sortOrder.startsWith('-')
      const field = sortOrder.replace('-', '')
      query = query.order(field, { ascending: !desc })
    } else {
      query = query.order('date', { ascending: false })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async get(id) {
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        city:cities(*),
        speaker:speakers(*),
        venue:venues(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(eventData) {
    const { data, error } = await supabase
      .from('events')
      .insert([{
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, eventData) {
    const { data, error } = await supabase
      .from('events')
      .update({
        ...eventData,
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
      .from('events')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
