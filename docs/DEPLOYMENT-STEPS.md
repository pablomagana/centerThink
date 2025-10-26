# 🚀 Pasos para Desplegar el Edge Function Actualizado

## ✅ Cambios Realizados

He reemplazado el código del Edge Function `register-user` con tu nueva implementación que:
- ✅ Usa `generateLink()` con el parámetro `password` (crítico)
- ✅ Crea el usuario Y envía el email de confirmación en una sola operación
- ✅ Usa el ID del usuario devuelto para crear el perfil
- ✅ Incluye rollback automático si falla la creación del perfil

---

## 📋 Comandos a Ejecutar

### 1. Verificar que APP_URL esté configurado

```bash
supabase secrets list
```

**Deberías ver:**
```
APP_URL
```

### 2. Si NO ves APP_URL, configurarlo:

```bash
supabase secrets set APP_URL=https://centerthink.pages.dev
```

### 3. Desplegar el Edge Function actualizado:

```bash
supabase functions deploy register-user
```

**Deberías ver:**
```
Deploying Function register-user (project ref: lzqhfgeduchvizykaqih)
Bundled register-user size: X.X KB
Deployed Function register-user in X.Xs
```

---

## 🧪 Probar el Flujo de Registro

### Opción 1: Desde tu aplicación (recomendado)

1. Ve a: https://centerthink.pages.dev/register
2. Registra un usuario con un email nuevo (usa un email real que puedas verificar)
3. Completa el formulario y haz clic en "Registrarse"
4. **Revisa tu email** (bandeja de entrada y spam)
5. Deberías recibir un email con el asunto "¡Bienvenido a centerThink!"

### Opción 2: Usando curl (para debug)

```bash
curl -X POST https://lzqhfgeduchvizykaqih.supabase.co/functions/v1/register-user \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "first_name": "Test",
    "last_name": "User",
    "city_id": "TU_CITY_ID",
    "phone": "123456789"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "Registro exitoso. Revisa tu email para confirmar tu cuenta.",
  "user": {
    "id": "...",
    "email": "test@example.com",
    "first_name": "Test",
    "last_name": "User",
    "role": "user",
    "cities": ["..."]
  }
}
```

---

## 🔍 Verificar en la Base de Datos

Ejecuta este SQL en Supabase para verificar que el email se envió:

```sql
SELECT
  email,
  created_at,
  confirmation_sent_at,
  CASE
    WHEN confirmation_sent_at IS NULL THEN '❌ NO envió'
    ELSE '✅ SÍ envió'
  END as estado
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

**Deberías ver:**
- `confirmation_sent_at` con fecha/hora (no NULL)
- Estado: "✅ SÍ envió"

---

## 📧 Revisar Logs del Edge Function

Para ver qué está pasando en el Edge Function:

```bash
supabase functions logs register-user --limit 20
```

**Busca estos mensajes:**
```
✅ Usuario registrado: email@example.com
📧 Email de confirmación enviado automáticamente por Supabase
```

Si ves estos mensajes → **¡Funciona!** ✅

---

## 🐛 Troubleshooting

### Error: "supabase: command not found"

**Solución:** Instala Supabase CLI:
```bash
# Mac
brew install supabase/tap/supabase

# O con NPM
npm install -g supabase
```

### Error: "Project not linked"

**Solución:**
```bash
supabase link --project-ref lzqhfgeduchvizykaqih
```

### Error: "Invalid credentials"

**Solución:**
```bash
supabase logout
supabase login
```

### El email NO llega después del registro

**Checklist:**
1. ✅ Verificar que APP_URL esté configurado: `supabase secrets list`
2. ✅ Verificar que el SMTP esté configurado en Supabase Dashboard
3. ✅ Revisar carpeta de spam
4. ✅ Revisar logs del Edge Function: `supabase functions logs register-user`
5. ✅ Verificar en SQL que `confirmation_sent_at` tenga valor

---

## 📝 Diferencias Clave vs Código Anterior

### ❌ Código Anterior (No funcionaba):
```typescript
// 1. Crear usuario (sin email)
const { data: userData } = await supabaseAdmin.auth.admin.createUser({...})

// 2. Crear perfil
await supabaseAdmin.from('user_profiles').insert({...})

// 3. Intentar enviar email (separado, fallaba)
await supabaseAdmin.auth.admin.generateLink({...})
```

### ✅ Código Nuevo (Funciona):
```typescript
// 1. Generar link (crea usuario + envía email automáticamente)
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'signup',
  email,
  password, // ¡CRÍTICO! Incluir password aquí
  options: {...}
})

// 2. Usar el ID del usuario creado para el perfil
const userId = linkData.user.id
await supabaseAdmin.from('user_profiles').insert({
  id: userId,
  ...
})
```

**Por qué funciona ahora:**
- `generateLink()` con `password` crea el usuario en `auth.users` automáticamente
- Supabase envía el email de confirmación automáticamente (no necesitas llamadas extra)
- Usamos el ID devuelto por `generateLink()` para crear el perfil
- Si falla la creación del perfil, hacemos rollback eliminando el usuario

---

## ✅ Resumen de lo que cambiará

**Antes del despliegue:**
- ❌ Registro no envía emails
- ❌ Usuarios no pueden confirmar su cuenta

**Después del despliegue:**
- ✅ Registro crea usuario
- ✅ Email de confirmación se envía automáticamente
- ✅ Usuario recibe email con link de confirmación
- ✅ Usuario puede confirmar su cuenta haciendo clic en el link
- ✅ Después de confirmar, puede hacer login

---

## 🎯 Checklist Final

Antes de considerar esto completo:

- [ ] `supabase secrets list` muestra `APP_URL`
- [ ] `supabase functions deploy register-user` completado sin errores
- [ ] Registro de usuario desde https://centerthink.pages.dev/register
- [ ] Email de confirmación recibido (revisar spam)
- [ ] SQL muestra `confirmation_sent_at` con valor
- [ ] Logs muestran "✅ Usuario registrado" y "📧 Email de confirmación enviado"
- [ ] Usuario puede confirmar cuenta haciendo clic en link del email
- [ ] Usuario puede hacer login después de confirmar

**Si todos los checkmarks están completos → ¡Sistema funcionando!** 🎉

---

## 📞 Si Necesitas Ayuda

Si algo falla:
1. Copia el error completo
2. Copia los logs del Edge Function: `supabase functions logs register-user --limit 20`
3. Verifica la query SQL de arriba
4. Comparte los resultados para ayudarte a debuggear
