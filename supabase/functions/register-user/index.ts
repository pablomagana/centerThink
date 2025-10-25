import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RegisterUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  city_id: string;
  phone?: string;
}

serve(async (req) => {
  // Configurar CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Usar service role key para operaciones
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // GET: Devolver lista de ciudades activas para el formulario de registro
  if (req.method === 'GET') {
    try {
      const { data: cities, error: citiesError } = await supabaseAdmin
        .from('cities')
        .select('id, name')
        .eq('active', true)
        .order('name', { ascending: true })

      if (citiesError) {
        return new Response(
          JSON.stringify({ error: 'Error al cargar ciudades' }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }

      return new Response(
        JSON.stringify({ cities: cities || [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Error interno del servidor' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
  }

  // Solo permitir POST para registro
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )
  }

  try {
    const requestData: RegisterUserRequest = await req.json()
    const { email, password, first_name, last_name, city_id, phone } = requestData

    // Validar campos requeridos
    if (!email || !password || !first_name || !last_name || !city_id) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: email, password, first_name, last_name, city_id'
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Formato de email inválido' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar longitud de contraseña
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar complejidad de contraseña
    const hasUpperCase = /[A-Z]/.test(password)
    const hasLowerCase = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)

    if (!hasUpperCase || !hasLowerCase || !hasNumber) {
      return new Response(
        JSON.stringify({
          error: 'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Verificar que la ciudad existe
    const { data: cityData, error: cityError } = await supabaseAdmin
      .from('cities')
      .select('id, name')
      .eq('id', city_id)
      .single()

    if (cityError || !cityData) {
      return new Response(
        JSON.stringify({ error: 'Ciudad no válida' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 1. Crear usuario en auth con confirmación de email requerida
    // Supabase enviará automáticamente el email de confirmación usando el template nativo
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin
      .createUser({
        email,
        password,
        email_confirm: false, // Requiere confirmación de email - Supabase enviará el email automáticamente
        user_metadata: {
          first_name,
          last_name
        }
      })

    if (authError) {
      console.error('Auth error:', authError)

      // Mensajes de error más amigables
      let errorMessage = 'Error al crear el usuario'
      if (authError.message.includes('already registered')) {
        errorMessage = 'Este email ya está registrado'
      } else if (authError.message.includes('invalid email')) {
        errorMessage = 'Email inválido'
      } else if (authError.message.includes('password')) {
        errorMessage = 'La contraseña no cumple los requisitos'
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 2. Crear perfil en user_profiles
    const { data: profileData, error: profileCreateError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        first_name,
        last_name,
        role: 'user', // Rol por defecto para auto-registro
        cities: [city_id], // Array con la ciudad seleccionada
        phone: phone || null
      })
      .select()
      .single()

    if (profileCreateError) {
      console.error('Profile creation error:', profileCreateError)

      // Si falla la creación del perfil, eliminar el usuario de auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)

      return new Response(
        JSON.stringify({
          error: 'Error al crear el perfil de usuario',
          details: profileCreateError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 3. Email de confirmación enviado automáticamente por Supabase
    // Como se creó el usuario con email_confirm: false, Supabase enviará automáticamente
    // el email de confirmación usando el template configurado en el Dashboard
    console.log(`✅ Usuario registrado: ${email}`)
    console.log(`📧 Supabase enviará automáticamente el email de confirmación`)

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: profileData.id,
          email: authData.user.email,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          role: profileData.role,
          cities: profileData.cities
        },
        message: 'Registro exitoso. Por favor revisa tu email para confirmar tu cuenta.'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
