-- Add supplier role to the user_profiles table
-- Run this script in your Supabase SQL Editor

-- ============================================
-- Step 1: Update the CHECK constraint to include 'supplier' role
-- ============================================

-- First, drop the existing constraint
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_role_check;

-- Add the new constraint with supplier role
ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_role_check
CHECK (role IN ('admin', 'user', 'supplier'));

-- ============================================
-- Step 2: Update the user pablomagub@gmail.com to supplier role
-- ============================================

-- Update the user profile
UPDATE user_profiles
SET role = 'supplier'
WHERE id = (
  SELECT id
  FROM auth.users
  WHERE email = 'pablomagub@gmail.com'
);

-- ============================================
-- Verification query (run this to check the changes)
-- ============================================

-- Check if the update was successful
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
