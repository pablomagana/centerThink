-- ============================================================================
-- Create Storage Bucket for Expense Request Attachments
-- ============================================================================
-- Este script crea el bucket de Supabase Storage y sus políticas RLS

-- ============================================================================
-- STEP 1: Create the storage bucket
-- ============================================================================

-- Insert bucket (usa ON CONFLICT para evitar error si ya existe)
INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-attachments', 'expense-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2: Drop existing policies (para recrearlas limpias)
-- ============================================================================

DROP POLICY IF EXISTS "Admin full access to expense attachments" ON storage.objects;
DROP POLICY IF EXISTS "Supplier access to expense attachments" ON storage.objects;

-- ============================================================================
-- STEP 3: Create RLS policies for the bucket
-- ============================================================================

-- Policy: Admin can upload/download all files
CREATE POLICY "Admin full access to expense attachments"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'expense-attachments' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
      AND user_profiles.active = true
    )
  )
  WITH CHECK (
    bucket_id = 'expense-attachments' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
      AND user_profiles.active = true
    )
  );

-- Policy: Supplier can upload/download files
CREATE POLICY "Supplier access to expense attachments"
  ON storage.objects
  FOR ALL
  TO authenticated
  USING (
    bucket_id = 'expense-attachments' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'supplier'
      AND user_profiles.active = true
    )
  )
  WITH CHECK (
    bucket_id = 'expense-attachments' AND
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'supplier'
      AND user_profiles.active = true
    )
  );

-- ============================================================================
-- STEP 4: Verify bucket creation
-- ============================================================================

-- Descomentar para verificar:
-- SELECT id, name, public FROM storage.buckets WHERE id = 'expense-attachments';
