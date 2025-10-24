-- Enable Row Level Security (RLS) on all tables
-- Run this script AFTER creating the tables

-- ============================================
-- ENABLE RLS
-- ============================================
ALTER TABLE cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CITIES POLICIES
-- ============================================

-- Allow all authenticated users to read cities
CREATE POLICY "Cities are viewable by authenticated users"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete cities
CREATE POLICY "Cities are modifiable by admins only"
  ON cities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- SPEAKERS POLICIES
-- ============================================

-- Allow all authenticated users to read speakers
CREATE POLICY "Speakers are viewable by authenticated users"
  ON speakers FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete speakers
CREATE POLICY "Speakers are modifiable by admins only"
  ON speakers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- VENUES POLICIES
-- ============================================

-- Allow all authenticated users to read venues
CREATE POLICY "Venues are viewable by authenticated users"
  ON venues FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete venues
CREATE POLICY "Venues are modifiable by admins only"
  ON venues FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- ORDER TYPES POLICIES
-- ============================================

-- Allow all authenticated users to read order types
CREATE POLICY "Order types are viewable by authenticated users"
  ON order_types FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete order types
CREATE POLICY "Order types are modifiable by admins only"
  ON order_types FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- ============================================
-- EVENTS POLICIES
-- ============================================

-- Users can see events from their assigned cities (or all if admin)
CREATE POLICY "Events are viewable by users in their cities"
  ON events FOR SELECT
  TO authenticated
  USING (
    -- Admin can see all
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
    OR
    -- Regular users see events from their cities
    city_id = ANY(
      SELECT unnest(cities) FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
  );

-- All authenticated users can create/update/delete events
CREATE POLICY "Events are modifiable by authenticated users"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- EVENT ORDERS POLICIES
-- ============================================

-- Users can see event orders from their assigned cities (or all if admin)
CREATE POLICY "Event orders are viewable by users"
  ON event_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events e
      INNER JOIN user_profiles up ON up.id = auth.uid()
      WHERE e.id = event_orders.event_id
      AND (
        up.role = 'admin'
        OR e.city_id = ANY(up.cities)
      )
    )
  );

-- All authenticated users can create/update/delete event orders
CREATE POLICY "Event orders are modifiable by authenticated users"
  ON event_orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================
-- USER PROFILES POLICIES
-- ============================================

-- Users can view their own profile, admins can view all
CREATE POLICY "User profiles are viewable by self or admin"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM user_profiles up
      WHERE up.id = auth.uid()
      AND up.role = 'admin'
    )
  );

-- Only admins can insert/update/delete user profiles
CREATE POLICY "User profiles are modifiable by admins only"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
