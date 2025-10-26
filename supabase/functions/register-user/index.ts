import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface RegisterUserRequest {
  userId: string;
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
    const { userId, first_name, last_name, city_id, phone } = requestData

    // Validar campos requeridos
    if (!userId || !first_name || !last_name || !city_id) {
      return new Response(
        JSON.stringify({
          error: 'Faltan campos requeridos: userId, first_name, last_name, city_id'
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

    // Crear perfil del usuario (el usuario ya fue creado en auth.users desde el cliente)
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
      return new Response(JSON.stringify({ error: 'Error al crear el perfil' }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`✅ Perfil creado para usuario: ${userId}`)

    // Éxito: perfil creado
    return new Response(JSON.stringify({
      success: true,
      message: 'Perfil creado exitosamente.',
      profile: {
        id: profileData.id,
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
