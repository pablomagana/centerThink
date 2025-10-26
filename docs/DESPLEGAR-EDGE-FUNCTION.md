# 🚀 Desplegar Edge Function Corregida

## 🎯 Cambio Realizado

He corregido la Edge Function `register-user` para que **SÍ envíe el email de confirmación** cuando un usuario se registra.

### El problema era:
- Cuando usamos `admin.createUser()`, Supabase NO envía emails automáticamente
- Es una operación administrativa, por eso no envía emails por defecto

### La solución:
- Usar `generateLink()` después de crear el usuario
- Esto genera el link Y activa el envío del email usando el template configurado

---

## ⚡ Opción 1: Desplegar con Supabase CLI (Recomendado)

### Si tienes Supabase CLI instalado:

```bash
# Verificar que estás logueado
supabase login

# Vincular tu proyecto (si no lo has hecho)
supabase link --project-ref lzqhfgeduchvizykaqih

# Desplegar la función
supabase functions deploy register-user
```

### Si NO tienes Supabase CLI:

**Instalar con Homebrew (Mac):**
```bash
brew install supabase/tap/supabase
```

**O con NPM:**
```bash
npm install -g supabase
```

**Después ejecuta:**
```bash
supabase login
supabase link --project-ref lzqhfgeduchvizykaqih
supabase functions deploy register-user
```

---

## 🌐 Opción 2: Desplegar Manualmente desde el Dashboard

Si prefieres no instalar el CLI, puedes hacerlo desde el Dashboard:

### Paso 1: Ir a Edge Functions

Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/functions

### Paso 2: Editar la función

1. Busca `register-user` en la lista
2. Haz clic en los 3 puntos (⋮) → **Edit**
3. Se abrirá un editor

### Paso 3: Copiar el código actualizado

1. Abre: `supabase/functions/register-user/index.ts` en tu editor local
2. Selecciona TODO el código (Cmd+A / Ctrl+A)
3. Copia (Cmd+C / Ctrl+C)

### Paso 4: Pegar en el Dashboard

1. En el editor del Dashboard, selecciona TODO el código existente
2. Pégalo con el código nuevo
3. Haz clic en **Deploy** o **Save**

### Paso 5: Verificar deployment

Espera unos segundos y verás un mensaje de éxito.

---

## ✅ Verificar que Funciona

### Después de desplegar:

**1. Registra un usuario nuevo:**
```
https://centerthink.pages.dev/register
```

**2. Verifica en SQL:**
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
LIMIT 1;
```

**3. Revisa tu email:**
- Bandeja de entrada
- **Carpeta de spam** (importante!)

---

## 🔍 Ver Logs de la Edge Function

Para depurar si hay algún error:

### Con CLI:
```bash
supabase functions logs register-user
```

### Desde Dashboard:
1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/functions
2. Haz clic en `register-user`
3. Ve a la pestaña **Logs**
4. Busca mensajes como:
   - ✅ `Email de confirmación enviado a: [email]`
   - ❌ `Error generating confirmation link`

---

## 🐛 Troubleshooting

### Error: "Cannot find name 'Deno'"
- Esto es normal en desarrollo local
- Deno solo existe en el runtime de Supabase
- La función funcionará correctamente en producción

### Email sigue sin llegar
1. Verifica que `confirmation_sent_at` tenga valor (no NULL)
2. Si tiene valor, el problema es SMTP o está en spam
3. Si es NULL, hay error en la función (revisa logs)

### Error al desplegar
```bash
# Si hay problemas de autenticación
supabase logout
supabase login

# Si hay problemas de linking
supabase link --project-ref lzqhfgeduchvizykaqih --password [tu-db-password]
```

---

## 📝 Resumen

**Lo que hice:**
1. ✅ Corregí la Edge Function para enviar emails manualmente
2. ✅ Uso `generateLink()` que activa el envío de email
3. ✅ El código está listo en `supabase/functions/register-user/index.ts`

**Lo que necesitas hacer:**
1. Desplegar la función (Opción 1 o 2)
2. Probar registrando un usuario nuevo
3. Verificar que el email llega

---

## 🎯 Siguiente Paso

**Por favor:**
1. Elige qué método prefieres (CLI o Dashboard manual)
2. Despliega la función
3. Prueba registrando un usuario
4. Dime si el email llega

**¿Prefieres que te guíe con el CLI o con el método manual del Dashboard?** 🚀
