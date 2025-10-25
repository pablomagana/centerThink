-- Script para activar (confirmar email) todos los usuarios registrados
-- Esto es útil si migraste de un sistema sin confirmación de email a uno con confirmación

-- IMPORTANTE: Ejecuta esto en el SQL Editor de Supabase Dashboard
-- Dashboard → SQL Editor → New Query → Pega este código → Run

-- 1. Actualizar todos los usuarios en auth.users para marcar email como confirmado
-- NOTA: confirmed_at es una columna generada automáticamente, no se actualiza manualmente
UPDATE auth.users
SET
  email_confirmed_at = NOW(),
  updated_at = NOW()
WHERE
  email_confirmed_at IS NULL;

-- 2. Verificar cuántos usuarios fueron actualizados
SELECT
  COUNT(*) as total_users,
  COUNT(CASE WHEN email_confirmed_at IS NOT NULL THEN 1 END) as confirmed_users,
  COUNT(CASE WHEN email_confirmed_at IS NULL THEN 1 END) as unconfirmed_users
FROM auth.users;

-- 3. Ver lista de usuarios confirmados (opcional)
-- Descomenta las siguientes líneas si quieres ver la lista completa
-- SELECT
--   u.id,
--   u.email,
--   u.email_confirmed_at,
--   u.created_at,
--   up.first_name,
--   up.last_name,
--   up.role
-- FROM auth.users u
-- LEFT JOIN public.user_profiles up ON u.id = up.id
-- ORDER BY u.created_at DESC;
