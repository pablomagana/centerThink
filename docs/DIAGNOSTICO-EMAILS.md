# 🔍 Diagnóstico: Emails de Confirmación No Se Envían en Producción

## 🚨 Problema Identificado

Los emails de confirmación NO se están enviando desde producción. Este es un problema común con Supabase.

---

## ⚠️ Causa Más Probable: Email Provider No Configurado

**Supabase NO puede enviar emails sin un proveedor de email configurado.**

Por defecto, Supabase:
- ✅ En **desarrollo local**: Muestra el link en logs (no envía emails reales)
- ❌ En **producción**: Necesita un proveedor SMTP o el servicio de Supabase

---

## 🔧 Soluciones Disponibles

### **Opción 1: Usar Servicio de Email de Supabase (Limitado)**

**Limitaciones del plan gratuito:**
- Solo 3 emails de confirmación por hora
- No recomendado para producción

**Cómo habilitarlo:**
1. Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/settings/auth`
2. Scroll hasta **Email Settings**
3. Verifica que esté habilitado: `Enable email confirmations`

**Problema:** Este método tiene límites muy restrictivos.

---

### **Opción 2: Configurar SMTP Personalizado (Recomendado)**

Usa un servicio SMTP como Gmail, SendGrid, o Mailgun para enviar emails.

#### **2.1 Gmail SMTP (Gratis, fácil de configurar)**

**Paso 1: Generar App Password en Gmail**

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Ve a **Security** (Seguridad)
3. Habilita **2-Step Verification** (si no está habilitado)
4. Busca **App Passwords** (Contraseñas de aplicaciones)
5. Selecciona **Mail** y **Other** (Otro)
6. Nombra: "Supabase centerThink"
7. Copia la contraseña generada (16 caracteres)

**Paso 2: Configurar SMTP en Supabase**

1. Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/settings/auth`
2. Scroll hasta **SMTP Settings**
3. Haz clic en **Enable Custom SMTP**
4. Configura:
   ```
   Host: smtp.gmail.com
   Port: 587
   Username: tu-email@gmail.com
   Password: [la contraseña de app generada]
   Sender email: tu-email@gmail.com
   Sender name: centerThink
   ```
5. Haz clic en **Save**

**Límites de Gmail:**
- ✅ 500 emails por día (suficiente para la mayoría de apps)
- ✅ Gratis
- ✅ Muy confiable

---

#### **2.2 SendGrid (Profesional, 100 emails/día gratis)**

**Paso 1: Crear cuenta en SendGrid**

1. Regístrate en: https://signup.sendgrid.com/
2. Verifica tu email
3. Completa la verificación de identidad

**Paso 2: Generar API Key**

1. Ve a **Settings** → **API Keys**
2. Haz clic en **Create API Key**
3. Nombre: "Supabase centerThink"
4. Permisos: **Full Access**
5. Copia la API Key generada

**Paso 3: Configurar SMTP en Supabase**

1. Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/settings/auth`
2. Scroll hasta **SMTP Settings**
3. Haz clic en **Enable Custom SMTP**
4. Configura:
   ```
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [tu API Key de SendGrid]
   Sender email: tu-email@tudominio.com
   Sender name: centerThink
   ```
5. Haz clic en **Save**

**Límites de SendGrid:**
- ✅ 100 emails por día (plan gratuito)
- ✅ Muy profesional
- ✅ Excelente deliverability

---

#### **2.3 Mailgun (Alternativa)**

Similar a SendGrid, con plan gratuito limitado.

1. Regístrate en: https://www.mailgun.com/
2. Verifica dominio o usa sandbox
3. Genera credenciales SMTP
4. Configura en Supabase igual que SendGrid

---

### **Opción 3: Volver a EmailJS (Como Fallback)**

Si no quieres configurar SMTP, puedes mantener EmailJS como lo tenías antes.

**Ventajas:**
- ✅ No necesitas SMTP
- ✅ Fácil de configurar

**Desventajas:**
- ❌ Más complejo (requiere Edge Function)
- ❌ Menos confiable
- ❌ Requiere configuración adicional

**Si eliges esta opción, dímelo y restauro el código de EmailJS.**

---

## 🎯 Recomendación

**Usa Gmail SMTP (Opción 2.1)** porque:

1. ✅ **Gratis** - No cuesta nada
2. ✅ **Simple** - Solo necesitas generar App Password
3. ✅ **Confiable** - Gmail tiene excelente deliverability
4. ✅ **Suficiente** - 500 emails/día es más que suficiente
5. ✅ **Rápido** - 5 minutos de configuración

---

## 📋 Checklist para Verificar Configuración

Después de configurar SMTP:

### 1. Verificar SMTP Settings
- [ ] Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/settings/auth`
- [ ] Scroll hasta **SMTP Settings**
- [ ] Verifica que **Custom SMTP** esté habilitado
- [ ] Verifica que todos los campos estén llenos

### 2. Verificar Email Template
- [ ] Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/templates`
- [ ] Selecciona **"Confirm signup"**
- [ ] Verifica que tenga el HTML personalizado
- [ ] Verifica el Subject: "Confirma tu cuenta en centerThink 🎉"

### 3. Verificar URLs
- [ ] Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/auth/url-configuration`
- [ ] **Site URL:** `https://centerthink.pages.dev`
- [ ] **Redirect URLs:** incluye `https://centerthink.pages.dev/**`

### 4. Probar en Producción
- [ ] Ve a: `https://centerthink.pages.dev/register`
- [ ] Registra un usuario de prueba con tu email real
- [ ] Espera 1-2 minutos
- [ ] Revisa tu bandeja de entrada (y spam)
- [ ] Verifica que llegó el email

### 5. Verificar Logs
- [ ] Ve a: `https://app.supabase.com/project/lzqhfgeduchvizykaqih/logs/explorer`
- [ ] Filtra por: `auth`
- [ ] Busca errores relacionados con email

---

## 🐛 Troubleshooting

### El SMTP falla al guardar

**Problema:** Supabase no puede conectarse al servidor SMTP

**Solución:**
1. Verifica que el Host y Port sean correctos
2. Verifica que el Username/Password sean correctos
3. Para Gmail: asegúrate de usar App Password, NO tu contraseña normal
4. Para Gmail: asegúrate de que 2FA esté habilitado

### Los emails siguen sin llegar

**Problema:** SMTP configurado pero no llegan emails

**Solución:**
1. Revisa los logs en Supabase: `Dashboard → Logs → Auth Logs`
2. Busca errores de SMTP
3. Verifica que el Sender email sea válido y verificado
4. Revisa tu carpeta de Spam
5. Intenta con un email diferente (Gmail, Outlook)

### Gmail rechaza la conexión

**Problema:** Error "Username and Password not accepted"

**Solución:**
1. Verifica que 2FA esté habilitado en tu cuenta de Google
2. Genera una nueva App Password
3. Copia la contraseña SIN ESPACIOS
4. Usa Port 587, NO 465

---

## 📞 Siguiente Paso

**Por favor confirma:**

1. ¿Quieres usar **Gmail SMTP** (recomendado)? → Te guío paso a paso
2. ¿Prefieres **SendGrid**? → Te ayudo a configurarlo
3. ¿Quieres volver a **EmailJS**? → Restauro el código anterior

Dime cuál prefieres y te ayudo a configurarlo. 🚀
