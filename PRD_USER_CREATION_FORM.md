# PRD: Formulario de Creación de Usuarios

## 1. Resumen Ejecutivo

### Problema Actual
Actualmente, la pantalla de usuarios muestra un modal informativo que explica cómo invitar usuarios a través del panel de administración de Supabase (fuera de la aplicación). Este flujo requiere que los administradores salgan de la aplicación, lo que resulta en:
- Fricción en el proceso de creación de usuarios
- Experiencia discontinua para los administradores
- Imposibilidad de asignar rol y ciudades durante la invitación inicial

### Solución Propuesta
Reemplazar el modal informativo con un formulario completo de creación de usuarios que permita:
- Crear usuarios directamente desde la aplicación
- Asignar rol (admin, user, supplier) durante la creación
- Asignar una o múltiples ciudades al usuario
- Mantener consistencia visual con el resto de la aplicación

---

## 2. Objetivos

### Objetivos Primarios
1. ✅ Eliminar dependencia del panel externo de Supabase para crear usuarios
2. ✅ Permitir asignación de rol y ciudades durante la creación inicial
3. ✅ Mejorar la experiencia del administrador con un flujo unificado
4. ✅ Mantener coherencia visual con componentes existentes (EventForm, UserForm)

### Objetivos Secundarios
1. ✅ Validación de campos en tiempo real
2. ✅ Feedback claro de errores (ej: email ya existe)
3. ✅ Actualización automática de la lista tras creación exitosa

---

## 3. Contexto Técnico

### 3.1 Estado Actual

**Componentes Involucrados:**
- `src/Pages/Users.tsx` - Página principal de usuarios
- `src/components/users/UserForm.tsx` - Formulario de EDICIÓN (no creación)
- `src/components/users/UsersList.tsx` - Lista de usuarios
- `src/components/ui/dialog.jsx` - Modal actual con instrucciones

**Flujo Actual:**
1. Usuario admin hace clic en botón "¿Cómo Invitar?"
2. Se muestra modal con instrucciones para usar Supabase Admin
3. Usuario debe salir de la app y usar panel externo
4. Tras aceptación de invitación, el usuario aparece en la lista

**Arquitectura de Autenticación:**
- Supabase Auth para autenticación
- Tabla `user_profiles` para datos adicionales (first_name, last_name, role, cities, phone)
- Service: `src/services/user.service.js`
- Context: `src/contexts/AuthContext.jsx`

### 3.2 Entidades Relacionadas

**UserSchema (`src/entities/User.js`):**
```javascript
{
  first_name: string (required),
  last_name: string (required),
  role: enum ["admin", "user", "supplier"],
  cities: array of string IDs,
  phone: string
}
```

**Roles:**
- `admin` - Acceso total a todas las funcionalidades
- `user` - Usuario operativo estándar (sin acceso a Users/Cities)
- `supplier` - Rol intermedio con acceso a usuarios y ciudades

---

## 4. Especificación Funcional

### 4.1 Cambios en la UI

#### Botón Principal
**Actual:** Botón "¿Cómo Invitar?" (outline, con icono HelpCircle)
**Nuevo:** Botón "Crear Usuario" (gradiente, con icono UserPlus)

```tsx
// Ubicación: src/Pages/Users.tsx línea 86-93
<Button
  onClick={() => setShowUserCreateDialog(true)}
  className="bg-gradient-to-r from-blue-600 to-indigo-600
             hover:from-blue-700 hover:to-indigo-700
             shadow-lg h-12 px-8 text-base"
>
  <UserPlus className="w-5 h-5 mr-2" />
  Crear Usuario
</Button>
```

#### Modal de Creación

**Estructura del Dialog:**
```tsx
<Dialog open={showUserCreateDialog} onOpenChange={setShowUserCreateDialog}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle>Crear Nuevo Usuario</DialogTitle>
      <DialogDescription>
        Completa los datos para crear un nuevo usuario.
        Se enviará un email de invitación automáticamente.
      </DialogDescription>
    </DialogHeader>

    {/* Formulario aquí */}

  </DialogContent>
</Dialog>
```

### 4.2 Campos del Formulario

#### Layout
Grid de 2 columnas en desktop, 1 columna en mobile (igual que EventForm y UserForm edit)

#### Campos Requeridos

| Campo | Tipo | Validación | Placeholder |
|-------|------|------------|-------------|
| **Email*** | Input (type="email") | Email válido, único | usuario@ejemplo.com |
| **Nombre*** | Input (text) | Min 2 caracteres | Juan |
| **Apellidos*** | Input (text) | Min 2 caracteres | García López |
| **Rol*** | Select | Uno de: admin, user, supplier | Seleccionar rol... |

#### Campos Opcionales

| Campo | Tipo | Nota |
|-------|------|------|
| **Teléfono** | Input (tel) | Formato libre |
| **Ciudades** | Multi-select (Popover + Command) | Igual que UserForm edición |

#### Selector de Ciudades
Reutilizar el mismo componente de selección múltiple que usa `UserForm.tsx` (líneas 107-147):
- Popover con trigger mostrando badges de ciudades seleccionadas
- Command con búsqueda
- Checkmarks en ciudades seleccionadas
- Puede estar vacío (sin ciudades asignadas)

#### Selector de Rol

```tsx
<Select
  value={formData.role}
  onValueChange={(value) => handleInputChange("role", value)}
  required
>
  <SelectTrigger className="h-12 px-4">
    <SelectValue placeholder="Seleccionar rol..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="user">
      <div className="flex items-center gap-2">
        <Badge className="bg-blue-100 text-blue-700">Usuario</Badge>
        <span className="text-sm text-slate-500">- Acceso operativo</span>
      </div>
    </SelectItem>
    <SelectItem value="supplier">
      <div className="flex items-center gap-2">
        <Badge className="bg-purple-100 text-purple-700">Suministrador</Badge>
        <span className="text-sm text-slate-500">- Gestiona usuarios/ciudades</span>
      </div>
    </SelectItem>
    <SelectItem value="admin">
      <div className="flex items-center gap-2">
        <Badge className="bg-red-100 text-red-700">Admin</Badge>
        <span className="text-sm text-slate-500">- Acceso total</span>
      </div>
    </SelectItem>
  </SelectContent>
</Select>
```

### 4.3 Comportamiento del Formulario

#### Estado Inicial
```tsx
const [formData, setFormData] = useState({
  email: "",
  first_name: "",
  last_name: "",
  role: "user", // valor por defecto
  phone: "",
  cities: []
});
```

#### Validaciones

**Client-side:**
1. Email: formato válido (HTML5 validation)
2. Nombre/Apellidos: no vacíos (required)
3. Rol: uno de los valores permitidos (required)
4. Ciudades: array válido (puede estar vacío)

**Server-side (esperadas del backend):**
1. Email único (no existe en auth.users)
2. Email entregable (no bounced)

#### Flujo de Envío

1. **User clicks "Crear Usuario"**
   - Validación client-side
   - Deshabilitar botón submit
   - Mostrar spinner en botón

2. **API Call**
   ```tsx
   // Pseudo-código del handler
   const handleSubmit = async (e) => {
     e.preventDefault();
     setIsSubmitting(true);
     setError(null);

     try {
       // 1. Crear usuario en Supabase Auth (envía email automáticamente)
       await authService.inviteUser(formData.email);

       // 2. Crear perfil en user_profiles
       await base44.entities.User.create({
         email: formData.email,
         first_name: formData.first_name,
         last_name: formData.last_name,
         role: formData.role,
         cities: formData.cities,
         phone: formData.phone || null
       });

       // 3. Feedback y cierre
       toast.success("Usuario creado exitosamente. Email de invitación enviado.");
       setShowUserCreateDialog(false);
       loadData(); // Recargar lista de usuarios

     } catch (error) {
       console.error("Error creating user:", error);
       setError(error.message || "Error al crear el usuario");
     } finally {
       setIsSubmitting(false);
     }
   };
   ```

3. **Success State**
   - Mostrar toast de éxito
   - Cerrar modal
   - Refrescar lista de usuarios
   - Reset del formulario

4. **Error Handling**
   - Mostrar error en modal (no cerrar)
   - Mensajes específicos:
     - "Email ya registrado"
     - "Error de conexión"
     - "Permisos insuficientes"
   - Mantener datos del formulario
   - Re-habilitar botón submit

---

## 5. Cambios en Backend / Servicios

### 5.1 Nuevo Método en authService

**Archivo:** `src/services/auth.service.js` (o crear si no existe)

```javascript
import { supabase } from '@/lib/supabase';

export const authService = {
  // ... métodos existentes ...

  /**
   * Invita a un nuevo usuario enviándole un email
   * Requiere permisos de admin en Supabase
   * @param {string} email - Email del usuario a invitar
   * @returns {Promise<{user: object}>}
   */
  async inviteUser(email) {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
};
```

⚠️ **IMPORTANTE:** Este método requiere configuración en Supabase:
- Row Level Security (RLS) policies en `user_profiles`
- Service role key (NO debe estar en frontend)
- Alternativamente: Edge Function para manejar creación

### 5.2 Alternativa: Edge Function (Recomendado)

Si `supabase.auth.admin` no está disponible desde el cliente, crear una Edge Function:

**Archivo:** `supabase/functions/invite-user/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  try {
    const { email, first_name, last_name, role, cities, phone } = await req.json()

    // Obtener usuario actual (quien está creando)
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) throw new Error('Unauthorized')

    // Obtener perfil del creador
    const { data: creatorProfile } = await supabase
      .from('user_profiles')
      .select('role, cities')
      .eq('id', user.id)
      .single()

    if (!creatorProfile || !['admin', 'supplier'].includes(creatorProfile.role)) {
      throw new Error('Insufficient permissions')
    }

    // Validar que supplier solo cree usuarios en sus ciudades
    if (creatorProfile.role === 'supplier') {
      const invalidCities = cities.filter(c => !creatorProfile.cities.includes(c))
      if (invalidCities.length > 0) {
        throw new Error('Supplier can only create users in their assigned cities')
      }
    }

    // Usar service role key para operaciones admin
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Crear usuario con contraseña temporal autogenerada
    const tempPassword = generateSecurePassword() // función helper
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin
      .createUser({
        email,
        password: tempPassword,
        email_confirm: true, // Email confirmado automáticamente
        user_metadata: { first_name, last_name }
      })

    if (authError) throw authError

    // 2. Enviar email con contraseña temporal
    // Supabase NO envía email automático con createUser + password
    // Necesitamos configurar un email template o usar servicio externo
    // Por ahora, devolvemos la contraseña al admin para que la comunique

    // 2. Crear perfil
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email,
        first_name,
        last_name,
        role,
        cities,
        phone
      })
      .select()
      .single()

    if (profileError) throw profileError

    return new Response(
      JSON.stringify({ user: profileData }),
      { headers: { "Content-Type": "application/json" } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    )
  }
})
```

**Llamada desde el frontend:**
```javascript
const response = await supabase.functions.invoke('invite-user', {
  body: {
    email: formData.email,
    first_name: formData.first_name,
    last_name: formData.last_name,
    role: formData.role,
    cities: formData.cities,
    phone: formData.phone
  }
});
```

---

## 6. Consideraciones de Seguridad

### 6.1 Autenticación y Autorización

**Validación de Permisos:**
- Usuarios con `role: "admin"` pueden crear usuarios en cualquier ciudad
- Usuarios con `role: "supplier"` pueden crear usuarios SOLO en sus ciudades asignadas
- Verificar en el backend (RLS o Edge Function)
- Frontend filtra selector de ciudades según rol del creador

**RLS Policies Sugeridas:**
```sql
-- Permitir a admins y suppliers crear user_profiles
CREATE POLICY "Admins and suppliers can insert user profiles"
ON user_profiles FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'supplier')
  )
);

-- Nota: La validación de ciudades para suppliers se hace en la Edge Function
```

### 6.2 Validación de Email

**Prevención de Spam:**
- Rate limiting en Edge Function (ej: max 10 invitaciones/hora por admin)
- Validación de formato de email en backend
- Lista negra de dominios temporales (opcional)

**Uniqueness:**
- Supabase Auth ya maneja unicidad de email
- Mostrar error claro si email existe

---

## 7. Diseño Visual

### 7.1 Estilos y Componentes

**Reutilizar patrones existentes:**
- Card con gradient header (from-blue-50 to-indigo-50)
- Inputs con h-12 px-4
- Botones con gradientes blue-to-indigo
- Labels con component de shadcn/ui
- Spacing y grid system de EventForm

### 7.2 Responsive Design

```tsx
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
  {/* Email - Full width en todos los tamaños */}
  <div className="space-y-2 lg:col-span-2">
    <Label htmlFor="email">Email *</Label>
    <Input id="email" type="email" {...} />
  </div>

  {/* Nombre y Apellidos - 2 columnas en desktop */}
  <div className="space-y-2">
    <Label htmlFor="first_name">Nombre *</Label>
    <Input id="first_name" {...} />
  </div>

  <div className="space-y-2">
    <Label htmlFor="last_name">Apellidos *</Label>
    <Input id="last_name" {...} />
  </div>

  {/* Rol y Teléfono - 2 columnas en desktop */}
  <div className="space-y-2">
    <Label htmlFor="role">Rol *</Label>
    <Select {...} />
  </div>

  <div className="space-y-2">
    <Label htmlFor="phone">Teléfono</Label>
    <Input id="phone" type="tel" {...} />
  </div>

  {/* Ciudades - Full width */}
  <div className="space-y-2 lg:col-span-2">
    <Label>Ciudades Asignadas</Label>
    <Popover>{/* Multi-select */}</Popover>
  </div>
</div>
```

### 7.3 Estados de Botón Submit

```tsx
<Button
  type="submit"
  disabled={isSubmitting}
  className="bg-gradient-to-r from-blue-600 to-indigo-600
             hover:from-blue-700 hover:to-indigo-700
             h-12 px-8 text-base"
>
  {isSubmitting ? (
    <>
      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      Creando Usuario...
    </>
  ) : (
    <>
      <Save className="w-4 h-4 mr-2" />
      Crear Usuario
    </>
  )}
</Button>
```

---

## 8. Testing y Validación

### 8.1 Casos de Prueba

**Funcionales:**
- [ ] TC001: Crear usuario con todos los campos completos
- [ ] TC002: Crear usuario solo con campos requeridos (sin phone, sin cities)
- [ ] TC003: Validar que email duplicado muestra error
- [ ] TC004: Validar formato de email inválido
- [ ] TC005: Verificar que usuario aparece en lista tras creación
- [ ] TC006: Verificar que se envía email de invitación
- [ ] TC007: Crear usuario con rol "admin"
- [ ] TC008: Crear usuario con rol "user"
- [ ] TC009: Crear usuario con rol "supplier"
- [ ] TC010: Asignar múltiples ciudades
- [ ] TC011: No asignar ciudades (array vacío)

**UI/UX:**
- [ ] TC012: Modal se cierra al hacer clic en "Cancelar"
- [ ] TC013: Modal se cierra al hacer clic fuera (backdrop)
- [ ] TC014: Formulario se resetea después de creación exitosa
- [ ] TC015: Errores se muestran claramente en el formulario
- [ ] TC016: Botón submit se deshabilita durante envío
- [ ] TC017: Responsive en mobile y tablet

**Seguridad:**
- [ ] TC018: Usuario sin rol admin NO puede acceder al formulario
- [ ] TC019: Llamadas directas a API sin auth fallan
- [ ] TC020: No se puede crear usuario con rol superior al propio

---

## 9. Plan de Implementación

### Fase 1: Setup Backend (Crítico)
**Estimación:** 2-3 horas
- [ ] Crear Edge Function `invite-user` en Supabase
- [ ] Configurar RLS policies en `user_profiles`
- [ ] Configurar variables de entorno (service role key)
- [ ] Testear Edge Function con Postman/curl

### Fase 2: Componente de Formulario
**Estimación:** 3-4 horas
- [ ] Crear componente `UserCreateForm.tsx` en `src/components/users/`
- [ ] Implementar estado del formulario
- [ ] Integrar selector de ciudades (copiar de UserForm)
- [ ] Implementar selector de rol con badges
- [ ] Añadir validaciones client-side
- [ ] Estilizar siguiendo EventForm pattern

### Fase 3: Integración en Users Page
**Estimación:** 1-2 horas
- [ ] Modificar `Users.tsx`: cambiar botón y estado del dialog
- [ ] Implementar handler de submit con llamada a Edge Function
- [ ] Añadir manejo de errores y feedback
- [ ] Integrar toast notifications
- [ ] Actualizar lista tras creación exitosa

### Fase 4: Testing y Refinamiento
**Estimación:** 2-3 horas
- [ ] Testing funcional completo (todos los TCs)
- [ ] Testing responsive
- [ ] Testing de errores y edge cases
- [ ] Ajustes de UX basados en feedback
- [ ] Documentación de código

### Fase 5: Deployment
**Estimación:** 1 hora
- [ ] Deploy Edge Function a Supabase production
- [ ] Verificar variables de entorno en producción
- [ ] Deploy frontend
- [ ] Smoke testing en producción
- [ ] Monitoreo de errores (primeras 24h)

**Total Estimado:** 9-13 horas

---

## 10. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Service role key expuesta en frontend | Baja | Crítico | Usar Edge Function exclusivamente |
| Rate limiting de emails de Supabase | Media | Alto | Implementar rate limiting propio + feedback al admin |
| Usuario acepta invitación pero perfil no existe | Baja | Alto | Transacción atómica en Edge Function |
| Conflicto de sincronización auth.users vs user_profiles | Media | Alto | Usar `auth.user.id` como FK en `user_profiles.id` |
| Admin puede crear otro admin sin permiso | Media | Medio | Validar en backend: solo admin puede crear admin |

---

## 11. Métricas de Éxito

### KPIs
- **Tiempo de creación de usuario:** < 30 segundos desde abrir modal hasta confirmación
- **Tasa de éxito:** > 95% de invitaciones enviadas correctamente
- **Tasa de aceptación:** > 80% de usuarios invitados completan setup (a 7 días)
- **Feedback del usuario:** 0 quejas sobre proceso de creación en primeros 30 días

### Monitoreo
- Logs de errores en Edge Function
- Número de invitaciones enviadas por admin por día
- Tiempo promedio de respuesta de Edge Function

---

## 12. Decisiones de Producto (APROBADAS)

### ✅ Respuestas a Preguntas Abiertas:

1. **¿Debe el administrador poder establecer una contraseña temporal?**
   - **DECISIÓN:** El usuario debe recibir un email con contraseña temporal generada automáticamente
   - **Implementación:** Usar `auth.admin.createUser()` con `email_confirm: true` y contraseña autogenerada
   - El usuario recibirá el email con credenciales de acceso inmediato

2. **¿Qué pasa si el usuario ya existe en auth.users pero no tiene perfil?**
   - **DECISIÓN:** Al crear un usuario, siempre se crea el perfil al mismo tiempo (operación atómica)
   - **Implementación:** La Edge Function crea ambos en una transacción
   - Si el email ya existe, mostrar error "Email ya registrado"

3. **¿Se debe notificar al usuario creado por otros canales (SMS, Slack)?**
   - **DECISIÓN:** De momento NO implementar notificaciones adicionales
   - Solo el email estándar de Supabase con las credenciales
   - Posible mejora futura

4. **¿El rol "supplier" debe poder crear usuarios?**
   - **DECISIÓN:** SÍ, el rol Supplier puede crear usuarios SOLO en las ciudades en las que está asignado
   - **Implementación:**
     - Validar en backend que el supplier está asignado a las ciudades del nuevo usuario
     - UI: Filtrar selector de ciudades para suppliers (solo mostrar sus ciudades asignadas)
     - Admin puede crear usuarios en cualquier ciudad

5. **¿Se debe mantener el botón "¿Cómo Invitar?" como opción secundaria?**
   - **DECISIÓN:** Eliminar completamente el botón y modal de ayuda actual
   - Reemplazar por el botón "Crear Usuario" con formulario completo

---

## 13. Referencias

### Documentación
- [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-inviteuser)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [shadcn/ui Dialog](https://ui.shadcn.com/docs/components/dialog)
- [shadcn/ui Select](https://ui.shadcn.com/docs/components/select)

### Archivos del Proyecto
- `src/Pages/Users.tsx` - Página principal
- `src/components/users/UserForm.tsx` - Referencia para estilos
- `src/components/events/EventForm.tsx` - Referencia para layout
- `src/entities/User.js` - Schema de usuario
- `src/services/user.service.js` - Servicio de usuarios
- `CLAUDE.md` - Documentación del proyecto

---

## 14. Changelog del Documento

| Fecha | Versión | Autor | Cambios |
|-------|---------|-------|---------|
| 2025-10-23 | 1.0 | Claude | Creación inicial del PRD |

---

## Aprobaciones

- [ ] Product Owner / Usuario Solicitante
- [ ] Tech Lead / Arquitecto
- [ ] DevOps (para Edge Functions)
- [ ] QA Lead

**Notas de Aprobación:**
_Espacio para comentarios del equipo antes de iniciar implementación_
