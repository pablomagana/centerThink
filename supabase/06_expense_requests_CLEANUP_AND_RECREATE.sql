-- Migration: Cleanup and recreate expense_requests table
-- Date: 2025-11-01
-- Description: Complete cleanup of existing expense_requests and recreation with correct foreign keys

-- ============================================================================
-- STEP 1: Complete cleanup - Drop everything related to expense_requests
-- ============================================================================

-- Drop all RLS policies first
DROP POLICY IF EXISTS "Admin full access to expense_requests" ON expense_requests;
DROP POLICY IF EXISTS "Supplier access to expense_requests in assigned cities" ON expense_requests;
DROP POLICY IF EXISTS "Admin full access to expense attachments" ON storage.objects;
DROP POLICY IF EXISTS "Supplier access to expense attachments" ON storage.objects;

-- Drop the table (this will cascade to trigger and indexes)
DROP TABLE IF EXISTS expense_requests CASCADE;

-- Drop old tables if they still exist
DROP TABLE IF EXISTS event_orders CASCADE;
DROP TABLE IF EXISTS order_types CASCADE;

-- ============================================================================
-- STEP 2: Create expense_requests table with CORRECT foreign keys
-- ============================================================================

CREATE TABLE expense_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Basic Information
  request_name TEXT NOT NULL,
  email TEXT NOT NULL,

  -- Request Type (enum)
  request_type TEXT NOT NULL CHECK (
    request_type IN ('presupuesto', 'material', 'camisetas', 'viajes', 'IT')
  ),

  -- Financial Information
  estimated_amount DECIMAL(10, 2),
  iban TEXT,

  -- Address for material
  shipping_address TEXT,

  -- Additional details
  additional_info TEXT,

  -- File attachments (stored as JSONB array)
  attachments JSONB DEFAULT '[]'::jsonb,

  -- Status tracking
  status TEXT DEFAULT 'pendiente' CHECK (
    status IN ('pendiente', 'en_proceso', 'completado', 'cancelado')
  ),

  -- Foreign Keys (CORRECTED: created_by points to user_profiles, not auth.users)
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- STEP 3: Create indexes for performance
-- ============================================================================

CREATE INDEX idx_expense_requests_city_id ON expense_requests(city_id);
CREATE INDEX idx_expense_requests_created_by ON expense_requests(created_by);
CREATE INDEX idx_expense_requests_request_type ON expense_requests(request_type);
CREATE INDEX idx_expense_requests_status ON expense_requests(status);
CREATE INDEX idx_expense_requests_created_at ON expense_requests(created_at DESC);

-- ============================================================================
-- STEP 4: Create updated_at trigger
-- ============================================================================

CREATE TRIGGER update_expense_requests_updated_at
  BEFORE UPDATE ON expense_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 5: Create Supabase Storage bucket for attachments
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('expense-attachments', 'expense-attachments', false)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 6: Enable RLS on expense_requests
-- ============================================================================

ALTER TABLE expense_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Admin can do everything
CREATE POLICY "Admin full access to expense_requests"
  ON expense_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
      AND user_profiles.active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
      AND user_profiles.active = true
    )
  );

-- Policy: Supplier can view/edit requests in their assigned cities
CREATE POLICY "Supplier access to expense_requests in assigned cities"
  ON expense_requests
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'supplier'
      AND user_profiles.active = true
      AND expense_requests.city_id = ANY(user_profiles.cities)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'supplier'
      AND user_profiles.active = true
      AND expense_requests.city_id = ANY(user_profiles.cities)
    )
  );

-- ============================================================================
-- STEP 7: Storage RLS policies for attachments
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
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE expense_requests IS 'Solicitudes de gastos para eventos y operaciones';
COMMENT ON COLUMN expense_requests.request_name IS 'Nombre de la solicitud';
COMMENT ON COLUMN expense_requests.request_type IS 'Tipo: presupuesto, material, camisetas, viajes, IT';
COMMENT ON COLUMN expense_requests.estimated_amount IS 'Importe estimado en euros';
COMMENT ON COLUMN expense_requests.iban IS 'IBAN para transferencias bancarias';
COMMENT ON COLUMN expense_requests.shipping_address IS 'Dirección de envío de material';
COMMENT ON COLUMN expense_requests.attachments IS 'Array JSON con metadata de archivos adjuntos';
COMMENT ON COLUMN expense_requests.status IS 'Estado: pendiente, en_proceso, completado, cancelado';
