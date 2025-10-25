-- ====================================================================
-- Script de Recuperación: Perfil de pablomagub@gmail.com
-- ====================================================================

-- PASO 1: Obtener el ID del usuario y verificar sus datos
-- Ejecuta esto primero para ver la información del usuario
SELECT
  id as user_id,
  email,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'last_name' as last_name,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE email = 'pablomagub@gmail.com';

-- ====================================================================
-- PASO 2: Verificar si ya existe el perfil (para evitar duplicados)
-- ====================================================================
SELECT *
FROM public.user_profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'pablomagub@gmail.com'
);

-- ====================================================================
-- PASO 3: Obtener IDs de ciudades disponibles
-- (Para asignar ciudades al usuario)
-- ====================================================================
SELECT id, name, country, active
FROM public.cities
WHERE active = true
ORDER BY name;

-- ====================================================================
-- PASO 4: Recrear el perfil del usuario
-- IMPORTANTE: Reemplaza los valores según tus necesidades:
--   - Ajusta first_name, last_name si son diferentes
--   - Cambia 'admin' por 'user' o 'supplier' según corresponda
--   - Agrega los IDs de ciudades en el ARRAY (copia los IDs del PASO 3)
--   - Agrega el teléfono si lo conoces
-- ====================================================================

INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  role,
  cities,
  phone,
  created_at,
  updated_at
)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'first_name', 'Pablo'),  -- Ajusta el nombre aquí
  COALESCE(au.raw_user_meta_data->>'last_name', 'Magaña'),  -- Ajusta el apellido aquí
  'admin',  -- Cambia por 'user' o 'supplier' si corresponde
  ARRAY[]::text[],  -- Agrega IDs de ciudades aquí: ARRAY['city-id-1', 'city-id-2']::text[]
  NULL,  -- Agrega teléfono si lo conoces: '+34 600 000 000'
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'pablomagub@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);

-- ====================================================================
-- PASO 5: Verificar que se creó correctamente
-- ====================================================================
SELECT
  up.*,
  au.email
FROM public.user_profiles up
JOIN auth.users au ON au.id = up.id
WHERE au.email = 'pablomagub@gmail.com';

-- ====================================================================
-- EJEMPLO COMPLETO (con datos de ejemplo):
-- Descomenta y ajusta según tus datos reales
-- ====================================================================

/*
-- Si tus ciudades tienen IDs como: 'abc-123' y 'def-456'
-- Y quieres que sea admin con teléfono:

INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  role,
  cities,
  phone,
  created_at,
  updated_at
)
SELECT
  au.id,
  'Pablo',
  'Magaña',
  'admin',
  ARRAY['abc-123', 'def-456']::text[],  -- Reemplaza con tus IDs de ciudades
  '+34 600 000 000',  -- Reemplaza con tu teléfono
  au.created_at,
  NOW()
FROM auth.users au
WHERE au.email = 'pablomagub@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_profiles up WHERE up.id = au.id
);
*/
