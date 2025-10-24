# Guía de Despliegue: Sistema de Creación de Usuarios

Esta guía explica cómo desplegar el nuevo sistema de creación de usuarios en producción.

## Cambios Implementados

### Frontend
- ✅ Nuevo componente `UserCreateForm.tsx` con formulario completo
- ✅ Integración en `Users.tsx` con botón "Crear Usuario"
- ✅ Filtrado de ciudades para rol Supplier
- ✅ Validaciones client-side
- ✅ Manejo de errores con feedback visual

### Backend
- ✅ Edge Function `create-user` en `supabase/functions/create-user/`
- ✅ Método `createComplete()` en `user.service.js`
- ✅ Validación de permisos (Admin/Supplier)
- ✅ Generación de contraseñas seguras
- ✅ Rollback automático en caso de error

## Pasos de Despliegue

### 1. Verificar Requisitos Previos

Asegúrate de tener instalado:
```bash
# Supabase CLI
npm install -g supabase

# Verificar instalación
supabase --version
```

### 2. Configurar Variables de Entorno

La Edge Function requiere acceso a las siguientes variables de entorno en Supabase:

- `SUPABASE_URL`: Ya configurada automáticamente
- `SUPABASE_ANON_KEY`: Ya configurada automáticamente
- `SUPABASE_SERVICE_ROLE_KEY`: Ya configurada automáticamente

No se requiere configuración adicional de variables de entorno.

### 3. Autenticarse en Supabase

```bash
# Login en Supabase
supabase login

# Vincular proyecto (si no está vinculado)
supabase link --project-ref YOUR_PROJECT_REF
```

Para obtener tu `PROJECT_REF`:
1. Ve a https://app.supabase.com
2. Abre tu proyecto
3. El PROJECT_REF está en la URL: `https://app.supabase.com/project/[PROJECT_REF]`

### 4. Desplegar la Edge Function

```bash
# Desde la raíz del proyecto
cd /Users/p.magana/Documents/projects/centerThink

# Desplegar la función
supabase functions deploy create-user
```

Deberías ver una salida similar a:
```
Deploying create-user (project ref: your-project-ref)
Bundled create-user (XX.XX kB)
Deployed create-user (0.XX s)
```

### 5. Verificar el Despliegue

```bash
# Listar funciones desplegadas
supabase functions list
```

Deberías ver `create-user` en la lista.

### 6. Configurar Row Level Security (RLS)

Ejecuta las siguientes policies en Supabase SQL Editor:

```sql
-- Permitir a admins y suppliers crear user_profiles
CREATE POLICY "Admins and suppliers can insert user profiles"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'supplier')
  )
);

-- Asegurar que los user_profiles existentes solo puedan ser actualizados por admin/supplier
-- (Si no existe ya esta policy)
CREATE POLICY "Admins and suppliers can update user profiles"
ON user_profiles FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'supplier')
  )
);
```

### 7. Testing en Producción

#### 7.1 Test Básico desde la UI

1. Inicia sesión como Admin o Supplier
2. Ve a la página de Usuarios
3. Haz clic en "Crear Usuario"
4. Completa el formulario:
   - Email: `test@example.com`
   - Nombre: `Test`
   - Apellidos: `User`
   - Rol: `user`
   - Ciudades: Selecciona al menos una
5. Haz clic en "Crear Usuario"
6. Deberías ver un alert con la contraseña temporal
7. Verifica que el usuario aparece en la lista

#### 7.2 Test de Permisos de Supplier

1. Inicia sesión como Supplier
2. Ve a la página de Usuarios
3. Haz clic en "Crear Usuario"
4. Intenta asignar una ciudad que NO está asignada al Supplier
5. Deberías ver un error: "Supplier can only create users in their assigned cities"

#### 7.3 Test de Usuario Sin Permisos

1. Inicia sesión como Usuario (role: user)
2. El botón "Crear Usuario" NO debería aparecer
3. La navegación NO debería mostrar el enlace a "Usuarios"

### 8. Monitoreo y Logs

Puedes ver los logs de la Edge Function en tiempo real:

```bash
# Ver logs en tiempo real
supabase functions logs create-user --follow
```

O desde el Dashboard de Supabase:
1. Ve a tu proyecto en https://app.supabase.com
2. Sidebar → Edge Functions
3. Selecciona `create-user`
4. Tab "Logs"

### 9. Desplegar Frontend

Una vez verificada la Edge Function:

```bash
# Build del frontend
npm run build

# El comando exacto dependerá de tu hosting
# Ejemplo con Vercel:
vercel --prod

# Ejemplo con Netlify:
netlify deploy --prod
```

## Rollback en Caso de Problemas

Si algo sale mal, puedes hacer rollback:

### Rollback de la Edge Function

```bash
# Ver versiones anteriores
supabase functions list --version

# Deshacer último deploy (volver a versión anterior)
supabase functions delete create-user
```

### Rollback del Frontend

Simplemente vuelve a desplegar la versión anterior desde Git:
```bash
git checkout <commit-anterior>
npm run build
# Desplegar según tu hosting
```

## Mejoras Futuras Recomendadas

Una vez que el sistema esté funcionando en producción:

### 1. Sistema de Email (IMPORTANTE)

Actualmente, la contraseña temporal se muestra en un alert. **Esto NO es seguro para producción**.

Opciones recomendadas:
- **SendGrid**: Servicio de email transaccional
- **Resend**: API moderna para emails
- **AWS SES**: Si ya usas AWS

Implementación sugerida:
```typescript
// En la Edge Function, después de crear el usuario:
await sendEmail({
  to: email,
  subject: 'Bienvenido a CenterThink',
  template: 'welcome',
  data: {
    first_name,
    tempPassword,
    loginUrl: 'https://your-app.com/login'
  }
});
```

### 2. Rate Limiting

Limitar creaciones de usuarios por hora/día por admin:

```typescript
// En Edge Function
const rateLimit = await checkRateLimit(user.id, 'user-creation', {
  maxRequests: 10,
  windowMinutes: 60
});

if (!rateLimit.allowed) {
  return new Response(
    JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }),
    { status: 429 }
  );
}
```

### 3. Audit Log

Registrar quién creó qué usuario:

```sql
CREATE TABLE user_creation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_by UUID REFERENCES user_profiles(id),
  created_user UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP DEFAULT NOW(),
  ip_address TEXT
);
```

### 4. Notificaciones Toast

Reemplazar `alert()` con un sistema de notificaciones más elegante:
- react-hot-toast
- sonner
- react-toastify

## Problemas Comunes y Soluciones

### Error: "Missing authorization header"

**Causa**: El token de autenticación no se está enviando correctamente.

**Solución**: Verificar que el usuario esté autenticado antes de llamar a la función.

### Error: "Insufficient permissions"

**Causa**: El usuario que intenta crear no tiene rol admin o supplier.

**Solución**: Verificar el rol en la tabla `user_profiles`.

### Error: "Email already exists"

**Causa**: El email ya está registrado en auth.users.

**Solución**: Es un error esperado. El usuario debe usar otro email.

### Error: "Supplier can only create users in their assigned cities"

**Causa**: Un Supplier intenta asignar ciudades que no tiene asignadas.

**Solución**: Es un error esperado. El Supplier debe asignar solo sus ciudades.

### Edge Function no responde

**Causa**: Puede ser un problema de timeout o error en el código.

**Solución**:
1. Ver logs: `supabase functions logs create-user`
2. Verificar que todas las variables de entorno estén configuradas
3. Re-desplegar la función

## Contacto y Soporte

Para problemas durante el despliegue:
1. Revisar logs de Supabase
2. Verificar consola del navegador (F12)
3. Revisar PRD_USER_CREATION_FORM.md para detalles técnicos

## Checklist Final

Antes de considerar el despliegue completo:

- [ ] Edge Function desplegada correctamente
- [ ] RLS policies configuradas
- [ ] Testing básico completado (crear usuario admin)
- [ ] Testing de permisos completado (supplier y user)
- [ ] Frontend desplegado
- [ ] Logs monitoreados sin errores
- [ ] Usuario de prueba eliminado
- [ ] Documentación actualizada
- [ ] Equipo notificado del nuevo feature

## Notas de Seguridad

⚠️ **IMPORTANTE**:

1. **NUNCA** expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend
2. La contraseña temporal debe comunicarse de forma segura (idealmente por email)
3. Implementa rate limiting lo antes posible
4. Monitorea los logs regularmente
5. Considera implementar 2FA para cuentas admin

---

**Fecha de Última Actualización**: 2025-10-23
**Versión**: 1.0
**Autor**: Claude Code
