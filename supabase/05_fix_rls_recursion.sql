-- Fix RLS recursion issue in user_profiles table
-- This script removes the problematic policies and creates simpler ones

-- ============================================
-- DROP OLD POLICIES
-- ============================================

DROP POLICY IF EXISTS "User profiles are viewable by self or admin" ON user_profiles;
DROP POLICY IF EXISTS "User profiles are modifiable by admins only" ON user_profiles;

-- ============================================
-- CREATE NEW POLICIES (without recursion)
-- ============================================

-- Users can always view their own profile
-- This avoids recursion by not checking other user_profiles rows
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Service role can do everything (for admin operations)
-- Admins should use service role key for admin operations
CREATE POLICY "Service role has full access"
  ON user_profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================
-- VERIFICATION
-- ============================================

-- Check that policies were created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'user_profiles';
