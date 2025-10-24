import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Función helper para generar contraseña segura
function generateSecurePassword(length = 16): string {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset[array[i] % charset.length];
  }
  return password;
}

interface CreateUserRequest {
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'user' | 'supplier';
  cities: string[];
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

  // Solo permitir POST
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
    const requestData: CreateUserRequest = await req.json()
    const { email, first_name, last_name, role, cities, phone } = requestData

    // Validar campos requeridos
    if (!email || !first_name || !last_name || !role) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, first_name, last_name, role' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Invalid email format' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar rol
    if (!['admin', 'user', 'supplier'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'Invalid role. Must be: admin, user, or supplier' }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Obtener usuario actual (quien está creando)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: userError } = await supabase.auth.getUser(token)
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Obtener perfil del creador
    const { data: creatorProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, cities')
      .eq('id', user.id)
      .single()

    if (profileError || !creatorProfile) {
      return new Response(
        JSON.stringify({ error: 'Creator profile not found' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar permisos: solo admin y supplier pueden crear usuarios
    if (!['admin', 'supplier'].includes(creatorProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions. Only admin and supplier can create users.' }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Validar que supplier solo cree usuarios en sus ciudades asignadas
    if (creatorProfile.role === 'supplier' && cities.length > 0) {
      const creatorCities = creatorProfile.cities || []
      const invalidCities = cities.filter(cityId => !creatorCities.includes(cityId))

      if (invalidCities.length > 0) {
        return new Response(
          JSON.stringify({
            error: 'Supplier can only create users in their assigned cities',
            invalidCities
          }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    // Usar service role key para operaciones admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Crear usuario con contraseña temporal autogenerada
    const tempPassword = generateSecurePassword()
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin
      .createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Email confirmado automáticamente
        user_metadata: {
          first_name,
          last_name,
          temp_password: tempPassword // Guardamos la contraseña temporal en metadata
        }
      })

    if (authError) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({
          error: authError.message || 'Error creating auth user',
          details: authError
        }),
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
        role,
        cities: cities || [],
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
          error: 'Error creating user profile',
          details: profileCreateError
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // 3. Enviar email con contraseña temporal
    // NOTA: Supabase NO envía email automático cuando se usa createUser con password
    // Aquí deberías implementar el envío de email usando un servicio como SendGrid, Resend, etc.
    // Por ahora, devolvemos la contraseña temporal en la respuesta para que el admin la comunique

    console.log(`Usuario creado: ${email} con contraseña temporal`)

    return new Response(
      JSON.stringify({
        success: true,
        user: profileData,
        tempPassword, // IMPORTANTE: En producción, enviar esto por email, no en respuesta HTTP
        message: `Usuario creado exitosamente. Contraseña temporal generada.`
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
        error: error.message || 'Internal server error',
        details: error
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
