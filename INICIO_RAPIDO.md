# 🚀 Inicio Rápido: Sistema de Creación de Usuarios

## ¿Qué se implementó?

Se reemplazó el modal de "¿Cómo Invitar?" con un **formulario completo** para crear usuarios directamente desde la aplicación, con:

- ✅ Formulario con email, nombre, apellidos, rol, teléfono y ciudades
- ✅ Validación de permisos (Admin y Supplier pueden crear)
- ✅ Generación automática de contraseña temporal segura
- ✅ Filtrado de ciudades según el rol del creador

## 🎯 Para Probar Localmente (Desarrollo)

### 1. Instalar/Actualizar Dependencias

```bash
npm install
```

### 2. Iniciar la Aplicación

```bash
npm run dev
```

### 3. Probar la Funcionalidad

1. Inicia sesión como **Admin** o **Supplier**
2. Ve a la página **"Usuarios"**
3. Verás el nuevo botón **"Crear Usuario"** (en lugar de "¿Cómo Invitar?")
4. Haz clic y completa el formulario
5. **NOTA**: En desarrollo, esto creará el usuario en la tabla `user_profiles` pero **NO** en `auth.users` (requiere Edge Function desplegada)

## 🚀 Para Desplegar a Producción

### Requisitos Previos

```bash
# Instalar Supabase CLI (solo primera vez)
npm install -g supabase

# Verificar instalación
supabase --version
```

### Pasos de Despliegue

```bash
# 1. Login en Supabase
supabase login

# 2. Vincular proyecto (obtén PROJECT_REF desde https://app.supabase.com)
supabase link --project-ref YOUR_PROJECT_REF

# 3. Desplegar Edge Function
supabase functions deploy create-user

# 4. Verificar despliegue
supabase functions list
```

### Configurar Base de Datos

Ve a tu proyecto en Supabase → SQL Editor y ejecuta:

```sql
-- Permitir a admins y suppliers crear usuarios
CREATE POLICY "Admins and suppliers can insert user profiles"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'supplier')
  )
);
```

### Testing en Producción

1. Inicia sesión como Admin
2. Ve a Usuarios → "Crear Usuario"
3. Crea un usuario de prueba
4. Verás un **alert con la contraseña temporal** (⚠️ anótala)
5. Verifica que el usuario aparece en la lista
6. Intenta iniciar sesión con el nuevo usuario

## ⚠️ IMPORTANTE: Sistema de Email

Actualmente, la contraseña temporal se muestra en un **alert()**. Esto es **temporal** para desarrollo/testing.

**Para producción, DEBES implementar un servicio de email**:

Opciones recomendadas:
- **Resend** (https://resend.com) - Fácil, moderna, gratis hasta 3000 emails/mes
- **SendGrid** (https://sendgrid.com) - Popular, robusta
- **AWS SES** (https://aws.amazon.com/ses/) - Si ya usas AWS

Ver `DEPLOYMENT_USER_CREATION.md` sección "Mejoras Futuras" para código de ejemplo.

## 📁 Archivos Importantes

```
src/
├── components/users/
│   └── UserCreateForm.tsx          ← Nuevo formulario
├── Pages/
│   └── Users.tsx                   ← Integración del formulario
├── services/
│   └── user.service.js             ← Método createComplete()

supabase/
└── functions/
    └── create-user/
        ├── index.ts                ← Edge Function
        └── README.md               ← Docs técnicas

Docs/
├── PRD_USER_CREATION_FORM.md       ← Especificaciones completas
├── DEPLOYMENT_USER_CREATION.md     ← Guía de despliegue detallada
├── RESUMEN_IMPLEMENTACION.md       ← Resumen técnico
└── INICIO_RAPIDO.md                ← Este archivo
```

## 🐛 Problemas Comunes

### "Usuario creado pero no puedo iniciar sesión"

**Causa**: La Edge Function no está desplegada, solo se creó en `user_profiles` pero no en `auth.users`.

**Solución**: Desplegar la Edge Function siguiendo los pasos arriba.

### "Error: Insufficient permissions"

**Causa**: Tu usuario no tiene rol `admin` o `supplier`.

**Solución**: Actualizar tu rol en la tabla `user_profiles`:
```sql
UPDATE user_profiles
SET role = 'admin'
WHERE id = 'tu-user-id';
```

### "Supplier can only create users in their assigned cities"

**Causa**: Intentas asignar una ciudad que no tienes permitida (esto es correcto).

**Solución**: Solo asigna ciudades que aparecen en tu selector (las que tienes asignadas).

## 🎓 Roles y Permisos

| Rol | Puede crear usuarios | Ciudades disponibles |
|-----|---------------------|----------------------|
| **Admin** | ✅ Sí | Todas |
| **Supplier** | ✅ Sí | Solo las asignadas |
| **User** | ❌ No | N/A |

## 📞 Soporte

Si tienes problemas:

1. **Ver logs de la Edge Function**:
   ```bash
   supabase functions logs create-user --follow
   ```

2. **Ver consola del navegador**: F12 → Console

3. **Revisar documentación detallada**:
   - `DEPLOYMENT_USER_CREATION.md` - Troubleshooting completo
   - `PRD_USER_CREATION_FORM.md` - Casos de prueba

## ✅ Checklist Rápido

Antes de considerar completo:

- [ ] Edge Function desplegada
- [ ] RLS policy configurada
- [ ] Probado crear usuario como Admin
- [ ] Probado crear usuario como Supplier
- [ ] Verificado que User NO puede crear
- [ ] Usuario creado puede iniciar sesión
- [ ] **Sistema de email implementado** (para producción)

## 🎉 ¡Listo!

El sistema está implementado y documentado. Ahora solo necesitas:

1. **Desarrollo**: Ya funciona (sin email)
2. **Producción**: Desplegar Edge Function + Configurar Email

---

**¿Preguntas?** Revisa los documentos detallados o los comentarios en el código.
