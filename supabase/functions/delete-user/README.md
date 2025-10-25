# Delete User Edge Function

Esta Edge Function elimina un usuario completamente del sistema, tanto de `auth.users` como de `user_profiles`.

## Funcionalidad

- Elimina el perfil del usuario de la tabla `user_profiles`
- Elimina el usuario de `auth.users` en Supabase Auth
- Valida permisos (solo admin y supplier pueden eliminar)
- Previene que un usuario se elimine a sí mismo
- Maneja errores con rollback apropiado

## Endpoint

```
POST /functions/v1/delete-user
```

## Autenticación

Requiere token JWT válido en el header `Authorization: Bearer <token>`.

## Request Body

```json
{
  "userId": "uuid-del-usuario-a-eliminar"
}
```

## Response

### Éxito (200)

```json
{
  "success": true,
  "message": "User deleted successfully from both auth and profiles"
}
```

### Error (400, 401, 403, 500)

```json
{
  "error": "Descripción del error",
  "details": { ... }
}
```

## Permisos

- **Admin**: Puede eliminar cualquier usuario (excepto a sí mismo)
- **Supplier**: Puede eliminar usuarios (excepto a sí mismo)
- **User**: No puede eliminar usuarios

## Validaciones

1. El usuario que elimina debe estar autenticado
2. El usuario que elimina debe tener rol `admin` o `supplier`
3. No se puede eliminar el propio usuario
4. El userId debe existir

## Flujo de Eliminación

1. Valida autenticación y permisos
2. Elimina el perfil de `user_profiles` primero
3. Elimina el usuario de `auth.users`
4. Si falla algún paso, retorna error con detalles

## Variables de Entorno Requeridas

- `SUPABASE_URL`: URL del proyecto Supabase
- `SUPABASE_ANON_KEY`: Clave anónima del proyecto
- `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio con permisos de administrador

## Uso desde el Cliente

```javascript
import { User } from '@/entities/User';

// Eliminar usuario completamente
await User.deleteComplete('user-id-to-delete');
```

## Notas de Seguridad

- La eliminación es **permanente** y no se puede deshacer
- Los usuarios no pueden eliminarse a sí mismos (para prevenir pérdida de acceso accidental)
- Solo roles admin y supplier tienen permisos de eliminación
- Usa service role key para operaciones de eliminación en auth.users

## Testing

Para probar localmente con Supabase CLI:

```bash
supabase functions serve delete-user --env-file .env.local
```

Para desplegar:

```bash
supabase functions deploy delete-user
```
