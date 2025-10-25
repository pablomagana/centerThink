# Register User Edge Function

Edge Function para el auto-registro público de usuarios en centerThink.

## Descripción

Permite que nuevos usuarios se registren en la aplicación sin necesidad de que un administrador los cree. Los usuarios registrados:
- Reciben automáticamente el rol `user` (sin permisos de administración)
- Deben confirmar su email antes de poder iniciar sesión
- Pueden acceder inmediatamente después de confirmar su email
- Los administradores pueden deshabilitarlos en cualquier momento

## Endpoint

```
POST /functions/v1/register-user
```

## Request Body

```json
{
  "email": "usuario@example.com",
  "password": "Password123",
  "first_name": "Juan",
  "last_name": "Pérez",
  "city_id": "uuid-de-ciudad",
  "phone": "+34612345678" // Opcional
}
```

## Validaciones

### Campos Requeridos
- `email`: Email válido
- `password`: Contraseña segura (min 8 caracteres, 1 mayúscula, 1 minúscula, 1 número)
- `first_name`: Nombre del usuario
- `last_name`: Apellidos del usuario
- `city_id`: ID de una ciudad válida existente en la base de datos

### Campos Opcionales
- `phone`: Número de teléfono

### Validaciones de Contraseña
- Mínimo 8 caracteres
- Al menos una letra mayúscula
- Al menos una letra minúscula
- Al menos un número

## Respuestas

### Éxito (200)
```json
{
  "success": true,
  "user": {
    "id": "user-uuid",
    "email": "usuario@example.com",
    "first_name": "Juan",
    "last_name": "Pérez",
    "role": "user",
    "cities": ["uuid-de-ciudad"]
  },
  "message": "Registro exitoso. Por favor revisa tu email para confirmar tu cuenta."
}
```

### Error (400/500)
```json
{
  "error": "Descripción del error"
}
```

## Flujo de Registro

1. El usuario completa el formulario de registro
2. La función valida todos los campos
3. Verifica que la ciudad seleccionada existe
4. Crea el usuario en `auth.users` con `email_confirm: false`
5. Crea el perfil en `user_profiles` con rol `user`
6. **Supabase envía automáticamente** el email de confirmación usando el template nativo configurado en el Dashboard
7. El usuario debe confirmar su email haciendo clic en el link
8. Una vez confirmado, puede acceder con sus credenciales

## Seguridad

- No requiere autenticación (es público)
- Rol `user` asignado automáticamente (sin permisos admin)
- Email debe ser confirmado antes del primer login
- Contraseñas con requisitos de complejidad
- Validación de existencia de ciudad
- Rollback automático si falla la creación del perfil

## Permisos

- **Acceso**: Público (no requiere autenticación)
- **Rol asignado**: `user` (fijo)
- **Ciudades**: Solo la ciudad seleccionada por el usuario

## Configuración de Emails de Confirmación

El sistema usa el **método NATIVO de Supabase** para enviar emails de confirmación automáticamente.

### Configuración en Supabase Dashboard (5 minutos)

**1. Configurar Template de Email:**
   - Ve a: `Authentication → Email Templates`
   - Selecciona: **"Confirm signup"**
   - **Subject:** `Confirma tu cuenta en centerThink 🎉`
   - **Message Body:** Copia el HTML de `docs/supabase-email-templates/confirmation-email.html`
   - Haz clic en **Save**

**2. Configurar URLs:**
   - Ve a: `Authentication → URL Configuration`
   - **Site URL:** `https://centerthink.pages.dev`
   - **Redirect URLs:**
     ```
     https://centerthink.pages.dev/**
     http://localhost:3000/**
     ```
   - Guarda cambios

**3. ¡Listo!** Los emails se enviarán automáticamente al registrar usuarios.

### Documentación Completa
- **Guía rápida:** `docs/SETUP-EMAILS.md`
- **Guía detallada:** `docs/supabase-email-templates/README.md`
- **Template HTML:** `docs/supabase-email-templates/confirmation-email.html`

## Notas

- Los administradores pueden deshabilitar usuarios desde el panel de administración en cualquier momento
- Los usuarios registrados solo tienen acceso a funcionalidades operativas (Events, Speakers, Venues, Orders, Calendar)
- No tienen acceso a gestión de usuarios ni ciudades
- El link de confirmación expira según la configuración de Supabase (por defecto 24 horas)
- Si el template de email no está configurado en Supabase, los usuarios NO podrán confirmar su cuenta
