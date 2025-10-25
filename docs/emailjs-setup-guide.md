# Guía de Configuración de EmailJS

## ⚠️ Error 422: "The recipients address is empty"

Este error ocurre porque la plantilla de EmailJS no tiene configurado correctamente el campo **"To Email"**.

## 🔧 Solución: Configurar la Plantilla Correctamente

### Paso 1: Ir a tu plantilla en EmailJS

1. Ve a [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click en **Email Templates**
3. Selecciona tu plantilla (o crea una nueva)

### Paso 2: Configurar el campo "To Email"

En la configuración de la plantilla, busca el campo **"To Email"** en la parte superior.

**IMPORTANTE:** Debes usar la variable `{{to_email}}` en el campo "To Email" de la plantilla.

```
To Email: {{to_email}}
```

O si quieres incluir el nombre también:

```
To Email: {{user_name}} <{{to_email}}>
```

### Paso 3: Configurar las variables de la plantilla

Asegúrate de que tu plantilla tenga estas variables definidas:

**Variables requeridas:**
- `to_email` - Email del destinatario (DEBE estar en el campo "To Email")
- `user_name` - Nombre completo del usuario
- `temp_password` - Contraseña temporal
- `login_url` - URL de la aplicación
- `creator_name` - Nombre del admin que creó la cuenta

### Paso 4: Configuración del Subject

```
Subject: Bienvenido a centerThink - Credenciales de Acceso
```

O con variable:
```
Subject: Bienvenido {{user_name}} - Tus Credenciales de centerThink
```

### Paso 5: Configurar el cuerpo del email

Puedes usar el HTML de `docs/email-template.html` o un template más simple:

**Template Simple (Text/HTML):**

```html
Hola {{user_name}},

{{creator_name}} ha creado una cuenta para ti en centerThink.

Tus credenciales de acceso:
- Email: {{to_email}}
- Contraseña temporal: {{temp_password}}

Accede aquí: {{login_url}}

⚠️ Importante: Por seguridad, cambia tu contraseña después del primer inicio de sesión.

Saludos,
El equipo de centerThink
```

## 📋 Checklist de Verificación

- [ ] El campo "To Email" de la plantilla contiene `{{to_email}}`
- [ ] Todas las variables están definidas en el template
- [ ] El Service está conectado y activo
- [ ] Las variables de entorno en `.env` están correctas:
  - `VITE_EMAILJS_SERVICE_ID`
  - `VITE_EMAILJS_TEMPLATE_ID`
  - `VITE_EMAILJS_PUBLIC_KEY`
  - `VITE_APP_URL`
- [ ] El servidor se reinició después de configurar `.env`

## 🧪 Probar la Configuración

Después de configurar correctamente:

1. Reinicia el servidor: `npm run dev`
2. Ve a Gestión de Usuarios
3. Crea un usuario de prueba con TU email
4. Verifica que recibiste el email

## 🔍 Verificar Variables en el Navegador

Abre la consola del navegador y ejecuta:

```javascript
console.log({
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
  APP_URL: import.meta.env.VITE_APP_URL
});
```

Todas deben tener valores (no `undefined`).

## 💡 Ejemplo de Configuración Mínima

Si quieres probar rápidamente, crea una plantilla con esta configuración:

**To Email:** `{{to_email}}`

**Subject:** `Credenciales centerThink`

**Content:**
```
Hola {{user_name}},

Tu contraseña temporal es: {{temp_password}}

Accede en: {{login_url}}

Creado por: {{creator_name}}
```

Guarda y prueba nuevamente.

## 🐛 Otros Errores Comunes

### Error: "Invalid service ID"
- Verifica que `VITE_EMAILJS_SERVICE_ID` sea correcto

### Error: "Invalid template ID"
- Verifica que `VITE_EMAILJS_TEMPLATE_ID` sea correcto

### Error: "Invalid public key"
- Verifica que `VITE_EMAILJS_PUBLIC_KEY` sea correcto
- Asegúrate de estar usando la Public Key, no la Private Key

### Email no llega (pero no hay error)
- Revisa la carpeta de spam
- Verifica límites de EmailJS (200 emails/mes en plan free)
- Revisa el historial en EmailJS Dashboard

---

# Configuración de Email de Confirmación de Registro

## 📧 Template para Confirmación de Cuenta

Además del template de credenciales de usuario, necesitas crear un segundo template para el email de confirmación que se envía cuando los usuarios se auto-registran.

## 🎨 Crear Template de Confirmación

### Paso 1: Crear Nuevo Template en EmailJS

1. Ve a [EmailJS Dashboard](https://dashboard.emailjs.com/admin)
2. Click en **Email Templates**
3. Click en **Create New Template**
4. Nómbralo: "centerThink - Confirmación de Registro"

### Paso 2: Configurar Campos del Template

**To Email:** `{{to_email}}`

**Subject:** `Confirma tu cuenta en centerThink`

**Content:** Usa el HTML de `docs/email-confirmation-template.html`

### Paso 3: Variables Requeridas

Este template requiere las siguientes variables:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{to_email}}` | Email del usuario | usuario@example.com |
| `{{user_name}}` | Nombre completo | Juan Pérez |
| `{{confirmation_link}}` | Link único de Supabase | https://xxx.supabase.co/auth/v1/verify?... |
| `{{app_url}}` | URL de la app | https://centerthink.pages.dev |
| `{{from_name}}` | Remitente | centerThink |

## 🔧 Configurar Variables de Entorno

### A. Variables Edge Function (Supabase Secrets)

Las Edge Functions de Supabase requieren secrets separados:

```bash
# Conectar a tu proyecto
supabase link --project-ref your-project-ref

# Configurar secrets para email de confirmación
supabase secrets set EMAILJS_SERVICE_ID=service_jsu8oli
supabase secrets set EMAILJS_CONFIRMATION_TEMPLATE_ID=template_xxxxx
supabase secrets set EMAILJS_PUBLIC_KEY=iNBU9s5uN2Bb-UOc6
supabase secrets set APP_URL=https://centerthink.pages.dev

# Verificar
supabase secrets list
```

**IMPORTANTE:**
- `EMAILJS_CONFIRMATION_TEMPLATE_ID` debe ser el ID del nuevo template de confirmación
- NO uses el mismo template ID que usas para credenciales de usuario
- Los secrets de Supabase son INDEPENDIENTES de las variables `.env` del frontend

### B. Redesplegar Edge Function

Después de configurar los secrets:

```bash
supabase functions deploy register-user
```

## 🧪 Probar el Flujo de Confirmación

1. Ve a `/register` en tu app
2. Completa el formulario de registro
3. Haz clic en "Registrarse"
4. Deberías ver mensaje: "¡Registro Exitoso! Revisa tu correo"
5. Revisa tu bandeja de entrada (y spam)
6. Haz clic en "Confirmar mi cuenta" en el email
7. Serás redirigido a `/login`
8. Inicia sesión con tus credenciales

## 📋 Checklist de Verificación

- [ ] Template de confirmación creado en EmailJS
- [ ] Campo "To Email" configurado con `{{to_email}}`
- [ ] Variables del template correctamente definidas
- [ ] Secrets configurados en Supabase con `supabase secrets set`
- [ ] Edge Function redesplegada con `supabase functions deploy`
- [ ] Límite de emails EmailJS no excedido (200/mes en free)

## 🔍 Verificar en Logs de Supabase

Para ver si el email se está enviando:

```bash
# Ver logs en tiempo real
supabase functions logs register-user --follow

# Ver logs recientes
supabase functions logs register-user
```

Busca estos mensajes:
- ✅ `Email de confirmación enviado exitosamente vía EmailJS`
- ❌ `Error al enviar email vía EmailJS: [detalles]`
- ⚠️ `EmailJS no configurado - variables de entorno faltantes`

## 🐛 Troubleshooting Email de Confirmación

### El email de confirmación no llega

**Posibles causas:**

1. **Secrets no configurados en Supabase**
   ```bash
   supabase secrets list
   # Debe mostrar: EMAILJS_SERVICE_ID, EMAILJS_CONFIRMATION_TEMPLATE_ID, etc.
   ```

2. **Template ID incorrecto**
   - Verifica el Template ID en EmailJS Dashboard
   - Asegúrate de usar el template de CONFIRMACIÓN, no el de credenciales

3. **Límite de emails excedido**
   - Revisa tu dashboard de EmailJS
   - Plan gratuito: 200 emails/mes

4. **Link de confirmación inválido**
   - Revisa los logs: `supabase functions logs register-user`
   - El link debe empezar con `https://xxx.supabase.co/auth/v1/verify`

### El link de confirmación no funciona

**Soluciones:**

1. **Verificar APP_URL en secrets**
   ```bash
   supabase secrets list
   # APP_URL debe ser tu dominio real
   ```

2. **Configurar redirect URLs en Supabase**
   - Ve a Authentication > URL Configuration
   - Agrega tu dominio a "Site URL" y "Redirect URLs"

3. **El link expira después de 24 horas**
   - Si el usuario tarda más, debe solicitar un nuevo email

## 📝 Diferencia entre los Dos Emails

Tu app ahora envía DOS tipos de emails diferentes:

### 1. Email de Credenciales (Admin crea usuario)
- **Template:** `VITE_EMAILJS_TEMPLATE_ID` (frontend)
- **Cuándo:** Admin/Supplier crea un usuario nuevo
- **Contiene:** Email, contraseña temporal, link de login
- **Enviado desde:** Frontend (browser)

### 2. Email de Confirmación (Usuario se registra)
- **Template:** `EMAILJS_CONFIRMATION_TEMPLATE_ID` (Edge Function)
- **Cuándo:** Usuario se auto-registra en `/register`
- **Contiene:** Link único de confirmación
- **Enviado desde:** Edge Function de Supabase

## 📧 Ejemplo del Email de Confirmación

Los usuarios recibirán un email profesional con:

- ✅ Header con gradiente azul/verde
- ✅ Mensaje de bienvenida personalizado
- ✅ Botón destacado "Confirmar mi cuenta"
- ✅ Link alternativo en caso de problemas
- ✅ Aviso de expiración (24 horas)
- ✅ Información de contacto de soporte

Ver diseño completo en: `docs/email-confirmation-template.html`

---

# 🎨 Template Nativo de Supabase (Alternativa Recomendada)

## ¿EmailJS o Template de Supabase?

Tienes **DOS opciones** para enviar emails de confirmación:

### Opción 1: EmailJS (Actual - Ya Implementado)
- ✅ Email personalizado con HTML bonito
- ✅ Ya configurado en Edge Function
- ❌ Requiere configurar secrets en Supabase
- ❌ Depende de servicio externo (EmailJS)
- ❌ Límite de 200 emails/mes (plan free)

### Opción 2: Template Nativo de Supabase (Más Simple)
- ✅ No requiere EmailJS ni Edge Function modificada
- ✅ No hay límites de emails
- ✅ Email personalizado con HTML bonito
- ✅ Configuración más simple (solo en Dashboard)
- ✅ Más rápido y confiable
- ✅ **RECOMENDADO para producción**

## 🚀 Configurar Template Nativo de Supabase

Si prefieres usar el template nativo de Supabase (recomendado):

### Paso 1: Acceder a Email Templates

1. Ve a [Supabase Dashboard](https://app.supabase.com/)
2. Selecciona tu proyecto
3. **Authentication** → **Email Templates**
4. Busca **"Confirm signup"**

### Paso 2: Copiar el Template HTML

1. Abre el archivo: `docs/supabase-email-templates/confirmation-email.html`
2. Copia **todo** el contenido HTML
3. Pega en el campo **Message body** de Supabase
4. Configura el **Subject:** `Confirma tu cuenta en centerThink 🎉`
5. Haz clic en **Save**

### Paso 3: Configurar URLs

En **Authentication** → **URL Configuration**:

```
Site URL: https://centerthink.pages.dev
Redirect URLs:
  - https://centerthink.pages.dev/login
  - https://centerthink.pages.dev/**
  - http://localhost:3000/** (para desarrollo)
```

### Paso 4: Modificar Edge Function (Simplificar)

Si usas template nativo de Supabase, puedes simplificar la Edge Function:

**En `supabase/functions/register-user/index.ts` línea 134:**

Cambia:
```typescript
email_confirm: false,  // Requiere confirmación
```

Por:
```typescript
email_confirm: false,  // Supabase enviará el email automáticamente
```

**Y ELIMINA toda la sección de EmailJS (líneas 210-256)**, ya no es necesaria.

Supabase enviará automáticamente el email usando tu template personalizado.

### Ventajas del Template Nativo

1. **Más simple:** No requieres configurar EmailJS
2. **Más rápido:** Supabase envía el email directamente
3. **Sin límites:** No hay restricción de emails/mes
4. **Más confiable:** No depende de servicios externos
5. **Mismo diseño bonito:** Usa el mismo HTML profesional

## 📋 Comparación de Métodos

| Característica | EmailJS | Supabase Template |
|----------------|---------|-------------------|
| Diseño HTML personalizado | ✅ | ✅ |
| Requiere configuración | 🔴 Compleja | 🟢 Simple |
| Límites de envío | 🔴 200/mes (free) | 🟢 Sin límites |
| Velocidad | 🟡 Media | 🟢 Rápida |
| Dependencias externas | 🔴 Sí (EmailJS) | 🟢 No |
| Configuración secrets | 🔴 Requerida | 🟢 No necesaria |
| Recomendado para | Desarrollo | ✅ **Producción** |

## 🎯 Recomendación Final

Para producción, usa el **Template Nativo de Supabase**:

1. Configura el template HTML en Supabase Dashboard (5 minutos)
2. Simplifica la Edge Function eliminando código EmailJS
3. Configura las URLs en Authentication settings
4. ¡Listo! Los emails se enviarán automáticamente con diseño profesional

**Documentación completa:** `docs/supabase-email-templates/README.md`
