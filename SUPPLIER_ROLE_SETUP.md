# Configuración del Rol "Supplier" (Suministrador)

Este documento explica cómo configurar el nuevo rol de "supplier" en la aplicación centerThink.

## ¿Qué es el rol Supplier?

El rol **supplier** (suministrador) es un rol intermedio entre `admin` y `user` que permite:
- ✅ Acceso completo a Usuarios (crear, editar, eliminar)
- ✅ Acceso completo a Ciudades (crear, editar, eliminar)
- ✅ Acceso a todas las funcionalidades normales (Eventos, Calendario, Ponentes, Locales, Pedidos)

## Pasos para Activar el Rol Supplier

### 1. Ejecutar el Script SQL en Supabase

1. Abre tu proyecto de Supabase
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `supabase/04_add_supplier_role.sql`
4. Copia todo el contenido del archivo
5. Pégalo en el SQL Editor de Supabase
6. Haz clic en **Run** para ejecutar el script

Este script hace dos cosas:
- Actualiza la tabla `user_profiles` para permitir el rol 'supplier'
- Asigna el rol 'supplier' al usuario `pablomagub@gmail.com`

### 2. Verificar que el Cambio se Aplicó Correctamente

Después de ejecutar el script, ejecuta esta query en el SQL Editor para verificar:

```sql
SELECT
  up.id,
  au.email,
  up.first_name,
  up.last_name,
  up.role,
  up.cities
FROM user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'pablomagub@gmail.com';
```

Deberías ver que el campo `role` tiene el valor `'supplier'`.

### 3. Cerrar Sesión y Volver a Iniciar Sesión

Para que los cambios surtan efecto:
1. Cierra sesión en la aplicación
2. Vuelve a iniciar sesión con el usuario `pablomagub@gmail.com`
3. Ahora deberías ver las opciones de **Usuarios** y **Ciudades** en el menú de navegación

## Roles Disponibles

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **admin** | Administrador completo | Acceso total a todas las funcionalidades |
| **supplier** | Suministrador | Todas las funcionalidades + gestión de Usuarios y Ciudades |
| **user** | Usuario normal | Eventos, Calendario, Ponentes, Locales, Pedidos |

## Asignar el Rol Supplier a Otros Usuarios

Si necesitas asignar el rol 'supplier' a otros usuarios, ejecuta este SQL en Supabase:

```sql
UPDATE user_profiles
SET role = 'supplier'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'email_del_usuario@ejemplo.com'
);
```

Reemplaza `'email_del_usuario@ejemplo.com'` con el email del usuario que quieres actualizar.

## Cambios Realizados en el Código

Los siguientes archivos fueron modificados para soportar el rol 'supplier':

1. **supabase/04_add_supplier_role.sql** - Script SQL para actualizar la base de datos
2. **src/Layout.jsx** - Agregado 'supplier' a los roles permitidos en el menú
3. **src/entities/User.js** - Actualizado el schema para incluir el rol 'supplier'

## Troubleshooting

### El usuario sigue sin ver Usuarios y Ciudades después de iniciar sesión

1. Verifica que el script SQL se ejecutó correctamente
2. Cierra sesión completamente (borra cookies si es necesario)
3. Vuelve a iniciar sesión
4. Abre la consola del navegador (F12) y busca logs de `AuthContext: Profile loaded` para ver qué rol tiene el usuario

### Error: "new row for relation violates check constraint"

Esto significa que el script SQL no se ejecutó. Asegúrate de ejecutar el archivo `04_add_supplier_role.sql` en el SQL Editor de Supabase.
