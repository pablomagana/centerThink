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
