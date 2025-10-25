# Solución Definitiva: Error 422 "The recipients address is empty"

## 🎯 El Problema

EmailJS da error 422 porque **NO encuentra el email del destinatario** en la configuración de la plantilla.

## ✅ Solución Paso a Paso (IMPORTANTE)

### Paso 1: Ve a tu plantilla en EmailJS

1. Abre [EmailJS Dashboard](https://dashboard.emailjs.com/admin/templates)
2. Haz clic en tu plantilla

### Paso 2: Configura el CAMPO "To Email" (EN LA PARTE SUPERIOR)

**ESTE ES EL PASO MÁS CRÍTICO:**

En la parte superior de la configuración de la plantilla, verás un campo llamado **"To Email"** o **"Recipient"**.

**Debes escribir EXACTAMENTE:**
```
{{to_email}}
```

**IMPORTANTE:**
- ❌ NO pongas: `to_email` (sin llaves)
- ❌ NO pongas: `{to_email}` (con una llave)
- ✅ SÍ pon: `{{to_email}}` (con dobles llaves)

### Paso 3: NO confundir con el contenido del email

El campo "To Email" **NO es el contenido del email**. Es un campo de configuración separado.

**Estructura correcta:**

```
┌────────────────────────────────────────┐
│ Template Settings                      │
├────────────────────────────────────────┤
│ To Email: {{to_email}}          ← AQUÍ│
│                                        │
│ From Name: centerThink                 │
│                                        │
│ Subject: Bienvenido a centerThink      │
├────────────────────────────────────────┤
│ Content: (HTML/Text del email)         │
│                                        │
│ Hola {{user_name}},                    │
│ Tu contraseña es {{temp_password}}     │
└────────────────────────────────────────┘
```

### Paso 4: Verifica que sea un campo de EMAIL

Algunos servicios de EmailJS requieren que el campo "To Email" sea reconocido como email válido. Asegúrate de que:

1. El campo esté marcado como tipo "Email"
2. La variable `{{to_email}}` esté correctamente escrita

### Paso 5: Guarda y Prueba

1. Haz clic en **"Save"**
2. Espera unos segundos
3. Vuelve a probar crear un usuario

---

## 🔍 Verificación en la Consola del Navegador

Con los logs que agregamos, deberías ver en la consola:

```javascript
📧 Intentando enviar email con EmailJS...
🔑 Configuración: { SERVICE_ID: "service_xxx", TEMPLATE_ID: "template_xxx", ... }
📦 Parámetros del template: { to_email: "usuario@ejemplo.com", ... }
```

Si ves que `to_email` tiene un valor válido, entonces el problema es 100% la configuración de la plantilla en EmailJS.

---

## 🎓 Explicación Técnica

EmailJS usa un sistema de dos niveles:

1. **Template Variables** (en el contenido): `{{user_name}}`, `{{temp_password}}`, etc.
2. **Routing Variables** (para envío): `{{to_email}}`, `{{from_email}}`, etc.

El campo "To Email" en la configuración de la plantilla **NO es parte del contenido**, es una **configuración de routing** que le dice a EmailJS a dónde enviar el email.

---

## 🆘 Si Sigue Sin Funcionar

### Opción A: Crear Nueva Plantilla Simple

1. Ve a EmailJS → Create New Template
2. En "To Email" pon: `{{to_email}}`
3. En "Subject" pon: `Test centerThink`
4. En "Content" pon:
```
Hola {{user_name}},

Tu contraseña temporal es: {{temp_password}}

Login: {{login_url}}
```
5. Guarda la plantilla
6. Copia el nuevo TEMPLATE_ID
7. Actualiza tu `.env` con el nuevo TEMPLATE_ID
8. Reinicia el servidor

### Opción B: Verificar el Servicio de Email

1. Ve a EmailJS → Email Services
2. Verifica que tu servicio esté conectado (icono verde)
3. Si no está conectado, reconéctalo
4. Algunos servicios requieren autenticación adicional

### Opción C: Probar con EmailJS Test

1. En la plantilla, haz clic en "Test it"
2. Ingresa valores manualmente:
   - to_email: tu-email@ejemplo.com
   - user_name: Test
   - temp_password: test123
   - login_url: http://localhost:3000
   - creator_name: Admin
3. Haz clic en "Send Test"
4. Si el test falla, el problema está en la configuración del servicio de EmailJS
5. Si el test funciona, el problema está en cómo enviamos los datos desde el código

---

## 📸 Captura de Referencia

Tu configuración debería verse así:

```
Template Name: centerThink User Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Settings:
  To Email:     {{to_email}}
  From Name:    centerThink
  Reply To:     (vacío o tu email)
  Subject:      Bienvenido a centerThink - Credenciales

Content:
  [Tu HTML o texto aquí]
```

---

## 💡 Tip Final

Si después de todo sigue sin funcionar, es posible que tu plan de EmailJS tenga restricciones. Verifica:

1. Límite de emails no excedido (200/mes en Free)
2. No hay restricciones de dominio
3. El servicio de email está verificado

En ese caso, considera usar el **fallback** que implementamos: el sistema creará el usuario correctamente y te mostrará la contraseña para que la comuniques manualmente.
