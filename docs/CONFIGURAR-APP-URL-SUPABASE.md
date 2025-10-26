# 🔧 Configurar Variable APP_URL en Supabase

## 🎯 Problema Identificado

La Edge Function `register-user` usa la variable de entorno `APP_URL` pero NO está configurada en Supabase.

**Línea 199 del index.ts:**
```typescript
redirectTo: `${Deno.env.get('APP_URL') || 'http://localhost:3000'}/login`
```

Esta variable es necesaria para que Supabase sepa a dónde redirigir después de confirmar el email.

---

## ⚡ Solución Rápida (2 minutos)

### **Opción 1: Usando Supabase CLI (Recomendado)**

Si tienes Supabase CLI instalado:

```bash
# Configurar el secret en Supabase
supabase secrets set APP_URL=https://centerthink.pages.dev

# Verificar que se guardó
supabase secrets list
```

---

### **Opción 2: Desde el Dashboard de Supabase**

**IMPORTANTE:** Supabase no permite configurar secrets desde el Dashboard directamente. **Debes usar el CLI.**

---

## 📋 Paso a Paso con CLI

### **1. Verificar que tienes Supabase CLI instalado:**

```bash
supabase --version
```

Si no lo tienes instalado:
```bash
# Mac
brew install supabase/tap/supabase

# O con NPM
npm install -g supabase
```

---

### **2. Login en Supabase:**

```bash
supabase login
```

Esto abrirá tu navegador para autenticarte.

---

### **3. Vincular tu proyecto (si no lo has hecho):**

```bash
supabase link --project-ref lzqhfgeduchvizykaqih
```

Te pedirá la contraseña de la base de datos (la que usaste al crear el proyecto).

---

### **4. Configurar la variable APP_URL:**

```bash
supabase secrets set APP_URL=https://centerthink.pages.dev
```

Deberías ver:
```
Finished supabase secrets set.
```

---

### **5. Verificar que se guardó:**

```bash
supabase secrets list
```

Deberías ver:
```
APP_URL
```

---

### **6. Redesplegar la Edge Function:**

Después de configurar el secret, necesitas redesplegar la función para que tome el cambio:

```bash
supabase functions deploy register-user
```

---

## ✅ Verificar que Funciona

### **1. Registrar un usuario de prueba:**

1. Ve a: https://centerthink.pages.dev/register
2. Registra un usuario con email nuevo
3. Espera 1-2 minutos

### **2. Revisar logs:**

```bash
supabase functions logs register-user --limit 20
```

**Busca este mensaje:**
```
✅ Usuario registrado: [email]
📧 Email de confirmación enviado a: [email]
```

Si ves esto → **¡Funciona!** ✅

---

## 🐛 Troubleshooting

### Error: "supabase: command not found"

**Solución:** Instala Supabase CLI:
```bash
brew install supabase/tap/supabase
```

---

### Error: "Project not linked"

**Solución:**
```bash
supabase link --project-ref lzqhfgeduchvizykaqih
```

---

### Error: "Invalid credentials"

**Solución:**
```bash
supabase logout
supabase login
```

---

### La variable no se guarda

**Solución:**
1. Verifica que estés logueado: `supabase login`
2. Verifica que el proyecto esté vinculado: `supabase status`
3. Intenta de nuevo: `supabase secrets set APP_URL=https://centerthink.pages.dev`

---

## 📝 Variables de Entorno Necesarias

Para la Edge Function `register-user`, estas son las variables que necesita:

| Variable | Valor | ¿Requerido? | Configurado? |
|----------|-------|-------------|--------------|
| `APP_URL` | `https://centerthink.pages.dev` | ✅ Sí | ❌ Falta |
| `SUPABASE_URL` | (automático) | ✅ Sí | ✅ Auto |
| `SUPABASE_SERVICE_ROLE_KEY` | (automático) | ✅ Sí | ✅ Auto |

**Solo necesitas configurar `APP_URL` manualmente.** Las otras son automáticas.

---

## 🎯 Resumen

**Comando a ejecutar:**
```bash
# 1. Login
supabase login

# 2. Link (si no lo has hecho)
supabase link --project-ref lzqhfgeduchvizykaqih

# 3. Configurar APP_URL
supabase secrets set APP_URL=https://centerthink.pages.dev

# 4. Verificar
supabase secrets list

# 5. Redesplegar
supabase functions deploy register-user
```

**Después de esto, los emails de confirmación deberían enviarse correctamente.** ✅

---

## 🧪 Probar Después de Configurar

1. Registra un usuario en: https://centerthink.pages.dev/register
2. Revisa tu email (bandeja y spam)
3. Debería llegar el email de confirmación
4. Ejecuta este SQL para verificar:

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

Si dice **"✅ SÍ envió"** → ¡Problema resuelto! 🎉

---

## ❓ ¿Por Qué Es Necesario APP_URL?

La Edge Function usa `APP_URL` para:
1. Generar el link de confirmación correcto
2. Redirigir al usuario después de confirmar
3. Asegurar que el link apunte a tu dominio de producción

Sin esta variable:
- ❌ El link puede apuntar a `localhost`
- ❌ El link puede no funcionar en producción
- ❌ Supabase puede no generar el link correctamente

**Con la variable configurada:**
- ✅ Links apuntan a tu dominio de producción
- ✅ Redirección funciona correctamente
- ✅ Emails se envían sin problemas
