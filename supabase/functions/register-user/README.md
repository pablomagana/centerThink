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
6. Genera un link de confirmación de email único con token
7. Envía email de confirmación con el link usando EmailJS
8. El usuario debe confirmar su email haciendo clic en el link
9. Una vez confirmado, puede acceder con sus credenciales

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

## Configuración de EmailJS

Para que el envío de emails funcione correctamente, debes configurar las siguientes variables de entorno en Supabase:

```bash
# Configurar secrets en Supabase Edge Functions
supabase secrets set EMAILJS_SERVICE_ID=your_service_id
supabase secrets set EMAILJS_CONFIRMATION_TEMPLATE_ID=your_confirmation_template_id
supabase secrets set EMAILJS_PUBLIC_KEY=your_public_key
supabase secrets set APP_URL=https://your-app-url.com
```

### Template de EmailJS Requerido

Crea un template en EmailJS con las siguientes variables:
- `{{to_email}}` - Email del destinatario
- `{{user_name}}` - Nombre completo del usuario
- `{{confirmation_link}}` - Link de confirmación generado por Supabase
- `{{app_url}}` - URL de la aplicación
- `{{from_name}}` - Nombre del remitente (centerThink)

Ver archivo de referencia: `docs/email-confirmation-template.html`

## Notas

- Los administradores pueden deshabilitar usuarios desde el panel de administración en cualquier momento
- Los usuarios registrados solo tienen acceso a funcionalidades operativas (Events, Speakers, Venues, Orders, Calendar)
- No tienen acceso a gestión de usuarios ni ciudades
- El link de confirmación expira según la configuración de Supabase (por defecto 24 horas)
- Si EmailJS no está configurado, el registro funciona pero el usuario no recibirá el email (el link se muestra en logs)
