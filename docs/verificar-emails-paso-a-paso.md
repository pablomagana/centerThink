# ✅ Verificación Paso a Paso - Emails de Confirmación

Sigue estos pasos EXACTAMENTE en orden. Marca cada checkbox cuando lo completes.

---

## 📋 PASO 1: Verificar Configuración Básica de Auth

### 1.1 Ir a Settings de Auth
1. Abre: https://app.supabase.com/project/lzqhfgeduchvizykaqih/settings/auth
2. Scroll hacia abajo hasta encontrar la sección **"Email Auth"** o **"User Signups"**

### 1.2 Verificar estos toggles/checkboxes
Busca y verifica el estado de CADA UNO:

```
[ ] Enable email confirmations
    → Debe estar ON/Habilitado
    → Si está OFF, actívalo y guarda

[ ] Enable email change confirmations
    → Puede estar ON u OFF (no afecta registro)

[ ] Confirm email
    → Si existe esta opción, debe estar ON
```

**⚠️ IMPORTANTE:** Si "Enable email confirmations" estaba OFF, ese es el problema. Actívalo y guarda.

---

## 📋 PASO 2: Verificar Template de Email

### 2.1 Ir a Email Templates
1. Abre: https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/templates
2. Deberías ver una lista de templates

### 2.2 Abrir "Confirm signup"
1. Haz clic en **"Confirm signup"** en la lista
2. Deberías ver dos campos:
   - **Subject line** (línea de asunto)
   - **Message (Body)** (cuerpo del email)

### 2.3 Verificar contenido

**Subject line:**
```
¿Está vacío? [ ] Sí [ ] No
¿Tiene texto? [ ] Sí [ ] No
```

**Message (Body):**
```
¿Está vacío? [ ] Sí [ ] No
¿Tiene HTML? [ ] Sí [ ] No
¿Contiene {{ .ConfirmationURL }}? [ ] Sí [ ] No
```

**Si alguno está VACÍO o falta {{ .ConfirmationURL }}, ese es el problema.**

### 2.4 Configurar template (si está vacío)

**Copia este Subject:**
```
Confirma tu cuenta en centerThink 🎉
```

**Para el Body:**
1. Abre el archivo: `docs/supabase-email-templates/confirmation-email.html` en tu editor
2. Selecciona TODO el contenido (Cmd+A o Ctrl+A)
3. Copia (Cmd+C o Ctrl+C)
4. Vuelve al Dashboard de Supabase
5. Pega en el campo "Message (Body)"
6. Haz clic en **Save**

---

## 📋 PASO 3: Verificar URLs de Redirección

### 3.1 Ir a URL Configuration
1. Abre: https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/url-configuration

### 3.2 Verificar Site URL
```
Site URL actual: ___________________________

¿Es exactamente esto?: https://centerthink.pages.dev
[ ] Sí, es exacto
[ ] No, es diferente
[ ] Está vacío
```

**Si no es exacto, cámbialo a:** `https://centerthink.pages.dev`

### 3.3 Verificar Redirect URLs
```
¿Contiene?: https://centerthink.pages.dev/**
[ ] Sí
[ ] No
[ ] No hay nada en Redirect URLs
```

**Si falta, agrégalo. Debe quedar así (una URL por línea):**
```
https://centerthink.pages.dev/**
http://localhost:3000/**
```

**Guarda los cambios.**

---

## 📋 PASO 4: Verificar Estado de Usuarios en Base de Datos

### 4.1 Abrir SQL Editor
1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/sql/new

### 4.2 Ejecutar este SQL
Copia y pega este código y haz clic en **Run**:

```sql
-- Ver últimos 5 usuarios registrados y su estado
SELECT
  email,
  created_at,
  email_confirmed_at,
  confirmation_sent_at,
  confirmed_at,
  CASE
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
    WHEN confirmation_sent_at IS NOT NULL THEN '📧 Email enviado, pendiente confirmación'
    ELSE '❌ Email NO enviado'
  END as estado
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;
```

### 4.3 Interpreta los resultados

**Para cada usuario registrado, anota:**

```
Usuario 1:
- email: _______________________
- confirmation_sent_at: [ ] NULL [ ] Tiene fecha
- email_confirmed_at: [ ] NULL [ ] Tiene fecha
- Estado: _______________________

Usuario 2:
- email: _______________________
- confirmation_sent_at: [ ] NULL [ ] Tiene fecha
- email_confirmed_at: [ ] NULL [ ] Tiene fecha
- Estado: _______________________
```

**🔍 Interpretación:**
- Si `confirmation_sent_at` es **NULL** → Supabase NO intentó enviar el email (problema de configuración)
- Si `confirmation_sent_at` tiene **fecha** → Supabase SÍ envió el email (revisa spam o puede haber fallado SMTP)

---

## 📋 PASO 5: Revisar Logs de Errores

### 5.1 Abrir Logs Explorer
1. Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/logs/explorer

### 5.2 Filtrar por Auth
En el campo de búsqueda o filtros, escribe: `auth`

### 5.3 Buscar errores recientes
Ordena por fecha (más recientes primero) y busca líneas que contengan:
- `email`
- `smtp`
- `confirmation`
- `error`
- `failed`

**¿Ves algún error? Cópialo aquí:**
```
Línea 1: ___________________________________________
Línea 2: ___________________________________________
Línea 3: ___________________________________________
```

---

## 📋 PASO 6: Verificar Edge Function

### 6.1 Revisar el código
Abre: `supabase/functions/register-user/index.ts`

### 6.2 Buscar la línea ~135
Busca esta parte del código:

```typescript
.createUser({
  email,
  password,
  email_confirm: ?,  // ← ¿Qué dice aquí?
```

**¿Qué valor tiene `email_confirm`?**
```
[ ] false (correcto - enviará email)
[ ] true (incorrecto - NO enviará email)
```

**Si dice `true`, ese es el problema. Debe ser `false`.**

---

## 📋 PASO 7: Probar con Usuario Nuevo

### 7.1 Usar email fresco
**IMPORTANTE:** Usa un email que NUNCA hayas usado antes en la app.

```
Email a usar: _______________________
(Asegúrate de tener acceso a este email)
```

### 7.2 Registrar usuario
1. Ve a: https://centerthink.pages.dev/register
2. Completa el formulario con el email nuevo
3. Haz clic en "Crear Cuenta"
4. Anota la hora exacta: __________

### 7.3 Esperar y buscar email
1. Espera 2-3 minutos
2. Revisa tu bandeja de entrada
3. **MUY IMPORTANTE:** Revisa también SPAM/Correo no deseado

**¿Llegó el email?**
```
[ ] Sí, en bandeja principal
[ ] Sí, en spam
[ ] No llegó nada
```

### 7.4 Si NO llegó, ejecutar SQL inmediatamente

Vuelve al SQL Editor y ejecuta:
```sql
-- Reemplaza 'tu-email@example.com' con el email que usaste
SELECT
  email,
  created_at,
  confirmation_sent_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'tu-email@example.com';
```

**Resultado:**
```
confirmation_sent_at: [ ] NULL [ ] Tiene fecha
```

---

## 🎯 RESULTADOS

Basándome en tus verificaciones:

### Si `confirmation_sent_at` es NULL:
**Problema:** Supabase no está intentando enviar el email

**Causas posibles:**
1. "Enable email confirmations" está OFF → Ve al PASO 1
2. `email_confirm: true` en código → Ve al PASO 6
3. Template vacío → Ve al PASO 2

### Si `confirmation_sent_at` tiene fecha pero no llegó:
**Problema:** Supabase SÍ envió, pero falló el SMTP o fue a spam

**Causas posibles:**
1. Está en spam → Revisa carpeta spam
2. SMTP tiene credenciales incorrectas → Revisa configuración SMTP
3. Rate limit → Espera 1 hora y prueba con otro email

---

## 📞 Siguiente Paso

**Por favor, completa TODOS los pasos de arriba y dime:**

1. ¿"Enable email confirmations" estaba ON o OFF?
2. ¿El template tenía contenido o estaba vacío?
3. ¿`confirmation_sent_at` es NULL o tiene fecha?
4. ¿Qué errores viste en los logs (si los hay)?

Con esta información te doy la solución exacta. 🎯
