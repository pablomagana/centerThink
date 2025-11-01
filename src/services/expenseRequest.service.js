/**
 * Expense Request Service
 * Handles CRUD operations for expense requests
 */

import { supabase } from '@/lib/supabase'

/**
 * List all expense requests with optional sorting and limit
 * @param {string} sortOrder - Sort order (e.g., '-created_at' for descending)
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} - Array of expense requests
 */
async function list(sortOrder = '-created_at', limit = 1000) {
  try {
    let query = supabase
      .from('expense_requests')
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)

    // Apply sorting
    if (sortOrder) {
      const isDescending = sortOrder.startsWith('-')
      const field = isDescending ? sortOrder.substring(1) : sortOrder
      query = query.order(field, { ascending: !isDescending })
    }

    // Apply limit
    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error listing expense requests:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Expense request service list error:', error)
    throw error
  }
}

/**
 * Get a single expense request by ID
 * @param {string} id - Expense request ID
 * @returns {Promise<Object>} - Expense request object
 */
async function get(id) {
  try {
    const { data, error } = await supabase
      .from('expense_requests')
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error getting expense request:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Expense request service get error:', error)
    throw error
  }
}

/**
 * Create a new expense request
 * @param {Object} requestData - Expense request data
 * @returns {Promise<Object>} - Created expense request
 */
async function create(requestData) {
  try {
    // Get current user ID
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      throw new Error('User not authenticated')
    }

    // Prepare data with created_by
    const dataToInsert = {
      ...requestData,
      created_by: user.id,
      attachments: requestData.attachments || []
    }

    const { data, error } = await supabase
      .from('expense_requests')
      .insert([dataToInsert])
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) {
      console.error('Error creating expense request:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Expense request service create error:', error)
    throw error
  }
}

/**
 * Update an existing expense request
 * @param {string} id - Expense request ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} - Updated expense request
 */
async function update(id, updates) {
  try {
    const { data, error } = await supabase
      .from('expense_requests')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .single()

    if (error) {
      console.error('Error updating expense request:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Expense request service update error:', error)
    throw error
  }
}

/**
 * Delete an expense request
 * @param {string} id - Expense request ID
 * @returns {Promise<Object>} - Success object
 */
async function remove(id) {
  try {
    const { error } = await supabase
      .from('expense_requests')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting expense request:', error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error('Expense request service delete error:', error)
    throw error
  }
}

/**
 * Get expense requests by city
 * @param {string} cityId - City ID
 * @returns {Promise<Array>} - Array of expense requests
 */
async function getByCity(cityId) {
  try {
    const { data, error } = await supabase
      .from('expense_requests')
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('city_id', cityId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting expense requests by city:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Expense request service get by city error:', error)
    throw error
  }
}

/**
 * Get expense requests by status
 * @param {string} status - Status filter
 * @returns {Promise<Array>} - Array of expense requests
 */
async function getByStatus(status) {
  try {
    const { data, error } = await supabase
      .from('expense_requests')
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting expense requests by status:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Expense request service get by status error:', error)
    throw error
  }
}

/**
 * Get expense requests by request type
 * @param {string} requestType - Request type filter
 * @returns {Promise<Array>} - Array of expense requests
 */
async function getByRequestType(requestType) {
  try {
    const { data, error } = await supabase
      .from('expense_requests')
      .select(`
        *,
        city:cities(id, name),
        creator:user_profiles!expense_requests_created_by_fkey(
          id,
          first_name,
          last_name
        )
      `)
      .eq('request_type', requestType)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error getting expense requests by type:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Expense request service get by type error:', error)
    throw error
  }
}

/**
 * Update attachments for an expense request
 * @param {string} id - Expense request ID
 * @param {Array} attachments - New attachments array
 * @returns {Promise<Object>} - Updated expense request
 */
async function updateAttachments(id, attachments) {
  try {
    return await update(id, { attachments })
  } catch (error) {
    console.error('Expense request service update attachments error:', error)
    throw error
  }
}

export const expenseRequestService = {
  list,
  get,
  create,
  update,
  delete: remove,
  getByCity,
  getByStatus,
  getByRequestType,
  updateAttachments
}
