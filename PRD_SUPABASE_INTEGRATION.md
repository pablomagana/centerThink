# PRD: Integración con Supabase para centerThink

## 1. Resumen Ejecutivo

Migrar el proyecto centerThink de un cliente API genérico (Base44) a Supabase como backend, aprovechando su autenticación integrada, base de datos PostgreSQL, y cliente JavaScript optimizado.

## 2. Objetivos

### Objetivos Principales
- Reemplazar el cliente API `base44Client.js` por el cliente de Supabase
- Implementar autenticación de usuarios con Supabase Auth
- Crear las tablas necesarias en PostgreSQL vía Supabase
- Mantener toda la funcionalidad existente del frontend

### Objetivos Secundarios
- Implementar Row Level Security (RLS) para seguridad de datos
- Configurar políticas de acceso basadas en roles (admin/user)
- Agregar sincronización en tiempo real (opcional)

## 3. Alcance del Proyecto

### En Alcance (In Scope)

#### 3.1 Backend - Supabase
- Creación de 7 tablas en PostgreSQL
- Configuración de relaciones entre tablas
- Implementación de RLS policies
- Setup de autenticación
- Configuración de roles y permisos

#### 3.2 Frontend - Cliente Supabase
- Instalación de `@supabase/supabase-js`
- Reemplazo de `base44Client.js` por `supabaseClient.js`
- Actualización de todas las entidades para usar Supabase
- Implementación de auth flow (login/logout)
- Gestión de sesión de usuario

#### 3.3 Funcionalidades
- CRUD completo para todas las entidades
- Sistema de autenticación
- Filtrado por ciudad activa
- Gestión de permisos por rol

### Fuera de Alcance (Out of Scope)
- Migraciones de datos existentes
- Integración con servicios externos
- Notificaciones push
- Exportación de datos

## 4. Especificaciones Técnicas

### 4.1 Esquema de Base de Datos

#### Tabla: `cities`
```sql
CREATE TABLE cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `speakers`
```sql
CREATE TABLE speakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  instagram TEXT,
  bio TEXT,
  contact_status TEXT DEFAULT 'no_contactado' CHECK (contact_status IN ('no_contactado', 'contactado', 'seguimiento')),
  proposal_status TEXT DEFAULT 'sin_propuesta' CHECK (proposal_status IN ('sin_propuesta', 'propuesta_enviada', 'confirmado', 'rechazado')),
  proposal_confirmation_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `venues`
```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  capacity INTEGER,
  contact_name TEXT,
  contact_phone TEXT,
  contact_email TEXT,
  notes TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `order_types`
```sql
CREATE TABLE order_types (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'media' CHECK (priority IN ('alta', 'media', 'baja')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `events`
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT,
  description TEXT,
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  speaker_id UUID REFERENCES speakers(id) ON DELETE SET NULL,
  venue_id UUID REFERENCES venues(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'planificacion' CHECK (status IN ('planificacion', 'confirmado', 'completado', 'cancelado')),
  max_attendees INTEGER,
  preparations JSONB DEFAULT '{
    "presentation_video": "pendiente",
    "poster_image": "pendiente",
    "theme": "pendiente",
    "transport": "pendiente",
    "accommodation": "pendiente"
  }'::jsonb,
  confirmed_volunteers JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `event_orders`
```sql
CREATE TABLE event_orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  order_type_id UUID NOT NULL REFERENCES order_types(id) ON DELETE RESTRICT,
  responsible_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  due_date DATE,
  notes TEXT,
  completion_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Tabla: `user_profiles`
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  cities UUID[] DEFAULT '{}',
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 Row Level Security (RLS) Policies

#### Cities - Políticas
```sql
-- Lectura: todos los usuarios autenticados
CREATE POLICY "Cities are viewable by authenticated users"
  ON cities FOR SELECT
  TO authenticated
  USING (true);

-- Escritura: solo admins
CREATE POLICY "Cities are editable by admins"
  ON cities FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
```

#### Speakers - Políticas
```sql
-- Lectura: todos los usuarios autenticados
CREATE POLICY "Speakers are viewable by authenticated users"
  ON speakers FOR SELECT
  TO authenticated
  USING (true);

-- Escritura: solo admins
CREATE POLICY "Speakers are editable by admins"
  ON speakers FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
```

#### Venues - Políticas
```sql
-- Lectura: todos los usuarios autenticados
CREATE POLICY "Venues are viewable by authenticated users"
  ON venues FOR SELECT
  TO authenticated
  USING (true);

-- Escritura: solo admins
CREATE POLICY "Venues are editable by admins"
  ON venues FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
```

#### Events - Políticas
```sql
-- Lectura: usuarios ven eventos de sus ciudades
CREATE POLICY "Events are viewable by users in their cities"
  ON events FOR SELECT
  TO authenticated
  USING (
    city_id = ANY(
      SELECT unnest(cities) FROM user_profiles
      WHERE user_profiles.id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

-- Escritura: todos los usuarios autenticados pueden crear/editar
CREATE POLICY "Events are editable by authenticated users"
  ON events FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

#### Event Orders - Políticas
```sql
-- Lectura: usuarios ven órdenes de sus ciudades
CREATE POLICY "Event orders are viewable by users"
  ON event_orders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM events
      WHERE events.id = event_orders.event_id
      AND (
        events.city_id = ANY(
          SELECT unnest(cities) FROM user_profiles
          WHERE user_profiles.id = auth.uid()
        )
        OR EXISTS (
          SELECT 1 FROM user_profiles
          WHERE user_profiles.id = auth.uid()
          AND user_profiles.role = 'admin'
        )
      )
    )
  );

-- Escritura: usuarios autenticados
CREATE POLICY "Event orders are editable by authenticated users"
  ON event_orders FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
```

#### User Profiles - Políticas
```sql
-- Lectura: usuarios ven su propio perfil, admins ven todos
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

-- Escritura: solo admins
CREATE POLICY "User profiles are editable by admins"
  ON user_profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );
```

### 4.3 Estructura de Archivos del Cliente

```
src/
├── lib/
│   └── supabase.js              # Cliente Supabase configurado
├── services/
│   ├── auth.service.js          # Servicios de autenticación
│   ├── city.service.js          # CRUD de ciudades
│   ├── speaker.service.js       # CRUD de ponentes
│   ├── venue.service.js         # CRUD de locales
│   ├── event.service.js         # CRUD de eventos
│   ├── eventOrder.service.js    # CRUD de órdenes
│   └── user.service.js          # CRUD de usuarios
├── entities/                    # Mantener esquemas existentes
└── contexts/
    └── AuthContext.jsx          # Contexto de autenticación
```

### 4.4 Implementación del Cliente Supabase

#### `src/lib/supabase.js`
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

#### `src/services/auth.service.js`
```javascript
import { supabase } from '@/lib/supabase'

export const authService = {
  async signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getCurrentProfile() {
    const user = await this.getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return { ...user, ...data }
  },

  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
```

#### `src/services/city.service.js`
```javascript
import { supabase } from '@/lib/supabase'

export const cityService = {
  async list(sortOrder = null) {
    let query = supabase
      .from('cities')
      .select('*')

    if (sortOrder) {
      const desc = sortOrder.startsWith('-')
      const field = sortOrder.replace('-', '')
      query = query.order(field, { ascending: !desc })
    }

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async get(id) {
    const { data, error } = await supabase
      .from('cities')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  async create(cityData) {
    const { data, error } = await supabase
      .from('cities')
      .insert([cityData])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, cityData) {
    const { data, error } = await supabase
      .from('cities')
      .update(cityData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('cities')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}
```

### 4.5 Variables de Entorno

#### `.env`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### `.env.example`
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## 5. Plan de Implementación

### Fase 1: Setup de Supabase (Día 1)
1. Crear proyecto en Supabase
2. Ejecutar scripts SQL para crear tablas
3. Configurar RLS policies
4. Crear usuario admin inicial
5. Obtener credenciales (URL + anon key)

### Fase 2: Cliente Frontend (Día 2)
1. Instalar `@supabase/supabase-js`
2. Crear `src/lib/supabase.js`
3. Implementar servicios (auth, city, speaker, venue, event, etc.)
4. Crear AuthContext
5. Actualizar variables de entorno

### Fase 3: Actualizar Entidades (Día 2)
1. Modificar cada archivo en `src/entities/` para usar servicios
2. Mantener exports de esquemas para validación
3. Testing de CRUD operations

### Fase 4: Implementar Autenticación (Día 3)
1. Crear LoginPage
2. Implementar AuthContext en App.jsx
3. Proteger rutas
4. Actualizar AppContextProvider para usar authService
5. Testing de login/logout

### Fase 5: Testing y Ajustes (Día 3-4)
1. Testing de todas las páginas
2. Verificar filtros por ciudad
3. Testing de permisos por rol
4. Ajustes de UI
5. Documentación

## 6. Dependencias

### NPM Packages
```json
{
  "@supabase/supabase-js": "^2.39.0"
}
```

### Servicios Externos
- Cuenta en Supabase (gratis hasta 500MB)
- PostgreSQL 15+ (incluido en Supabase)

## 7. Criterios de Éxito

### Must Have
- ✅ Todas las tablas creadas y funcionando
- ✅ Autenticación funcional
- ✅ CRUD completo para todas las entidades
- ✅ RLS configurado correctamente
- ✅ Filtrado por ciudad funcionando

### Should Have
- ✅ Roles admin/user implementados
- ✅ Manejo de errores robusto
- ✅ Loading states en todas las operaciones

### Nice to Have
- Sincronización en tiempo real
- Optimistic UI updates
- Caché de datos
- Exportación de datos

## 8. Riesgos y Mitigaciones

### Riesgo 1: Límites de Supabase Free Tier
- **Impacto**: Alto
- **Probabilidad**: Media
- **Mitigación**: Monitorear uso, optimizar queries, considerar upgrade si necesario

### Riesgo 2: Complejidad de RLS
- **Impacto**: Medio
- **Probabilidad**: Media
- **Mitigación**: Testing exhaustivo de permisos, documentación clara

### Riesgo 3: Migración de datos
- **Impacto**: Bajo (no hay datos existentes)
- **Probabilidad**: Baja
- **Mitigación**: N/A

## 9. Documentación Requerida

1. README actualizado con setup de Supabase
2. Guía de configuración de variables de entorno
3. Scripts SQL documentados
4. Guía de permisos y roles
5. Troubleshooting común

## 10. Próximos Pasos

1. **Revisar y aprobar este PRD**
2. **Crear cuenta en Supabase**
3. **Ejecutar Fase 1: Setup de Supabase**
4. **Comenzar implementación del cliente**

---

**Fecha de Creación**: 2025-10-22
**Versión**: 1.0
**Autor**: Claude Code
**Estado**: Pendiente de Aprobación
