# 🔍 Diagnóstico: SMTP Configurado pero No Envía Emails

## ✅ Confirmado: SMTP está configurado

Si ya tienes SMTP configurado en Supabase, pero los emails de confirmación no llegan, hay otras causas posibles.

---

## 🚨 Causas Posibles

### **Causa 1: Configuración de "Enable Email Confirmations" Deshabilitada**

**El problema más común:**
Supabase tiene un setting global para habilitar/deshabilitar emails de confirmación.

**Cómo verificar:**

1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/settings/auth
2. Busca la sección: **"Email Auth"** o **"Auth Settings"**
3. Verifica que esté **HABILITADO**: `Enable email confirmations`
4. Si está deshabilitado, los usuarios se crean pero NO se envían emails

**Solución:**
```
✅ Enable email confirmations → ON
✅ Enable email change confirmations → ON (recomendado)
✅ Secure email change → ON (recomendado)
```

---

### **Causa 2: Template de Confirmación No Configurado o Vacío**

Si el template de confirmación está vacío o tiene errores, Supabase puede fallar al enviar el email silenciosamente.

**Cómo verificar:**

1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/templates
2. Haz clic en **"Confirm signup"**
3. Verifica que:
   - ✅ **Subject** tenga contenido (no esté vacío)
   - ✅ **Message body** tenga HTML (no esté vacío)
   - ✅ Contenga la variable: `{{ .ConfirmationURL }}`

**Solución:**
Si está vacío o tiene errores, copia el template de: `docs/supabase-email-templates/confirmation-email.html`

---

### **Causa 3: Usuario Creado con `email_confirm: true`**

Si el usuario se crea con `email_confirm: true`, Supabase NO envía el email porque asume que el email ya está confirmado.

**Cómo verificar en el código:**

Abre: `supabase/functions/register-user/index.ts`

Busca la línea ~135 y verifica que diga:
```typescript
email_confirm: false,  // ✅ Debe ser FALSE para que envíe email
```

**Si dice `true`, cámbialo a `false`.**

---

### **Causa 4: Los Emails Se Están Enviando pero Van a Spam**

Es posible que los emails SÍ se estén enviando, pero tu proveedor de email los marca como spam.

**Cómo verificar:**

1. Revisa tu carpeta de **Spam/Correo no deseado**
2. Busca emails de: `noreply@mail.app.supabase.io` o tu email configurado en SMTP
3. Si están ahí, marca como "No es spam"

**Solución:**
- Configura SPF y DKIM en tu dominio (si usas dominio personalizado)
- O usa un email de Gmail/Outlook conocido como sender

---

### **Causa 5: Rate Limiting de Supabase**

Supabase tiene rate limits para emails de confirmación:
- **3 emails de confirmación por hora** por usuario (para prevenir spam)

**Cómo verificar:**

1. ¿Has intentado registrarte múltiples veces con el mismo email?
2. Si sí, espera 1 hora y prueba de nuevo
3. O usa un email diferente para probar

---

### **Causa 6: Logs Muestran Errores SMTP**

Los logs de Supabase pueden mostrar errores específicos de SMTP que explican por qué no se envían.

**Cómo verificar:**

1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/logs/explorer
2. En la barra de búsqueda, filtra por: `auth`
3. Busca logs recientes después de registrar un usuario
4. Busca errores como:
   - `SMTP connection failed`
   - `Invalid credentials`
   - `Email sending failed`
   - `Rate limit exceeded`

**Solución según el error:**
- `Connection failed` → Verifica Host y Port
- `Invalid credentials` → Verifica Username/Password
- `Rate limit` → Espera 1 hora o usa otro email

---

### **Causa 7: Redirect URL No Configurada Correctamente**

Si las Redirect URLs no están bien configuradas, Supabase puede no generar el link correctamente.

**Cómo verificar:**

1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/url-configuration
2. Verifica:
   ```
   Site URL: https://centerthink.pages.dev

   Redirect URLs:
   https://centerthink.pages.dev/**
   https://centerthink.pages.dev/login
   http://localhost:3000/**
   ```

**Importante:** Debe tener `/**` al final para permitir cualquier ruta.

---

## 🔬 Diagnóstico Paso a Paso

Sigue estos pasos en orden:

### **Paso 1: Verificar Enable Email Confirmations**
```
Dashboard → Settings → Auth → Enable email confirmations
✅ Debe estar ON
```

### **Paso 2: Verificar Template**
```
Dashboard → Auth → Templates → Confirm signup
✅ Debe tener Subject y Body
✅ Debe contener {{ .ConfirmationURL }}
```

### **Paso 3: Verificar URLs**
```
Dashboard → Auth → URL Configuration
✅ Site URL: https://centerthink.pages.dev
✅ Redirect URLs: https://centerthink.pages.dev/**
```

### **Paso 4: Verificar Logs**
```
Dashboard → Logs → Explorer → Filtrar por "auth"
✅ Buscar errores de email después de registro
```

### **Paso 5: Probar con Email Fresco**
```
1. Usa un email que NO hayas usado antes
2. Registra el usuario
3. Espera 2-3 minutos
4. Revisa bandeja de entrada Y spam
```

---

## 🧪 Script de Prueba SQL

Ejecuta este SQL para ver el estado de los usuarios registrados:

```sql
-- Ver usuarios recientes y su estado de confirmación
SELECT
  id,
  email,
  created_at,
  email_confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Confirmado'
    ELSE '❌ Sin confirmar'
  END as estado,
  confirmation_sent_at,
  CASE
    WHEN confirmation_sent_at IS NOT NULL THEN '📧 Email enviado'
    ELSE '⚠️ Email NO enviado'
  END as estado_email
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
```

**Interpreta los resultados:**
- Si `confirmation_sent_at` es NULL → Supabase NO intentó enviar el email
- Si `confirmation_sent_at` tiene fecha → Supabase SÍ intentó enviar (revisa spam)

---

## 📋 Checklist Rápido

- [ ] `Enable email confirmations` está ON
- [ ] Template "Confirm signup" tiene contenido
- [ ] Template contiene `{{ .ConfirmationURL }}`
- [ ] Site URL es `https://centerthink.pages.dev`
- [ ] Redirect URLs incluye `https://centerthink.pages.dev/**`
- [ ] SMTP configurado correctamente (ya lo tienes ✅)
- [ ] Probé con email nuevo (no usado antes)
- [ ] Revisé carpeta de spam
- [ ] Logs no muestran errores de SMTP
- [ ] `email_confirm: false` en Edge Function

---

## 🎯 Siguiente Paso

**Por favor verifica:**

1. **Ve al Dashboard de Supabase** y confirma:
   - ¿Está habilitado "Enable email confirmations"?
   - ¿El template de "Confirm signup" tiene contenido?
   - ¿Las Redirect URLs están configuradas?

2. **Revisa los logs:**
   - Ve a Logs → Explorer → Filtra por "auth"
   - Busca errores después de registrar un usuario

3. **Ejecuta el SQL de prueba** para ver si `confirmation_sent_at` tiene valor

**Dime qué encuentras y te ayudo a solucionar el problema específico.** 🔍
