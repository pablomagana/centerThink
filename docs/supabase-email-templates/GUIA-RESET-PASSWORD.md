# 🔐 Plantillas de Reset Password

He creado 2 plantillas profesionales para el email de restablecimiento de contraseña.

---

## 🎨 Plantilla 1 - Moderna (Recomendada)

**Archivo:** `reset-password.html`

### Características:
- 🌈 Fondo degradado púrpura/rosa (matching con confirmation-email-v2)
- 🔐 Icono de candado grande
- 💎 Diseño premium con glassmorphism
- ⚠️ Avisos de seguridad destacados
- 💡 Consejos para contraseña segura
- 🎨 Cards coloridas con información

### Ideal para:
- Aplicaciones modernas
- Si usaste `confirmation-email-v2.html`
- Máximo impacto visual

---

## 📧 Plantilla 2 - Clásica

**Archivo:** `reset-password-classic.html`

### Características:
- 🔵 Gradiente azul/verde corporativo (matching con confirmation-email.html)
- 🔒 Diseño limpio y profesional
- ✅ Avisos de seguridad en cajas de colores
- 📋 Lista de requisitos de contraseña
- 🎯 Enfoque en claridad y confianza

### Ideal para:
- Aplicaciones corporativas
- Si usaste `confirmation-email.html`
- Look profesional tradicional

---

## 📊 Comparación Visual

### Plantilla Moderna:
```
┌─────────────────────────────────────┐
│ 🌈 Fondo gradiente púrpura/rosa    │
│ ┌─────────────────────────────────┐ │
│ │   💌 Candado (icono grande)     │ │
│ │      centerThink                 │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│          🔐 (emoji gigante)         │
│   Restablecer Contraseña            │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🔑 CAMBIAR CONTRASEÑA        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ⚠️ Card amarilla: Info importante │
│  🛡️ Card azul: Consejos seguridad │
├─────────────────────────────────────┤
│  🔒 Card roja: ¿No solicitaste?    │
│       Footer con contacto           │
└─────────────────────────────────────┘
```

### Plantilla Clásica:
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │   🔵 Header azul/verde          │ │
│ │   🔒 centerThink                │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│  Restablecer tu Contraseña 🔐      │
│                                     │
│  Texto explicativo...               │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  🔑 Cambiar Contraseña        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ⚠️ Caja amarilla: Importante      │
│  💡 Caja azul: Consejos            │
│  ℹ️ Link alternativo                │
├─────────────────────────────────────┤
│  🔒 Caja roja: Seguridad           │
│       Footer gris                   │
└─────────────────────────────────────┘
```

---

## 🚀 Cómo Configurar

### Paso 1: Elegir Template

**Elige según tu template de confirmación:**
- Si usas `confirmation-email-v2.html` → Usa `reset-password.html`
- Si usas `confirmation-email.html` → Usa `reset-password-classic.html`

### Paso 2: Ir a Supabase Dashboard

Ve a: https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/templates

### Paso 3: Seleccionar Template

Haz clic en: **"Reset Password"** en la lista de templates

### Paso 4: Configurar Subject

**Subject line:**
```
Restablece tu contraseña - centerThink 🔐
```

O más simple:
```
Restablecer Contraseña - centerThink
```

### Paso 5: Pegar HTML

1. Abre el archivo HTML que elegiste
2. Selecciona TODO (Cmd+A / Ctrl+A)
3. Copia (Cmd+C / Ctrl+C)
4. Pega en el campo **"Message body"** del Dashboard
5. Verifica que contenga `{{ .ConfirmationURL }}`
6. Haz clic en **Save**

---

## 🧪 Cómo Probar

### Probar Reset Password:

**1. Desde tu app (si tienes página de recuperación):**
```
https://centerthink.pages.dev/forgot-password
```

**2. Desde Supabase Auth:**
```javascript
// En consola del navegador o en tu código
import { supabase } from './supabase'

await supabase.auth.resetPasswordForEmail('tu-email@example.com', {
  redirectTo: 'https://centerthink.pages.dev/reset-password'
})
```

**3. Usando API directamente:**
```bash
curl -X POST 'https://lzqhfgeduchvizykaqih.supabase.co/auth/v1/recover' \
  -H "apikey: tu-anon-key" \
  -H "Content-Type: application/json" \
  -d '{"email": "tu-email@example.com"}'
```

---

## 🎨 Personalización

### Cambiar Colores (Moderna):
```
Púrpura: #667eea → Buscar y reemplazar
Rosa: #f093fb → Buscar y reemplazar
Morado: #764ba2 → Buscar y reemplazar
```

### Cambiar Colores (Clásica):
```
Azul: #3b82f6 → Buscar y reemplazar
Verde: #10b981 → Buscar y reemplazar
```

### Cambiar Email de Soporte:
```
info@pablomagana.es → Tu email
```

### Cambiar Tiempo de Expiración:
Busca: `expira en 1 hora`
Cambia por: El tiempo que configures en Supabase

---

## 🔒 Variables de Supabase

El template usa estas variables automáticas:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{ .ConfirmationURL }}` | Link único de reset | https://xxx.supabase.co/auth/v1/verify?token=... |
| `{{ .SiteURL }}` | URL de tu app | https://centerthink.pages.dev |

**⚠️ NO modifiques estas variables** - Supabase las reemplaza automáticamente.

---

## ⚙️ Configuración Adicional

### Tiempo de Expiración del Link:

**Por defecto:** 1 hora

**Para cambiar:**
1. Ve a: Settings → Auth
2. Busca: **"JWT expiry limit"** o **"Reset Password Token Expiry"**
3. Ajusta el tiempo (en segundos)
   - 3600 = 1 hora
   - 7200 = 2 horas
   - 1800 = 30 minutos

### Redirect URL después del Reset:

En tu código de reset password:
```javascript
await supabase.auth.resetPasswordForEmail('email@example.com', {
  redirectTo: 'https://centerthink.pages.dev/update-password'
})
```

---

## 🛡️ Seguridad

### Lo que Incluyen los Templates:

✅ **Avisos de Expiración** - El link expira en 1 hora
✅ **Uso Único** - El link solo funciona una vez
✅ **Aviso de No Solicitado** - Si no fue el usuario, puede ignorar
✅ **Consejos de Seguridad** - Requisitos de contraseña segura
✅ **Link Alternativo** - Por si el botón no funciona

### Recomendaciones:

1. ✅ Siempre verifica que el usuario solicitó el reset
2. ✅ Usa HTTPS para todos los links
3. ✅ Configura Redirect URLs en Supabase correctamente
4. ✅ Monitorea intentos sospechosos de reset

---

## ✅ Checklist

Después de configurar:

- [ ] Template seleccionado (moderna o clásica)
- [ ] Subject configurado
- [ ] HTML pegado en Supabase Dashboard
- [ ] Variable `{{ .ConfirmationURL }}` presente
- [ ] Guardado con **Save**
- [ ] Probado con email real
- [ ] Email llegó correctamente
- [ ] Link funciona y redirige bien
- [ ] Nueva contraseña se guardó exitosamente

---

## 🎯 Resumen

**Para combinar con tus templates de confirmación:**

| Template Confirmación | Template Reset Password | Estilo |
|----------------------|------------------------|--------|
| `confirmation-email-v2.html` | `reset-password.html` | Moderno |
| `confirmation-email.html` | `reset-password-classic.html` | Clásico |

**Ambos templates:**
- ✅ Responsive (móvil y desktop)
- ✅ Compatible con todos los clientes de email
- ✅ Incluyen avisos de seguridad
- ✅ Profesionales y hermosos

---

## 📞 ¿Necesitas Ayuda?

¿Problemas configurando? ¿Quieres personalizar más?

Dime qué necesitas y te ayudo. 🚀
