-- SQL de diagnóstico para el email nuevo que registraste
-- Ejecuta esto en: https://app.supabase.com/project/lzqhfgeduchvizykaqih/sql/new

-- PASO 1: Ver el usuario más reciente (el que acabas de registrar)
SELECT
  email,
  created_at,
  confirmation_sent_at,
  email_confirmed_at,
  confirmed_at,
  CASE
    WHEN confirmation_sent_at IS NULL THEN '❌ Supabase NO intentó enviar email'
    WHEN confirmation_sent_at IS NOT NULL AND email_confirmed_at IS NULL THEN '📧 Supabase SÍ envió email, pero usuario no confirmó'
    WHEN email_confirmed_at IS NOT NULL THEN '✅ Email confirmado'
  END as estado_diagnostico
FROM auth.users
ORDER BY created_at DESC
LIMIT 1;

-- PASO 2: Si quieres ver un email específico, descomenta y ejecuta esto:
/*
SELECT
  email,
  created_at,
  confirmation_sent_at,
  email_confirmed_at,
  raw_user_meta_data
FROM auth.users
WHERE email = 'tu-email-nuevo@example.com';  -- Reemplaza con tu email
*/

-- PASO 3: Ver TODOS los usuarios recientes y su estado
SELECT
  email,
  created_at,
  confirmation_sent_at,
  email_confirmed_at,
  CASE
    WHEN confirmation_sent_at IS NULL THEN '❌ NO envió'
    ELSE '📧 SÍ envió'
  END as email_enviado
FROM auth.users
ORDER BY created_at DESC
LIMIT 10;
