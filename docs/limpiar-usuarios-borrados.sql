-- Script para limpiar completamente usuarios borrados y permitir re-registro
-- Esto es necesario cuando un email se ha registrado y borrado múltiples veces

-- IMPORTANTE: Ejecuta esto en el SQL Editor de Supabase Dashboard
-- Dashboard → SQL Editor → New Query → Pega este código → Run

-- ⚠️ ESTE SCRIPT DEBE EJECUTARSE COMO SUPERUSUARIO (postgres role)

-- 1. Ver usuarios que están "soft deleted" pero aún existen
SELECT
  id,
  email,
  deleted_at,
  created_at,
  email_confirmed_at
FROM auth.users
WHERE deleted_at IS NOT NULL
ORDER BY deleted_at DESC;

-- 2. LIMPIAR completamente usuarios borrados (hard delete)
-- Descomenta las siguientes líneas para ejecutar la limpieza:

/*
-- Eliminar usuarios que fueron borrados hace más de 1 día
DELETE FROM auth.users
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '1 day';
*/

-- 3. Para limpiar un email específico que da problemas:
-- Reemplaza 'email@problematico.com' con el email que quieres limpiar

/*
-- Ver si existe en auth.users (incluso borrado)
SELECT * FROM auth.users WHERE email = 'email@problematico.com';

-- Ver si existe en user_profiles
SELECT * FROM public.user_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'email@problematico.com'
);

-- Eliminar completamente (hard delete)
DELETE FROM auth.users WHERE email = 'email@problematico.com';
DELETE FROM public.user_profiles WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'email@problematico.com'
);
*/

-- 4. Verificar que se limpió correctamente
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN deleted_at IS NOT NULL THEN 1 END) as soft_deleted_users,
  COUNT(CASE WHEN deleted_at IS NULL THEN 1 END) as active_users
FROM auth.users;
