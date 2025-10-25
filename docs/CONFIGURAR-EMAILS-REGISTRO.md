# 🚀 Configuración Rápida: Emails de Confirmación de Registro

Esta guía te ayudará a configurar los emails de confirmación que se envían automáticamente cuando un usuario se registra en centerThink.

## ⏱️ Tiempo estimado: 5 minutos

---

## ✅ Paso 1: Configurar Template en Supabase Dashboard

### 1.1 Acceder a Email Templates

1. Ve a tu proyecto en [Supabase Dashboard](https://app.supabase.com/)
2. En el menú lateral, haz clic en **Authentication**
3. Haz clic en **Email Templates**

### 1.2 Configurar el Template de Confirmación

1. En la lista de templates, busca **"Confirm signup"**
2. Haz clic en el template para editarlo
3. Verás dos campos:

**Campo 1: Subject line (Asunto del email)**
```
Confirma tu cuenta en centerThink 🎉
```

**Campo 2: Message body (Cuerpo del email)**
- Abre el archivo: `docs/supabase-email-templates/confirmation-email.html`
- Copia **TODO** el contenido HTML (Ctrl+A → Ctrl+C)
- Pega el contenido en el campo **Message body** de Supabase
- Haz clic en **Save** (Guardar)

---

## 🔗 Paso 2: Configurar URLs de Redirección

### 2.1 Acceder a URL Configuration

1. En el menú de **Authentication**, haz clic en **URL Configuration**

### 2.2 Configurar Site URL

En el campo **Site URL**, ingresa:
```
https://centerthink.pages.dev
```

> Para desarrollo local, puedes usar: `http://localhost:3000`

### 2.3 Configurar Redirect URLs

En la sección **Redirect URLs**, agrega estas URLs (una por línea):

**Para producción:**
```
https://centerthink.pages.dev/**
https://centerthink.pages.dev/login
```

**Para desarrollo local (opcional):**
```
http://localhost:3000/**
http://localhost:3000/login
```

### 2.4 Guardar cambios

Haz clic en **Save** (Guardar)

---

## 🔄 Paso 3: Activar Usuarios Existentes (Opcional)

Si ya tienes usuarios registrados antes de configurar la confirmación de email, necesitas activarlos manualmente.

### 3.1 Ejecutar SQL

1. En Supabase Dashboard, ve a **SQL Editor**
2. Haz clic en **New Query**
3. Abre el archivo: `docs/activate-all-users.sql`
4. Copia el contenido y pégalo en el editor SQL
5. Haz clic en **Run** (Ejecutar)

Esto marcará todos los usuarios existentes como confirmados.

---

## 🧪 Paso 4: Probar la Configuración

### 4.1 Probar en desarrollo local

```bash
# 1. Inicia el servidor de desarrollo
npm run dev

# 2. Abre el navegador
http://localhost:3000/register
```

### 4.2 Registrar un usuario de prueba

1. Completa el formulario de registro con tu email real
2. Haz clic en "Crear Cuenta"
3. Verás el mensaje de éxito: **"¡Registro Exitoso!"**
4. **Revisa tu bandeja de entrada** (y spam) en tu email

### 4.3 Verificar el email

Deberías recibir un email con:
- ✅ Asunto: "Confirma tu cuenta en centerThink 🎉"
- ✅ Diseño profesional con gradiente azul/verde
- ✅ Botón destacado: "Confirmar mi cuenta"
- ✅ Link alternativo si el botón no funciona

### 4.4 Confirmar la cuenta

1. Haz clic en el botón **"Confirmar mi cuenta"** del email
2. Serás redirigido a la página de login
3. Inicia sesión con tus credenciales
4. ✅ ¡Listo! Tu cuenta está confirmada y activa

---

## ❓ Problemas Comunes

### El email no llega

**Posibles causas:**
1. Revisa tu carpeta de **Spam/Correo no deseado**
2. Verifica que el **Site URL** esté configurado correctamente en Supabase
3. Revisa los logs: `Dashboard → Logs → Auth Logs` en Supabase

**Solución temporal:**
Si el email no llega, puedes activar el usuario manualmente con este SQL:

```sql
-- Reemplaza 'usuario@example.com' con el email del usuario
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'usuario@example.com';
```

### El link del email no funciona

**Posibles causas:**
1. Las **Redirect URLs** no están configuradas correctamente
2. El link expiró (por defecto expira en 24 horas)

**Solución:**
1. Verifica que las Redirect URLs incluyan tu dominio con `/**`
2. Si el link expiró, registra al usuario nuevamente o usa el SQL de arriba para activarlo manualmente

### El email se ve feo o roto

**Posibles causas:**
1. No copiaste TODO el contenido HTML del template
2. Modificaste las variables de Supabase (`{{ .ConfirmationURL }}`)

**Solución:**
1. Asegúrate de copiar TODO el HTML del archivo `confirmation-email.html`
2. No modifiques las variables con `{{ }}` - Supabase las reemplaza automáticamente

---

## 📋 Checklist de Verificación

Después de configurar, verifica que:

- [ ] Template de email configurado en Supabase Dashboard
- [ ] Subject personalizado: "Confirma tu cuenta en centerThink 🎉"
- [ ] Site URL configurado: `https://centerthink.pages.dev`
- [ ] Redirect URLs configuradas con `/**`
- [ ] Probado con registro real usando tu email
- [ ] Email llegó correctamente (revisa spam)
- [ ] Botón "Confirmar mi cuenta" funciona
- [ ] Redirige al login después de confirmar
- [ ] Puedes iniciar sesión con las credenciales

---

## 🎨 Personalización (Opcional)

Si quieres personalizar el email:

### Cambiar colores

Edita el archivo `docs/supabase-email-templates/confirmation-email.html` y busca estos colores:
- `#3b82f6` - Azul primario
- `#10b981` - Verde secundario
- `#1f2937` - Texto oscuro

### Cambiar email de soporte

Busca `info@pablomagana.es` en el template y reemplázalo con tu email.

### Agregar logo

El template usa un diseño de texto. Para agregar tu logo:
1. Busca la sección del header (línea ~16-20)
2. Reemplaza el texto por una imagen:
```html
<img src="https://tu-dominio.com/logo.png"
     alt="centerThink"
     style="width: 80px; height: auto;">
```

---

## 📚 Documentación Adicional

- **Guía completa de templates:** `docs/supabase-email-templates/README.md`
- **Guía general de emails:** `docs/SETUP-EMAILS.md`
- **Template HTML de referencia:** `docs/supabase-email-templates/confirmation-email.html`

---

## 📞 Soporte

¿Problemas con la configuración?
- Revisa la [documentación completa](docs/supabase-email-templates/README.md)
- Contacta: info@pablomagana.es

---

## ✨ ¡Listo!

Una vez configurado, **todos los nuevos usuarios** que se registren recibirán automáticamente un email de confirmación profesional y bonito. 🎉
