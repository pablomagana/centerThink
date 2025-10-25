import { supabase } from '@/lib/supabase'

export const userService = {
  async list(sortOrder = null, limit = 1000) {
    let query = supabase
      .from('user_profiles')
      .select('*')
      .limit(limit)

    if (sortOrder) {
      const desc = sortOrder.startsWith('-')
      const field = sortOrder.replace('-', '')
      query = query.order(field, { ascending: !desc })
    } else {
      query = query.order('first_name', { ascending: true })
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  },

  async get(id) {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(userData) {
    const { data, error} = await supabase
      .from('user_profiles')
      .insert([{
        ...userData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, userData) {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...userData,
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
      .from('user_profiles')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  /**
   * Elimina un usuario completo usando la Edge Function
   * Esto elimina el usuario de auth.users Y de user_profiles
   * @param {string} userId - ID del usuario a eliminar
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async deleteComplete(userId) {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
      method: 'POST'
    })

    if (error) {
      console.error('Error calling delete-user function:', error)
      throw new Error(error.message || 'Error al eliminar el usuario')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  },

  // Método especial para obtener el perfil del usuario actual
  async me() {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError) throw authError
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      // Return basic user info if profile doesn't exist
      return {
        id: user.id,
        email: user.email,
        first_name: user.email.split('@')[0],
        last_name: '',
        role: 'user',
        cities: []
      }
    }

    return { ...user, ...data }
  },

  /**
   * Crea un nuevo usuario completo usando la Edge Function
   * Esto crea el usuario en auth.users Y en user_profiles
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.first_name - Nombre
   * @param {string} userData.last_name - Apellidos
   * @param {string} userData.role - Rol: 'admin', 'user', o 'supplier'
   * @param {string[]} userData.cities - Array de IDs de ciudades
   * @param {string} [userData.phone] - Teléfono (opcional)
   * @returns {Promise<{success: boolean, user: Object, tempPassword: string, message: string}>}
   */
  async createComplete(userData) {
    const { data, error } = await supabase.functions.invoke('create-user', {
      body: userData
    })

    if (error) {
      console.error('Error calling create-user function:', error)
      throw new Error(error.message || 'Error al crear el usuario')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  },

  /**
   * Resetea la contraseña de un usuario estableciendo una contraseña específica
   * Solo admin y supplier pueden usar esta función
   * @param {string} userId - ID del usuario
   * @param {string} newPassword - Nueva contraseña (mínimo 6 caracteres)
   * @returns {Promise<{success: boolean, message: string, method: string}>}
   */
  async resetPassword(userId, newPassword) {
    const { data, error } = await supabase.functions.invoke('reset-user-password', {
      body: { userId, newPassword, sendEmail: false },
      method: 'POST'
    })

    if (error) {
      console.error('Error calling reset-user-password function:', error)
      throw new Error(error.message || 'Error al resetear la contraseña')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  },

  /**
   * Envía un email de recuperación de contraseña al usuario
   * Solo admin y supplier pueden usar esta función
   * @param {string} userId - ID del usuario
   * @returns {Promise<{success: boolean, message: string, method: string}>}
   */
  async sendPasswordResetEmail(userId) {
    const { data, error } = await supabase.functions.invoke('reset-user-password', {
      body: { userId, sendEmail: true },
      method: 'POST'
    })

    if (error) {
      console.error('Error calling reset-user-password function:', error)
      throw new Error(error.message || 'Error al enviar email de recuperación')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  },

  /**
   * Obtiene la lista de ciudades disponibles para registro público
   * No requiere autenticación
   * @returns {Promise<Array<{id: string, name: string}>>}
   */
  async getPublicCities() {
    const { data, error } = await supabase.functions.invoke('register-user', {
      method: 'GET'
    })

    if (error) {
      console.error('Error calling register-user function (GET cities):', error)
      throw new Error(error.message || 'Error al obtener las ciudades')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data.cities || []
  },

  /**
   * Registra un nuevo usuario públicamente (auto-registro)
   * No requiere autenticación. Crea usuario con rol 'user' por defecto
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña (min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
   * @param {string} userData.first_name - Nombre
   * @param {string} userData.last_name - Apellidos
   * @param {string} userData.city_id - ID de la ciudad seleccionada
   * @param {string} [userData.phone] - Teléfono (opcional)
   * @returns {Promise<{success: boolean, user: Object, message: string}>}
   */
  async register(userData) {
    const { data, error } = await supabase.functions.invoke('register-user', {
      body: userData,
      method: 'POST'
    })

    if (error) {
      console.error('Error calling register-user function:', error)
      throw new Error(error.message || 'Error al registrar el usuario')
    }

    if (data.error) {
      throw new Error(data.error)
    }

    return data
  }
}
