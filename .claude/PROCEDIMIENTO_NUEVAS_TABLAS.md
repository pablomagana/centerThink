# Procedimiento para Crear Nuevas Tablas con Foreign Keys

## ⚠️ IMPORTANTE: Seguir este orden SIEMPRE

Este procedimiento previene errores de schema y foreign keys que pueden causar horas de debugging.

---

## 1. INVESTIGACIÓN DEL SCHEMA EXISTENTE (PRIMERO)

Antes de escribir CUALQUIER código, verificar:

### a) Revisar tablas relacionadas
```sql
-- En Supabase SQL Editor, ejecutar:
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;
```

### b) Verificar foreign keys existentes
```sql
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'events';  -- Cambiar por tabla de referencia
```

### c) Estudiar servicios similares existentes
```javascript
// Leer al menos 2 servicios existentes para entender el patrón
// Ejemplo: src/services/event.service.js
// - ¿Cómo se hacen los JOINs?
// - ¿Qué columnas se seleccionan?
// - ¿Cómo se relacionan con user_profiles?
```

### d) Documentar hallazgos ANTES de continuar
```
✅ Tabla user_profiles tiene:
   - id (UUID, PK) - NO user_id
   - first_name, last_name
   - role, active
   - cities (UUID[])
   - NO tiene columna email (está en auth.users)

✅ Relación con auth.users:
   - user_profiles.id = auth.users.id (mismo UUID)

✅ Patrón de JOINs:
   - Usar user_profiles!nombre_del_foreign_key(columnas)
```

---

## 2. DISEÑO DE LA MIGRACIÓN

### a) Escribir el CREATE TABLE con foreign keys correctos
```sql
-- CORRECTO: Apuntar a la tabla que usaremos en JOINs
created_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT

-- ❌ INCORRECTO: Apuntar a auth.users cuando el código hará JOIN con user_profiles
created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT
```

### b) Verificar que las columnas existan antes de referenciarlas
```sql
-- Si voy a hacer JOIN con user_profiles, solo puedo seleccionar:
-- id, first_name, last_name, role, active, cities
-- NO: email, user_id (no existen)
```

### c) Nombrar el constraint explícitamente (opcional pero recomendado)
```sql
created_by UUID NOT NULL,
CONSTRAINT fk_expense_requests_created_by
  FOREIGN KEY (created_by)
  REFERENCES user_profiles(id)
  ON DELETE RESTRICT
```

---

## 3. PROBAR LA MIGRACIÓN PRIMERO

### a) Ejecutar la migración en Supabase SQL Editor
```sql
-- Copiar y pegar el script completo
-- Verificar que no hay errores
```

### b) Probar una consulta de prueba
```sql
SELECT
  er.*,
  c.name as city_name,
  up.first_name,
  up.last_name
FROM expense_requests er
LEFT JOIN cities c ON er.city_id = c.id
LEFT JOIN user_profiles up ON er.created_by = up.id
LIMIT 1;
```

### c) Si la consulta SQL funciona, ENTONCES escribir el código del servicio

---

## 4. ESCRIBIR EL SERVICIO

### a) Usar solo columnas que verificaste que existen
```javascript
// ✅ CORRECTO - Solo columnas verificadas
creator:user_profiles!expense_requests_created_by_fkey(
  id,
  first_name,
  last_name
)

// ❌ INCORRECTO - Columnas que no existen
creator:user_profiles!expense_requests_created_by_fkey(
  user_id,     // ❌ No existe, se llama 'id'
  first_name,
  last_name,
  email        // ❌ No existe en user_profiles, está en auth.users
)
```

### b) El nombre del constraint debe coincidir con la migración
```javascript
// Si en la migración se crea automáticamente como:
// expense_requests_created_by_fkey
// Entonces usar:
creator:user_profiles!expense_requests_created_by_fkey(...)
```

---

## 5. LOGS DE DEBUG DESDE EL INICIO

### a) Añadir logs ANTES de que falle
```javascript
async function list() {
  try {
    console.log('Service: Starting query...')
    const { data, error } = await query

    if (error) {
      console.error('Service: Query failed', error)
      throw error
    }

    console.log('Service: Query succeeded', { count: data?.length })
    return data
  } catch (error) {
    console.error('Service: Exception caught', error)
    throw error
  }
}
```

### b) No asumir que el catch silencioso funcionará
```javascript
// ❌ MAL - El error se pierde
try {
  await Promise.all([...])
} catch (error) {
  // Silencioso - no sabemos qué falló
}

// ✅ BIEN - Sabemos exactamente qué falló
try {
  console.log('Loading requests...')
  const requests = await ExpenseRequest.list()
  console.log('Requests loaded:', requests.length)

  console.log('Loading cities...')
  const cities = await City.list()
  console.log('Cities loaded:', cities.length)
} catch (error) {
  console.error('Failed loading data:', error)
  throw error
}
```

---

## 6. CHECKLIST ANTES DE COMMIT

- [ ] He verificado el schema de TODAS las tablas relacionadas en Supabase
- [ ] Los foreign keys apuntan a las tablas correctas
- [ ] He probado la migración SQL directamente en Supabase
- [ ] He probado un SELECT manual con JOINs antes de escribir código
- [ ] Solo selecciono columnas que sé que existen
- [ ] Los nombres de constraints coinciden entre migración y servicio
- [ ] He añadido logs de debug en puntos críticos
- [ ] He probado el código en desarrollo antes de enviar a producción

---

## 7. ERRORES COMUNES A EVITAR

### Error: "relation does not exist"
**Causa**: Foreign key apunta a tabla equivocada o constraint mal nombrado
**Solución**: Verificar que el FK apunte a la misma tabla usada en JOINs

### Error: "column does not exist"
**Causa**: Intentar seleccionar columnas que no existen en esa tabla
**Solución**: Verificar schema con `information_schema.columns`

### Error: "could not find relationship"
**Causa**: Nombre de constraint incorrecto en el JOIN de Supabase
**Solución**: Usar el nombre exacto del constraint creado (termina en _fkey)

### Error: Datos no se cargan pero no hay error
**Causa**: Fallo silencioso en Promise.all o catch sin logs
**Solución**: Añadir logs detallados en cada paso del proceso

---

## 8. PLANTILLA DE MIGRACIÓN SEGURA

```sql
-- ============================================================================
-- PASO 1: Verificar schema de tablas relacionadas
-- ============================================================================
-- Descomentar y ejecutar primero para verificar:
-- SELECT column_name, data_type FROM information_schema.columns
-- WHERE table_name = 'user_profiles';

-- ============================================================================
-- PASO 2: Crear tabla con foreign keys CORRECTOS
-- ============================================================================
CREATE TABLE nueva_tabla (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Campos básicos
  nombre TEXT NOT NULL,
  descripcion TEXT,

  -- Foreign keys - VERIFICAR que apuntan a tablas correctas
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE RESTRICT,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- PASO 3: Probar con SELECT antes de escribir código
-- ============================================================================
-- Descomentar y ejecutar para verificar JOINs:
-- SELECT nt.*, up.first_name, up.last_name, c.name as city_name
-- FROM nueva_tabla nt
-- LEFT JOIN user_profiles up ON nt.user_id = up.id
-- LEFT JOIN cities c ON nt.city_id = c.id
-- LIMIT 1;

-- ============================================================================
-- PASO 4: Crear índices
-- ============================================================================
CREATE INDEX idx_nueva_tabla_user_id ON nueva_tabla(user_id);
CREATE INDEX idx_nueva_tabla_city_id ON nueva_tabla(city_id);

-- ============================================================================
-- PASO 5: RLS Policies
-- ============================================================================
ALTER TABLE nueva_tabla ENABLE ROW LEVEL SECURITY;

-- Solo si la query de prueba del PASO 3 funcionó
```

---

## RESUMEN: Orden correcto de operaciones

1. ✅ Investigar schema existente (SQL queries)
2. ✅ Diseñar migración con FKs correctos
3. ✅ Ejecutar migración en Supabase
4. ✅ Probar SELECT manual con JOINs
5. ✅ Escribir servicio usando solo columnas verificadas
6. ✅ Añadir logs de debug
7. ✅ Probar en desarrollo
8. ✅ Commit y deploy

**NUNCA**:
- ❌ Asumir estructura de tablas sin verificar
- ❌ Escribir código antes de probar la migración
- ❌ Hacer JOINs con columnas no verificadas
- ❌ Confiar en catch silencioso sin logs
- ❌ Apuntar FKs a tablas diferentes de las usadas en JOINs

---

**Guardado**: 2025-11-01
**Contexto**: Error resuelto después de 3 migraciones fallidas por no seguir este procedimiento
