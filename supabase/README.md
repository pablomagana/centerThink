# Supabase Database Setup

Este directorio contiene los scripts SQL necesarios para configurar la base de datos de centerThink en Supabase.

## Orden de Ejecución

Ejecuta los scripts en el siguiente orden en tu **Supabase SQL Editor**:

### 1. Crear Tablas
```bash
supabase/01_create_tables.sql
```
Este script:
- Crea todas las tablas necesarias
- Configura índices para mejor rendimiento
- Crea triggers para actualizar `updated_at` automáticamente

### 2. Habilitar Row Level Security
```bash
supabase/02_enable_rls.sql
```
Este script:
- Habilita RLS en todas las tablas
- Crea políticas de seguridad basadas en roles
- Configura permisos de lectura/escritura

### 3. Datos de Prueba (Opcional)
```bash
supabase/03_seed_data.sql
```
Este script:
- Inserta ciudades de ejemplo
- Inserta ponentes de ejemplo
- Inserta tipos de pedidos de ejemplo

## Crear Usuario Admin

Después de ejecutar los scripts, necesitas crear tu primer usuario:

### Paso 1: Registrar usuario en Supabase Auth

Ve a **Authentication > Users** en tu panel de Supabase y crea un nuevo usuario, o regístrate desde la aplicación.

### Paso 2: Crear perfil de admin

Una vez tengas el `user_id`, ejecuta esto en el SQL Editor (reemplaza `USER_ID_AQUI`):

```sql
INSERT INTO user_profiles (id, first_name, last_name, phone, cities, role)
VALUES (
  'USER_ID_AQUI',  -- Reemplaza con el UUID del usuario de auth.users
  'Admin',
  'Principal',
  '+34 600 000 000',
  (SELECT ARRAY_AGG(id) FROM cities WHERE active = true),  -- Asigna todas las ciudades
  'admin'
);
```

## Verificar Configuración

Después de ejecutar todos los scripts, verifica que todo funciona:

```sql
-- Ver todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Ver políticas RLS
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';

-- Ver usuarios y perfiles
SELECT
  au.id,
  au.email,
  up.first_name,
  up.last_name,
  up.role
FROM auth.users au
LEFT JOIN user_profiles up ON up.id = au.id;
```

## Estructura de Permisos

### Roles
- **admin**: Acceso completo a todo
- **user**: Acceso limitado a eventos de sus ciudades asignadas

### Reglas RLS
- **Cities, Speakers, Venues, OrderTypes**:
  - Lectura: Todos los usuarios autenticados
  - Escritura: Solo admins

- **Events**:
  - Lectura: Usuarios ven eventos de sus ciudades, admins ven todos
  - Escritura: Todos los usuarios autenticados

- **EventOrders**:
  - Lectura: Usuarios ven órdenes de eventos de sus ciudades
  - Escritura: Todos los usuarios autenticados

- **UserProfiles**:
  - Lectura: Usuarios ven su propio perfil, admins ven todos
  - Escritura: Solo admins

## Troubleshooting

### Error: "new row violates row-level security policy"
- Asegúrate de que el usuario tiene un perfil en `user_profiles`
- Verifica que el role del usuario es correcto
- Para operaciones de admin, asegúrate de que `role = 'admin'`

### Error: "permission denied for table"
- Verifica que RLS está habilitado
- Revisa que las políticas estén creadas correctamente
- Asegúrate de estar autenticado

### No aparecen datos en la aplicación
- Verifica que tienes ciudades asignadas en tu perfil
- Comprueba que los eventos tienen `city_id` válidos
- Revisa la consola del navegador para errores de Supabase

## Variables de Entorno

No olvides configurar en tu archivo `.env`:

```bash
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

Encuentra estas credenciales en: **Settings > API** en tu panel de Supabase.
