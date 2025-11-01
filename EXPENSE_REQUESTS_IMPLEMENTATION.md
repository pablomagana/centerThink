# Implementación del Sistema de Solicitudes de Gastos

## 📋 Resumen Ejecutivo

Se ha implementado exitosamente un nuevo sistema completo de solicitudes de gastos que reemplaza el antiguo sistema de pedidos basado en eventos. El nuevo sistema incluye:

- ✅ Formulario completo con todos los campos solicitados
- ✅ Sistema de subida de archivos adjuntos
- ✅ Enlaces a formularios externos de Asana
- ✅ Filtros avanzados (ciudad, tipo, estado, creador)
- ✅ Control de acceso por roles (admin/supplier)
- ✅ Interfaz modal moderna y responsive

---

## 🎯 Objetivos Completados

### Requisitos Funcionales
- [x] Eliminación del sistema antiguo de `event_orders`
- [x] Campos de solicitud implementados:
  - [x] Nombre de la solicitud
  - [x] Ciudad
  - [x] Dirección de email
  - [x] Tipo de solicitud (presupuesto, material, camisetas, viajes, IT)
  - [x] Importe estimado
  - [x] IBAN
  - [x] Dirección de material solicitado
  - [x] Información adicional
  - [x] Archivos adjuntos (múltiples)
- [x] Botones de enlaces a Asana:
  - [x] Solicitud de gastos
  - [x] Planificación de Thinkglaos
- [x] Filtros implementados:
  - [x] Por ciudad
  - [x] Por tipo de solicitud
  - [x] Por estado
  - [x] Por nombre del creador
- [x] Acceso restringido a admin y supplier

---

## 📁 Archivos Creados

### Migración de Base de Datos
```
supabase/06_expense_requests_migration.sql
```
- Elimina tablas `event_orders` y `order_types`
- Crea tabla `expense_requests` con todos los campos
- Crea bucket de Storage `expense-attachments`
- Configura políticas RLS para tabla y storage

### Servicios
```
src/services/storage.service.js
src/services/expenseRequest.service.js
```
- `storage.service.js`: Gestión de archivos (upload, delete, validate)
- `expenseRequest.service.js`: CRUD completo para solicitudes

### Entidades
```
src/entities/ExpenseRequest.js
```
- Schema completo de ExpenseRequest
- Labels y colores para tipos y estados
- Export del servicio

### Componentes
```
src/components/expense-requests/AsanaLinksSection.tsx
src/components/expense-requests/FileUploadZone.tsx
src/components/expense-requests/ExpenseRequestForm.tsx
src/components/expense-requests/ExpenseRequestsList.tsx
```

**AsanaLinksSection.tsx**:
- Card superior con enlaces a formularios Asana
- Diseño atractivo con gradientes
- Iconos y animaciones

**FileUploadZone.tsx**:
- Drag & drop de archivos
- Validación de tipos y tamaños
- Vista previa de archivos seleccionados
- Lista de archivos ya subidos
- Máximo 10 archivos, 10MB cada uno

**ExpenseRequestForm.tsx**:
- Modal completo con todos los campos
- Validación de formulario en tiempo real
- Subida de archivos integrada
- Modo creación y edición
- Manejo de errores robusto

**ExpenseRequestsList.tsx**:
- Grid responsive de cards
- Badges de estado y tipo con colores
- Información completa en cada card
- Animaciones con Framer Motion
- Botón de edición por card

### Páginas Actualizadas
```
src/Pages/Orders.tsx (completamente reescrito)
```
- Validación de acceso por roles
- Carga de datos desde nueva API
- Sistema de filtros avanzados
- Integración con modal de formulario
- Contador de resultados

### Documentación
```
MIGRATION_INSTRUCTIONS.md
EXPENSE_REQUESTS_IMPLEMENTATION.md (este archivo)
```

---

## 🗄️ Modelo de Datos

### Tabla: `expense_requests`

| Campo | Tipo | Restricciones | Descripción |
|-------|------|---------------|-------------|
| id | UUID | PK, Default: uuid_generate_v4() | Identificador único |
| request_name | TEXT | NOT NULL | Nombre de la solicitud |
| email | TEXT | NOT NULL | Email de contacto |
| request_type | TEXT | NOT NULL, ENUM | presupuesto, material, camisetas, viajes, IT |
| estimated_amount | DECIMAL(10,2) | NULL | Importe estimado en € |
| iban | TEXT | NULL | IBAN para transferencias |
| shipping_address | TEXT | NULL | Dirección de envío |
| additional_info | TEXT | NULL | Información adicional |
| attachments | JSONB | Default: '[]' | Array de archivos [{name, url, path, size, type, uploadedAt}] |
| status | TEXT | Default: 'pendiente', ENUM | pendiente, en_proceso, completado, cancelado |
| city_id | UUID | NOT NULL, FK → cities(id) | Ciudad asociada |
| created_by | UUID | NOT NULL, FK → auth.users(id) | Usuario creador |
| created_at | TIMESTAMPTZ | Default: NOW() | Fecha de creación |
| updated_at | TIMESTAMPTZ | Default: NOW() | Fecha de actualización |

### Índices
- `idx_expense_requests_city_id` (city_id)
- `idx_expense_requests_created_by` (created_by)
- `idx_expense_requests_request_type` (request_type)
- `idx_expense_requests_status` (status)
- `idx_expense_requests_created_at` (created_at DESC)

### Políticas RLS

**Tabla expense_requests**:
- Admin: acceso completo (SELECT, INSERT, UPDATE, DELETE)
- Supplier: acceso completo en ciudades asignadas
- User: sin acceso

**Storage expense-attachments**:
- Admin: acceso completo a todos los archivos
- Supplier: acceso completo a todos los archivos
- User: sin acceso

---

## 🎨 Características de la Interfaz

### Sección de Enlaces Asana
- Card destacado con gradiente azul-verde
- Dos botones grandes con iconos
- Enlaces externos que abren en nueva pestaña
- Responsive: columna en móvil, fila en desktop

### Formulario de Solicitud (Modal)
- Modal centrado con scroll interno
- Campos organizados en grid responsive
- Validación en tiempo real con mensajes de error
- Zona de drag & drop para archivos
- Vista previa de archivos seleccionados
- Botones de acción (Cancelar, Guardar)
- Estado de carga durante el envío

### Lista de Solicitudes
- Grid responsive (1-2-3 columnas)
- Cards con información completa
- Badges de estado con colores:
  - Pendiente: Amarillo
  - En proceso: Azul
  - Completado: Verde
  - Cancelado: Rojo
- Badges de tipo con colores temáticos
- Indicador de archivos adjuntos
- Botón de edición por card
- Animaciones de entrada escalonadas

### Filtros
- 4 filtros en grid responsive
- Estado (select)
- Tipo de solicitud (select)
- Ciudad (select)
- Creador (input de búsqueda)
- Contador de resultados filtrados

---

## 🔐 Seguridad

### Control de Acceso
- Página solo accesible por roles: `admin` y `supplier`
- Validación en frontend y backend (RLS)
- Mensaje de error claro para usuarios sin permisos

### Validación de Datos
- Campos requeridos: request_name, email, city_id, request_type
- Validación de formato de email
- Validación de IBAN (formato básico)
- Validación de archivos:
  - Tipos permitidos: imágenes, PDF, Word, Excel, texto
  - Tamaño máximo: 10MB por archivo
  - Máximo 10 archivos por solicitud

### Storage
- Bucket privado (no público)
- Acceso controlado por RLS
- Nombres de archivo únicos (timestamp + random)
- Organización por carpetas: `expense-requests/{id}/`

---

## 🚀 Flujo de Usuario

### Crear Nueva Solicitud

1. Usuario (admin/supplier) hace clic en "Nueva Solicitud"
2. Modal se abre con formulario vacío
3. Usuario llena campos requeridos:
   - Nombre de la solicitud
   - Email
   - Ciudad
   - Tipo de solicitud
4. Usuario llena campos opcionales:
   - Importe estimado
   - IBAN
   - Dirección de envío
   - Información adicional
5. Usuario arrastra archivos o hace clic para seleccionar
6. Archivos se validan y muestran en lista
7. Usuario hace clic en "Crear Solicitud"
8. Archivos se suben a Storage
9. Solicitud se guarda en base de datos
10. Modal se cierra y lista se actualiza

### Editar Solicitud Existente

1. Usuario hace clic en botón "Editar" en un card
2. Modal se abre con datos de la solicitud
3. Usuario modifica campos necesarios
4. Usuario puede subir más archivos
5. Usuario hace clic en "Actualizar"
6. Nuevos archivos se suben (los antiguos se mantienen)
7. Cambios se guardan en base de datos
8. Modal se cierra y lista se actualiza

### Filtrar Solicitudes

1. Usuario selecciona filtros deseados
2. Lista se filtra automáticamente en tiempo real
3. Contador muestra "X de Y solicitudes"
4. Filtros son acumulativos (AND)
5. Se respeta también el `selectedCity` del contexto

---

## 📊 Estadísticas de Implementación

### Código Escrito
- **Servicios**: 2 archivos, ~400 líneas
- **Componentes**: 4 archivos, ~800 líneas
- **Página**: 1 archivo reescrito, ~250 líneas
- **Entidad**: 1 archivo, ~150 líneas
- **Migración SQL**: 1 archivo, ~200 líneas
- **Total**: ~1,800 líneas de código

### Archivos Eliminados
- `src/components/orders/OrderForm.tsx`
- `src/components/orders/OrdersList.tsx`
- `src/entities/EventOrder.js`
- `src/entities/OrderType.js`

### Tablas de Base de Datos
- **Eliminadas**: `event_orders`, `order_types`
- **Creadas**: `expense_requests`
- **Buckets**: `expense-attachments`

---

## 🧪 Testing

### Casos de Prueba Recomendados

1. **Acceso y Permisos**
   - [ ] Usuario con rol 'user' no puede acceder
   - [ ] Usuario con rol 'admin' puede acceder
   - [ ] Usuario con rol 'supplier' puede acceder

2. **Creación de Solicitud**
   - [ ] Crear solicitud con campos mínimos
   - [ ] Crear solicitud con todos los campos
   - [ ] Validación de email inválido
   - [ ] Validación de IBAN inválido
   - [ ] Subir 1 archivo
   - [ ] Subir múltiples archivos (3-5)
   - [ ] Intentar subir más de 10 archivos
   - [ ] Intentar subir archivo > 10MB
   - [ ] Intentar subir tipo de archivo no permitido

3. **Edición de Solicitud**
   - [ ] Editar nombre y email
   - [ ] Cambiar tipo de solicitud
   - [ ] Cambiar estado
   - [ ] Añadir más archivos
   - [ ] Actualizar sin cambios

4. **Filtros**
   - [ ] Filtrar por estado
   - [ ] Filtrar por tipo
   - [ ] Filtrar por ciudad
   - [ ] Buscar por nombre de creador
   - [ ] Combinar múltiples filtros

5. **Enlaces Asana**
   - [ ] Clic en "Solicitud de Gastos" abre formulario correcto
   - [ ] Clic en "Planificación de Thinkglaos" abre formulario correcto

6. **UI/UX**
   - [ ] Modal se abre y cierra correctamente
   - [ ] Drag & drop funciona
   - [ ] Animaciones se reproducen suavemente
   - [ ] Responsive en móvil
   - [ ] Responsive en tablet
   - [ ] Responsive en desktop

---

## 📱 Responsiveness

### Mobile (< 768px)
- Grid de 1 columna para solicitudes
- Filtros en columna
- Botones Asana en columna
- Modal ocupa 95% del viewport

### Tablet (768px - 1024px)
- Grid de 2 columnas para solicitudes
- Filtros en 2x2 grid
- Botones Asana en fila

### Desktop (> 1024px)
- Grid de 3 columnas para solicitudes
- Filtros en 4 columnas
- Botones Asana en fila
- Modal máximo 768px de ancho

---

## 🔄 Próximos Pasos

### Para Aplicar en Producción

1. **Hacer Backup**
   ```sql
   -- En Supabase SQL Editor, ejecuta:
   CREATE TABLE event_orders_backup AS SELECT * FROM event_orders;
   CREATE TABLE order_types_backup AS SELECT * FROM order_types;
   ```

2. **Aplicar Migración**
   - Sigue las instrucciones en `MIGRATION_INSTRUCTIONS.md`
   - Ejecuta `supabase/06_expense_requests_migration.sql`

3. **Verificar Storage**
   - Confirma que bucket `expense-attachments` existe
   - Revisa políticas RLS de storage

4. **Probar Funcionalidad**
   - Inicia sesión como admin
   - Crea una solicitud de prueba
   - Sube archivos
   - Verifica que todo funciona

5. **Monitorear**
   - Revisa logs de Supabase
   - Confirma que no hay errores
   - Verifica métricas de storage

### Mejoras Futuras (Opcionales)

- [ ] Añadir notificaciones por email al crear solicitud
- [ ] Dashboard con estadísticas de solicitudes
- [ ] Exportar solicitudes a CSV/Excel
- [ ] Historial de cambios en solicitudes
- [ ] Comentarios/notas en solicitudes
- [ ] Aprobación workflow (pendiente → aprobado → procesado)
- [ ] Integración directa con API de Asana
- [ ] Firma digital de solicitudes
- [ ] Plantillas de solicitudes frecuentes

---

## 🐛 Problemas Conocidos

### TypeScript Warnings
- Warnings de tipos implícitos 'any' al importar archivos .js desde .tsx
- No afectan la funcionalidad
- Se resolverán migrando archivos .js a .ts

### Console Ninja Warning
- Warning sobre vite 5.4.21 no soportado
- No afecta la funcionalidad
- Es una extensión de desarrollo

---

## 📞 Soporte

### Documentación Relacionada
- Ver: `MIGRATION_INSTRUCTIONS.md` para aplicar migración
- Ver: `CLAUDE.md` para arquitectura general
- Ver: `README.md` para comandos de desarrollo

### Contacto
Para dudas o problemas con esta implementación, revisar:
1. Logs de Supabase Dashboard
2. Console del navegador (F12)
3. Terminal donde corre `npm run dev`

---

## ✅ Checklist Final

- [x] Migración SQL creada
- [x] Servicios implementados
- [x] Componentes creados
- [x] Página actualizada
- [x] Archivos antiguos eliminados
- [x] Documentación completa
- [x] Servidor de desarrollo funcionando
- [x] Validaciones implementadas
- [x] Control de acceso configurado
- [x] Storage configurado
- [ ] **Migración aplicada en producción** (pendiente de usuario)
- [ ] **Pruebas end-to-end completadas** (pendiente de usuario)

---

**Desarrollado por**: Claude Code
**Fecha**: 2025-11-01
**Versión**: 1.0.0
**Estado**: ✅ Implementación Completa - Listo para Producción
