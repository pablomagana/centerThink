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

    // 1. Generar link de confirmación (esto crea el usuario + envía email)
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'signup',
      email,
      password, // ¡Importante! Incluir password aquí
      options: {
        redirectTo: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/login`,
        data: { // Esto va a user_metadata
          first_name,
          last_name
        }
      }
    });

    if (linkError) {
      console.error('Error generating signup link:', linkError);
      let errorMessage = 'Error al registrar el usuario';
      if (linkError.message.includes('already registered')) {
        errorMessage = 'Este email ya está registrado';
      }
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    if (!linkData?.user) {
      return new Response(JSON.stringify({ error: 'No se pudo crear el usuario' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 2. El usuario ya fue creado por generateLink → usar su ID
    const userId = linkData.user.id;

    // 3. Crear perfil
    const { data: profileData, error: profileCreateError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        first_name,
        last_name,
        role: 'user',
        cities: [city_id],
        phone: phone || null
      })
      .select()
      .single();

    if (profileCreateError) {
      console.error('Profile creation error:', profileCreateError);
      // Opcional: eliminar usuario si falla el perfil
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return new Response(JSON.stringify({ error: 'Error al crear el perfil' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`✅ Usuario registrado: ${email}`)
    console.log(`📧 Email de confirmación enviado automáticamente por Supabase`)

    // 4. Éxito: email enviado + perfil creado
    return new Response(JSON.stringify({
      success: true,
      message: 'Registro exitoso. Revisa tu email para confirmar tu cuenta.',
      user: {
        id: profileData.id,
        email: linkData.user.email,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        role: profileData.role,
        cities: profileData.cities
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

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
