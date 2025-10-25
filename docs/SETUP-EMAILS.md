# 📧 Configuración de Emails - Guía Rápida

## 🎯 Método Recomendado: Template Nativo de Supabase

La forma más simple y confiable de configurar emails bonitos en centerThink.

### ⚡ Setup en 3 Pasos (5 minutos)

#### 1️⃣ Configurar Template en Supabase

```bash
1. Ve a: https://app.supabase.com/project/_/auth/templates
2. Selecciona "Confirm signup"
3. Copia el HTML de: docs/supabase-email-templates/confirmation-email.html
4. Pega en "Message body"
5. Subject: "Confirma tu cuenta en centerThink 🎉"
6. Save
```

#### 2️⃣ Configurar URLs

```bash
1. Ve a: Authentication → URL Configuration
2. Site URL: https://centerthink.pages.dev
3. Redirect URLs:
   - https://centerthink.pages.dev/**
   - http://localhost:3000/** (desarrollo)
4. Save
```

#### 3️⃣ ¡Listo! 🎉

Los usuarios recibirán automáticamente emails bonitos cuando se registren.

---

## 📂 Archivos Disponibles

### Template HTML Bonito
📄 **`docs/supabase-email-templates/confirmation-email.html`**
- Diseño profesional con gradiente azul/verde
- Botón CTA destacado
- Responsive y compatible con todos los clientes
- Incluye sección de beneficios
- Información de contacto

### Documentación Completa
📘 **`docs/supabase-email-templates/README.md`**
- Guía paso a paso con screenshots
- Troubleshooting común
- Tips de personalización
- Checklist de verificación

### Guía de EmailJS (Alternativa)
📗 **`docs/emailjs-setup-guide.md`**
- Configuración de EmailJS (si prefieres usarlo)
- Comparación EmailJS vs Supabase
- Setup de Edge Function

---

## 🎨 Vista Previa del Email

El usuario recibirá un email con:

```
┌─────────────────────────────────────┐
│     🔵 centerThink (Logo)           │
│     Gestión de Thinkglaos          │
├─────────────────────────────────────┤
│                                     │
│  ¡Bienvenido/a a centerThink! 🎉   │
│                                     │
│  Para comenzar a usar tu cuenta...  │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  ✓ Confirmar mi cuenta        │ │
│  └───────────────────────────────┘ │
│                                     │
│  ℹ️ Link alternativo si no funciona│
│                                     │
│  ⚠️ Expira en 24 horas             │
│                                     │
│  ✨ ¿Qué podrás hacer?              │
│  📅 Gestionar eventos               │
│  🎤 Conectar con ponentes          │
│  📍 Gestionar locales              │
│  ✅ Seguimiento de tareas          │
│                                     │
├─────────────────────────────────────┤
│  📧 Contacto: info@pablomagana.es  │
│  © 2024 centerThink                │
└─────────────────────────────────────┘
```

---

## ✅ Checklist de Verificación

Después de configurar:

- [ ] Template configurado en Supabase Dashboard
- [ ] Subject personalizado
- [ ] Site URL configurado
- [ ] Redirect URLs configuradas
- [ ] Probado con registro real
- [ ] Email llegó correctamente
- [ ] Botón de confirmación funciona
- [ ] Redirige al login después de confirmar

---

## 🧪 Probar

```bash
1. npm run dev
2. Ve a http://localhost:3000/register
3. Registra un usuario con tu email
4. Revisa tu bandeja de entrada
5. Haz clic en "Confirmar mi cuenta"
6. Verifica que redirige a /login
7. Inicia sesión con tus credenciales
```

---

## 🐛 Problemas Comunes

### El email no llega
- Revisa spam
- Verifica Site URL en Supabase
- Revisa logs: Dashboard → Logs → Auth Logs

### El link no funciona
- Verifica Redirect URLs en Supabase
- El link expira en 24 horas

### El email se ve feo
- Asegúrate de copiar TODO el HTML
- No modifiques las variables {{ .ConfirmationURL }}

---

## 📞 Soporte

¿Problemas? Revisa la documentación completa:
- `docs/supabase-email-templates/README.md`
- `docs/emailjs-setup-guide.md`

O contacta: info@pablomagana.es
