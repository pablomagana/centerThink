-- Seed data for testing
-- Run this script AFTER enabling RLS

-- ============================================
-- SAMPLE CITIES
-- ============================================
INSERT INTO cities (name, country, region, active) VALUES
  ('Madrid', 'España', 'Comunidad de Madrid', true),
  ('Barcelona', 'España', 'Cataluña', true),
  ('Valencia', 'España', 'Comunidad Valenciana', true),
  ('Sevilla', 'España', 'Andalucía', true),
  ('Bilbao', 'España', 'País Vasco', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- SAMPLE SPEAKERS
-- ============================================
INSERT INTO speakers (name, email, phone, bio, contact_status, proposal_status, active) VALUES
  ('Juan Pérez', 'juan.perez@example.com', '+34 600 123 456', 'Experto en tecnología y desarrollo web', 'contactado', 'confirmado', true),
  ('María García', 'maria.garcia@example.com', '+34 600 234 567', 'Especialista en inteligencia artificial', 'seguimiento', 'propuesta_enviada', true),
  ('Carlos Rodríguez', 'carlos.rodriguez@example.com', '+34 600 345 678', 'Emprendedor y coach empresarial', 'no_contactado', 'sin_propuesta', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- SAMPLE ORDER TYPES
-- ============================================
INSERT INTO order_types (name, description, priority, active) VALUES
  ('Material Promocional', 'Preparar flyers, carteles y material publicitario', 'alta', true),
  ('Catering', 'Organizar comida y bebida para el evento', 'media', true),
  ('Equipo Técnico', 'Asegurar proyector, sonido y equipamiento', 'alta', true),
  ('Fotografía', 'Contratar fotógrafo para el evento', 'baja', true),
  ('Redes Sociales', 'Crear posts y promocionar el evento', 'media', true)
ON CONFLICT DO NOTHING;

-- Note: Venues and Events require city_id and user IDs
-- These will be created through the application once cities and users exist
