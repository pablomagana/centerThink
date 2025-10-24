# Edge Function: create-user

Esta Edge Function maneja la creación de nuevos usuarios en la aplicación centerThink.

## Funcionalidad

1. **Autenticación**: Verifica que el usuario que hace la petición esté autenticado
2. **Autorización**: Valida que el usuario tenga rol `admin` o `supplier`
3. **Validación de Ciudades**: Si es `supplier`, valida que solo asigne ciudades que tiene asignadas
4. **Creación de Usuario**: Crea el usuario en Supabase Auth con contraseña temporal
5. **Creación de Perfil**: Crea el registro en `user_profiles` con los datos adicionales
6. **Generación de Contraseña**: Genera una contraseña segura aleatoria

## Request

```json
{
  "email": "usuario@ejemplo.com",
  "first_name": "Juan",
  "last_name": "García",
  "role": "user",
  "cities": ["city-id-1", "city-id-2"],
  "phone": "+34600000000"
}
```

### Campos Requeridos
- `email`: Email único del usuario
- `first_name`: Nombre
- `last_name`: Apellidos
- `role`: Uno de: `admin`, `user`, `supplier`

### Campos Opcionales
- `cities`: Array de IDs de ciudades (puede estar vacío)
- `phone`: Teléfono del usuario

## Response Success (200)

```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "usuario@ejemplo.com",
    "first_name": "Juan",
    "last_name": "García",
    "role": "user",
    "cities": ["city-id-1"],
    "phone": "+34600000000"
  },
  "tempPassword": "A1b2C3d4E5f6G7h8",
  "message": "Usuario creado exitosamente. Contraseña temporal generada."
}
```

⚠️ **IMPORTANTE**: En producción, `tempPassword` NO debería devolverse en la respuesta HTTP.
Debería enviarse por email al usuario usando un servicio como SendGrid, Resend, etc.

## Response Error

### 400 - Bad Request
```json
{
  "error": "Missing required fields: email, first_name, last_name, role"
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 403 - Forbidden
```json
{
  "error": "Insufficient permissions. Only admin and supplier can create users."
}
```

o para suppliers:

```json
{
  "error": "Supplier can only create users in their assigned cities",
  "invalidCities": ["city-id-3"]
}
```

### 500 - Internal Server Error
```json
{
  "error": "Error creating user profile",
  "details": {...}
}
```

## Variables de Entorno Requeridas

Esta función requiere las siguientes variables de entorno en Supabase:

- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_ANON_KEY`: Anon key para autenticación del usuario actual
- `SUPABASE_SERVICE_ROLE_KEY`: Service role key para operaciones admin

## Deployment

Para desplegar esta función:

```bash
supabase functions deploy create-user
```

## Testing Local

Para probar localmente:

```bash
# Iniciar servidor local de Edge Functions
supabase functions serve create-user

# En otra terminal, hacer petición de prueba
curl -i --location --request POST 'http://localhost:54321/functions/v1/create-user' \
  --header 'Authorization: Bearer YOUR_USER_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"email":"test@example.com","first_name":"Test","last_name":"User","role":"user","cities":[]}'
```

## Seguridad

- ✅ Validación de autenticación via JWT token
- ✅ Validación de permisos (admin/supplier only)
- ✅ Validación de ciudades para suppliers
- ✅ Contraseñas seguras generadas aleatoriamente (16 caracteres)
- ✅ Rollback automático si falla la creación del perfil
- ⚠️ **TODO**: Implementar envío de email en lugar de devolver contraseña en response
- ⚠️ **TODO**: Implementar rate limiting (ej: max 10 usuarios/hora por admin)

## Mejoras Futuras

1. **Email Service**: Integrar servicio de email (SendGrid, Resend, etc.) para enviar contraseña temporal
2. **Rate Limiting**: Limitar número de creaciones por usuario/hora
3. **Audit Log**: Registrar quién creó qué usuario y cuándo
4. **Email Templates**: Templates personalizados de bienvenida con branding
5. **Validación de Dominios**: Lista blanca/negra de dominios de email permitidos
