# ✅ Solución: Email de Confirmación en Registro

## 🔍 Problema Identificado

El sistema marcaba los emails como enviados (`confirmation_sent_at` tenía valor) pero **no se enviaban realmente** los emails de confirmación.

**Causa raíz:** Se estaba usando `admin.generateLink()` que solo **genera el link** pero **NO envía el email automáticamente**.

---

## ✅ Solución Implementada

### Flujo Híbrido (Cliente + Edge Function)

Cambiamos a un flujo híbrido que aprovecha las fortalezas de Supabase:

1. **Cliente (`auth.signUp()`)**: Crea el usuario en `auth.users` Y envía el email automáticamente ✅
2. **Edge Function**: Solo crea el perfil en `user_profiles` (requiere service role)

### Ventajas de esta solución:

✅ **Email enviado automáticamente** por Supabase (no hay que hacer llamadas manuales)
✅ **Usa el flujo nativo de Supabase** (más confiable)
✅ **Respeta la configuración de plantillas** en Supabase Dashboard
✅ **Más simple y mantenible**
✅ **Menos código** en Edge Function

---

## 📋 Cambios Realizados

### 1. Cliente: `user.service.js` - Método `register()`

**Antes (❌ No funcionaba):**
```javascript
async register(userData) {
  // Llamaba al Edge Function para todo
  const { data, error } = await supabase.functions.invoke('register-user', {
    body: userData,
    method: 'POST'
  })
  // ...
}
```

**Después (✅ Funciona):**
```javascript
async register(userData) {
  // 1. Crear usuario con auth.signUp() → envía email automáticamente
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { first_name, last_name },
      emailRedirectTo: `${window.location.origin}/login`
    }
  })

  // 2. Crear perfil con Edge Function (requiere service role)
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

  return { success: true, user: {...} }
}
```

**Validaciones incluidas:**
- Email válido (regex)
- Contraseña mínimo 8 caracteres
- Al menos 1 mayúscula, 1 minúscula, 1 número

---

### 2. Edge Function: `register-user/index.ts`

**Antes (❌ No enviaba emails):**
```typescript
// Usaba admin.generateLink() que NO envía emails
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'signup',
  email,
  password,
  ...
})
```

**Después (✅ Solo crea perfil):**
```typescript
interface RegisterUserRequest {
  userId: string;  // Recibe el ID del usuario ya creado
  first_name: string;
  last_name: string;
  city_id: string;
  phone?: string;
}

// Solo crea el perfil (usuario ya existe)
const { data: profileData, error } = await supabaseAdmin
  .from('user_profiles')
  .insert({
    id: userId,  // Usa el ID del usuario ya creado
    first_name,
    last_name,
    role: 'user',
    cities: [city_id],
    phone: phone || null
  })
```

**Ahora el Edge Function:**
- ✅ Solo crea el perfil en `user_profiles`
- ✅ Valida que la ciudad exista
- ✅ Mucho más simple (menos líneas de código)
- ✅ No necesita manejar contraseñas ni emails

---

## 🚀 Cómo Desplegar

```bash
# 1. Desplegar Edge Function actualizado
supabase functions deploy register-user

# 2. No necesitas configurar APP_URL (el cliente usa window.location.origin)

# 3. Ver logs después de probar
supabase functions logs register-user --limit 20
```

---

## 🧪 Cómo Probar

### 1. Registro de Usuario

1. Ve a: https://centerthink.pages.dev/register
2. Completa el formulario con un email real
3. Haz clic en "Registrarse"

### 2. Verificar en Console del Navegador

Deberías ver estos logs:
```
✅ Usuario creado en auth.users: test@example.com
📧 Email de confirmación enviado automáticamente por Supabase
✅ Perfil creado en user_profiles
```

### 3. Verificar Email

- Revisa tu bandeja de entrada (y spam)
- Deberías recibir un email con el asunto configurado en Supabase
- El email incluye un link de confirmación

### 4. Verificar en Base de Datos

```sql
SELECT
  email,
  created_at,
  confirmation_sent_at,
  email_confirmed_at,
  CASE
    WHEN confirmation_sent_at IS NOT NULL THEN '✅ Email enviado'
    ELSE '❌ Email NO enviado'
  END as estado
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;
```

**Si funciona correctamente:**
- `confirmation_sent_at`: tiene fecha/hora (no NULL)
- `email_confirmed_at`: NULL (hasta que el usuario confirme)
- Estado: "✅ Email enviado"

---

## 📊 Comparación Antes vs Después

| Aspecto | ❌ Antes (Edge Function) | ✅ Después (Híbrido) |
|---------|-------------------------|---------------------|
| **Método usado** | `admin.generateLink()` | `auth.signUp()` |
| **Email enviado** | ❌ No (solo generaba link) | ✅ Sí (automático) |
| **Complejidad** | Alta (todo en Edge Function) | Baja (responsabilidades separadas) |
| **Validación cliente** | Ninguna | Email, password, campos requeridos |
| **Manejo de errores** | Básico | Detallado (email duplicado, etc.) |
| **Seguridad** | Service role para todo | Service role solo para perfil |

---

## 🔧 Configuración Requerida en Supabase

### 1. Email Templates (Dashboard)

Ve a: **Authentication > Email Templates > Confirm signup**

Tu plantilla debe incluir:
- `{{ .ConfirmationURL }}` - Link de confirmación
- Diseño personalizado (ver `docs/supabase-email-templates/`)

### 2. SMTP Configuration

Ve a: **Project Settings > Auth > SMTP Settings**

Configura tu servidor SMTP:
- Host
- Port
- Username
- Password
- Sender email
- Sender name

### 3. Email Auth Enabled

Ve a: **Authentication > Providers > Email**

✅ Asegúrate que "Email" esté habilitado
✅ Asegúrate que "Confirm email" esté habilitado

---

## 🎯 Flujo Completo del Usuario

1. **Usuario se registra** en `/register`
2. **`auth.signUp()`** crea usuario en `auth.users`
3. **Supabase envía email** automáticamente (usando plantilla configurada)
4. **Edge Function crea perfil** en `user_profiles`
5. **Usuario recibe email** con link de confirmación
6. **Usuario hace clic en link** → email confirmado
7. **Usuario puede hacer login** en `/login`

---

## ⚠️ Notas Importantes

### Errores de TypeScript en VSCode

Si ves errores rojos en `register-user/index.ts`:
- ❌ "Cannot find module 'https://deno.land/...'"
- ❌ "Cannot find name 'Deno'"

**Estos son normales** - VSCode no reconoce tipos de Deno, pero el código funcionará correctamente cuando esté desplegado en Supabase.

### RLS (Row Level Security)

El Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` que bypasea RLS, por lo que puede insertar en `user_profiles` sin problemas.

### Rollback en Caso de Error

Si falla la creación del perfil:
- ✅ Usuario ya fue creado en `auth.users`
- ❌ No tiene perfil en `user_profiles`
- ⚠️ Puede hacer login pero faltarán datos

**Solución:** El admin puede crear el perfil manualmente o el usuario puede intentar registrarse de nuevo (detectará email duplicado).

---

## 🐛 Troubleshooting

### Problema: "Este email ya está registrado"

**Causa:** El usuario se creó en `auth.users` pero falló el perfil.

**Solución:**
```sql
-- Opción 1: Eliminar usuario de auth y reintentar
-- (requiere acceso a SQL en Supabase)
DELETE FROM auth.users WHERE email = 'test@example.com';

-- Opción 2: Crear perfil manualmente
INSERT INTO user_profiles (id, first_name, last_name, role, cities)
VALUES ('user-id-here', 'Test', 'User', 'user', ARRAY['city-id']);
```

### Problema: Email no llega

**Checklist:**
1. ✅ SMTP configurado en Supabase
2. ✅ "Confirm email" habilitado en Email provider
3. ✅ Revisar carpeta de spam
4. ✅ Verificar límites de email (Supabase free: 2/hora)
5. ✅ Revisar logs: `supabase functions logs register-user`

### Problema: Error al crear perfil

**Logs esperados en Edge Function:**
```
✅ Perfil creado para usuario: abc-123-def
```

Si ves error, verificar:
- ✅ Ciudad existe en tabla `cities`
- ✅ `userId` es válido
- ✅ No hay restricciones de RLS bloqueando el insert

---

## ✅ Conclusión

La solución híbrida (cliente + Edge Function) es:
- ✅ Más simple
- ✅ Más confiable
- ✅ Más mantenible
- ✅ Usa el flujo nativo de Supabase
- ✅ Emails enviados automáticamente

**Estado actual:** ✅ Código actualizado, listo para desplegar y probar.
