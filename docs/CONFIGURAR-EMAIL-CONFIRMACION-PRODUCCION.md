# Configurar Email de Confirmación para Producción

## Problemas Identificados

1. ❌ **Plantilla de email no bonita**: La plantilla HTML no se está aplicando
2. ❌ **URLs apuntan a localhost:3000**: En vez de apuntar al dominio de producción

---

## Solución Paso a Paso

### 1. Configurar URL de Producción en Supabase

#### A. Configurar Site URL (URL Principal)

1. Ve a tu proyecto en https://supabase.com/dashboard
2. Navega a **Authentication** > **URL Configuration**
3. Configura:
   - **Site URL**: `https://centerthink.pages.dev`

#### B. Agregar Redirect URLs (URLs de Redirección)

En la misma página de URL Configuration:

1. En **Redirect URLs**, agrega:
   ```
   https://centerthink.pages.dev/**
   https://centerthink.pages.dev/reset-password
   ```

2. Si también quieres permitir desarrollo local, agrega:
   ```
   http://localhost:3000/**
   http://localhost:3000/reset-password
   ```

3. Haz clic en **Save**

---

### 2. Configurar Plantilla de Email Bonita

#### A. Copiar la Plantilla HTML

La plantilla bonita está en: `docs/supabase-email-templates/confirmation-email-v2.html`

#### B. Aplicar en Supabase Dashboard

1. Ve a **Authentication** > **Email Templates**
2. Selecciona **"Confirm signup"**
3. Reemplaza TODO el contenido con el HTML de `confirmation-email-v2.html`
4. **Importante**: Verifica que estas variables estén en el HTML:
   - `{{ .ConfirmationURL }}` - URL de confirmación
   - `{{ .SiteURL }}` - URL del sitio

5. Haz clic en **Save**

---

### 3. Configurar Variables de Entorno en Producción (Cloudflare Pages)

#### A. Acceder a Configuración de Cloudflare Pages

1. Ve a tu dashboard de Cloudflare Pages
2. Selecciona tu proyecto **centerthink**
3. Ve a **Settings** > **Environment variables**

#### B. Configurar Variables

Asegúrate de tener estas variables configuradas:

**Para Production:**

```env
VITE_APP_URL=https://centerthink.pages.dev
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_EMAILJS_SERVICE_ID=service_jsu8oli
VITE_EMAILJS_TEMPLATE_ID=template_iwv59vf
VITE_EMAILJS_PUBLIC_KEY=iNBU9s5uN2Bb-UOc6
```

**Para Preview (opcional):**

Puedes usar las mismas variables o diferentes si quieres probar en preview.

---

### 4. Verificar Edge Function (register-user)

La Edge Function debe usar el Site URL configurado en Supabase, no localhost.

Verificar en `supabase/functions/register-user/index.ts`:

```typescript
// Debe usar VITE_APP_URL o el Site URL de Supabase
const confirmationUrl = `${siteUrl}/reset-password?token=${token}`
```

Si usas Edge Function para registro, asegúrate de que:
- Lee `VITE_APP_URL` desde las variables de entorno
- O usa el `SiteURL` configurado en Supabase

---

### 5. Redesplegar la Aplicación

Después de configurar las variables en Cloudflare Pages:

1. Ve a **Deployments**
2. Haz clic en **Retry deployment** en el último deploy
3. O haz un nuevo commit y push para trigger un nuevo deploy

---

### 6. Probar la Configuración

#### A. Crear Usuario de Prueba

1. Ve a tu aplicación en producción: https://centerthink.pages.dev
2. Regístrate con un email de prueba
3. Revisa el email recibido

#### B. Verificar

✅ El email debe:
- Tener el diseño bonito (gradientes, cards, emojis)
- El botón "Confirmar Email" debe apuntar a `https://centerthink.pages.dev`
- El link alternativo también debe usar el dominio de producción

✅ Al hacer clic en el botón:
- Debe redirigir a tu aplicación en producción
- NO debe ir a localhost:3000

---

## Plantilla de Email de Confirmación

Contenido completo en: `docs/supabase-email-templates/confirmation-email-v2.html`

### Variables Disponibles en Supabase

En las plantillas de email de Supabase puedes usar:

- `{{ .ConfirmationURL }}` - URL completa de confirmación con token
- `{{ .Token }}` - Solo el token (si quieres construir tu propia URL)
- `{{ .TokenHash }}` - Hash del token
- `{{ .SiteURL }}` - URL del sitio (configurada en Settings)
- `{{ .Email }}` - Email del usuario

### Ejemplo de Uso

```html
<a href="{{ .ConfirmationURL }}" style="...">
    Confirmar Email
</a>

<p>O visita: <a href="{{ .SiteURL }}">{{ .SiteURL }}</a></p>
```

---

## Solución de Problemas

### El email sigue apuntando a localhost

**Causa**: La variable `Site URL` en Supabase sigue configurada con localhost

**Solución**:
1. Ve a Authentication > URL Configuration
2. Cambia Site URL a `https://centerthink.pages.dev`
3. Guarda los cambios
4. Crea un nuevo usuario de prueba

### La plantilla no se ve bonita

**Causa**: El HTML no se guardó correctamente o tiene errores

**Solución**:
1. Copia TODO el contenido de `confirmation-email-v2.html`
2. Pégalo en Supabase Email Templates
3. Verifica que las variables `{{ .ConfirmationURL }}` estén presentes
4. Guarda y prueba con un nuevo usuario

### Los estilos no se muestran

**Causa**: Algunos clientes de email bloquean CSS externo

**Solución**:
- La plantilla usa **estilos inline**, que son compatibles con la mayoría de clientes
- Los gradientes y efectos pueden no verse en todos los clientes
- Outlook puede mostrar una versión simplificada

---

## Resumen de Configuración

| Configuración | Ubicación | Valor |
|--------------|-----------|-------|
| Site URL | Supabase > Auth > URL Config | `https://centerthink.pages.dev` |
| Redirect URLs | Supabase > Auth > URL Config | `https://centerthink.pages.dev/**` |
| Plantilla Email | Supabase > Auth > Email Templates | `confirmation-email-v2.html` |
| VITE_APP_URL | Cloudflare Pages > Settings > Env | `https://centerthink.pages.dev` |

---

## Enlaces Útiles

- Documentación Supabase Auth: https://supabase.com/docs/guides/auth
- Email Templates: https://supabase.com/docs/guides/auth/auth-email-templates
- URL Configuration: https://supabase.com/docs/guides/auth#redirect-urls

---

## Siguiente Paso

Una vez configurado, prueba el flujo completo:

1. Registra un usuario nuevo en producción
2. Verifica que el email llegue con diseño bonito
3. Confirma que los links apunten a producción
4. Prueba hacer clic en el botón de confirmación
5. Verifica que el usuario quede verificado

¡Listo! 🎉
