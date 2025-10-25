import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Crear cliente de Supabase con service_role key para admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Obtener el JWT del usuario que hace la petición
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verificar el usuario que hace la petición
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token)

    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: 'No autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener el perfil del usuario que hace la petición
    const { data: requestingProfile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, cities')
      .eq('id', requestingUser.id)
      .single()

    if (profileError || !requestingProfile) {
      return new Response(
        JSON.stringify({ error: 'Perfil no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Solo admin y supplier pueden resetear contraseñas
    if (!['admin', 'supplier'].includes(requestingProfile.role)) {
      return new Response(
        JSON.stringify({ error: 'No tienes permisos para resetear contraseñas' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener datos del body
    const { userId, newPassword, sendEmail } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'userId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Si sendEmail es true, enviar email de recuperación
    if (sendEmail) {
      // Obtener el email del usuario
      const { data: targetUser, error: targetUserError } = await supabaseAdmin.auth.admin.getUserById(userId)

      if (targetUserError || !targetUser) {
        return new Response(
          JSON.stringify({ error: 'Usuario no encontrado' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Enviar email de recuperación
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: targetUser.user.email!,
      })

      if (resetError) {
        return new Response(
          JSON.stringify({ error: `Error enviando email: ${resetError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Email de recuperación enviado a ${targetUser.user.email}`,
          method: 'email'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Si no sendEmail, establecer contraseña específica
    if (!newPassword || newPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: 'La contraseña debe tener al menos 6 caracteres' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Obtener el perfil del usuario objetivo para validar permisos
    const { data: targetProfile, error: targetProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('cities')
      .eq('id', userId)
      .single()

    if (targetProfileError) {
      return new Response(
        JSON.stringify({ error: 'Usuario objetivo no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Si es supplier, verificar que el usuario objetivo esté en sus ciudades
    if (requestingProfile.role === 'supplier') {
      const targetCities = targetProfile.cities || []
      const requestingCities = requestingProfile.cities || []

      const hasCommonCity = targetCities.some((cityId: string) =>
        requestingCities.includes(cityId)
      )

      if (!hasCommonCity) {
        return new Response(
          JSON.stringify({ error: 'No tienes permisos para gestionar este usuario' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Actualizar la contraseña
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Error actualizando contraseña: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Contraseña actualizada exitosamente',
        method: 'manual',
        user: {
          id: updatedUser.user.id,
          email: updatedUser.user.email
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error en reset-user-password:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Error interno del servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
