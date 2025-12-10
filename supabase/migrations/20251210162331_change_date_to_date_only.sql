-- Migración: Cambiar fecha de TIMESTAMP WITH TIME ZONE a DATE
-- Archivo: supabase/08_change_date_to_date_only.sql
-- Descripción: Elimina la parte de hora del campo date en eventos
--              ya que los Thinkglaos siempre son a la misma hora

-- Primero verificar el estado actual
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'events' AND column_name = 'date';

  RAISE NOTICE 'Tipo actual de columna date: %', col_type;
END $$;

-- Realizar la conversión de TIMESTAMP WITH TIME ZONE a DATE
-- La conversión preserva el día del mes, descartando la hora
ALTER TABLE events
ALTER COLUMN date TYPE DATE USING date::DATE;

-- Verificar el cambio
DO $$
DECLARE
  col_type TEXT;
  event_count INTEGER;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_name = 'events' AND column_name = 'date';

  SELECT COUNT(*) INTO event_count FROM events;

  RAISE NOTICE 'Migración completada:';
  RAISE NOTICE '  - Nuevo tipo de columna date: %', col_type;
  RAISE NOTICE '  - Eventos actualizados: %', event_count;
END $$;
