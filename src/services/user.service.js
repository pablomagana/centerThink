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

    // Para cada usuario, obtener el estado de verificación de email desde auth
    // Esto requiere llamar a una Edge Function ya que no podemos acceder a auth.users directamente
    const usersWithVerification = await Promise.all(
      (data || []).map(async (user) => {
        try {
          // Llamar a Edge Function que nos devuelva el estado de verificación
          const { data: verificationData } = await supabase.functions.invoke('get-user-verification-status', {
            body: { userId: user.id },
            method: 'POST'
          })

          return {
            ...user,
            email_verified: verificationData?.email_verified || false,
            email_confirmed_at: verificationData?.email_confirmed_at || null
          }
        } catch (err) {
          // Si falla, asumimos que no está verificado
          console.warn(`Could not get verification status for user ${user.id}:`, err)
          return {
            ...user,
            email_verified: false,
            email_confirmed_at: null
          }
        }
      })
    )

    return usersWithVerification
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
   * Verifica/valida el email de un usuario manualmente
   * Solo admin y supplier pueden usar esta función
   * @param {string} userId - ID del usuario a verificar
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async verifyUserEmail(userId) {
    const { data, error } = await supabase.functions.invoke('verify-user-email', {
      body: { userId },
      method: 'POST'
    })

    if (error) {
      console.error('Error calling verify-user-email function:', error)
      throw new Error(error.message || 'Error al verificar el email del usuario')
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
    const { email, password, first_name, last_name, city_id, phone } = userData

    // Validar campos requeridos
    if (!email || !password || !first_name || !last_name || !city_id) {
      throw new Error('Todos los campos requeridos deben estar completos')
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw new Error('Email no válido')
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres')
    }

    // Validar complejidad de contraseña
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      throw new Error('La contraseña debe contener al menos una mayúscula, una minúscula y un número')
    }

    // 1. Crear usuario con Supabase Auth (esto envía el email de confirmación automáticamente)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (authError) {
      console.error('Error en signUp:', authError)
      let errorMessage = 'Error al registrar el usuario'
      if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
        errorMessage = 'Este email ya está registrado'
      }
      throw new Error(errorMessage)
    }

    if (!authData?.user) {
      throw new Error('No se pudo crear el usuario')
    }

    console.log(`✅ Usuario creado en auth.users: ${email}`)
    console.log(`📧 Email de confirmación enviado automáticamente por Supabase`)

    // 2. Crear perfil usando Edge Function (esto requiere service role key)
    const { data: profileData, error: profileError } = await supabase.functions.invoke('register-user', {
      body: {
        userId: authData.user.id,
        first_name,
        last_name,
        city_id,
        phone
      },
      method: 'POST'
    })

    if (profileError || profileData?.error) {
      console.error('Error creando perfil:', profileError || profileData?.error)
      throw new Error('Error al crear el perfil del usuario. Por favor, contacta a soporte.')
    }

    console.log(`✅ Perfil creado en user_profiles`)

    return {
      success: true,
      message: 'Registro exitoso. Revisa tu email para confirmar tu cuenta.',
      user: {
        id: authData.user.id,
        email: authData.user.email,
        first_name,
        last_name,
        role: 'user',
        cities: [city_id]
      }
    }
  }
}
