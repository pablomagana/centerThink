# Instrucciones para Aplicar la Migración de Expense Requests

## 📋 Resumen

Esta migración reemplaza el sistema antiguo de `event_orders` y `order_types` con el nuevo sistema de solicitudes de gastos (`expense_requests`).

**IMPORTANTE**: Esta migración eliminará las tablas `event_orders` y `order_types` y todos sus datos. Asegúrate de hacer un backup antes de proceder.

---

## 🚀 Pasos para Aplicar la Migración

### Opción 1: Aplicar desde Supabase Dashboard (Recomendado)

1. **Accede a tu proyecto Supabase**:
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto: `lzqhfgeduchvizykaqih`

2. **Abre el SQL Editor**:
   - En el menú lateral, haz clic en "SQL Editor"

3. **Crea una nueva consulta**:
   - Haz clic en "New query"

4. **Copia y pega el contenido de la migración**:
   - Abre el archivo: `supabase/06_expense_requests_migration.sql`
   - Copia TODO el contenido
   - Pégalo en el editor SQL de Supabase

5. **Ejecuta la migración**:
   - Haz clic en el botón "Run" o presiona `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)
   - Espera a que se complete la ejecución (debería tomar unos segundos)

6. **Verifica la migración**:
   - Ve a "Table Editor" en el menú lateral
   - Confirma que:
     - ✅ La tabla `expense_requests` existe
     - ✅ Las tablas `event_orders` y `order_types` ya no existen
     - ✅ El bucket `expense-attachments` existe en Storage

---

### Opción 2: Aplicar desde la Terminal (Alternativa)

Si prefieres usar la CLI de Supabase:

```bash
# 1. Asegúrate de estar en el directorio del proyecto
cd /Users/p.magana/Documents/projects/centerThink

# 2. Aplica la migración usando Supabase CLI
supabase db push

# O alternativamente, ejecuta el archivo SQL directamente:
psql "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
  -f supabase/06_expense_requests_migration.sql
```

---

## 🗄️ Estructura de la Nueva Tabla

### `expense_requests`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | ID único (auto-generado) |
| `request_name` | TEXT | Nombre de la solicitud (requerido) |
| `email` | TEXT | Email de contacto (requerido) |
| `request_type` | ENUM | Tipo: presupuesto, material, camisetas, viajes, IT |
| `estimated_amount` | DECIMAL | Importe estimado en euros |
| `iban` | TEXT | IBAN para transferencias |
| `shipping_address` | TEXT | Dirección de envío |
| `additional_info` | TEXT | Información adicional |
| `attachments` | JSONB | Array de archivos adjuntos |
| `status` | ENUM | Estado: pendiente, en_proceso, completado, cancelado |
| `city_id` | UUID | Referencia a ciudades (FK) |
| `created_by` | UUID | Usuario creador (FK) |
| `created_at` | TIMESTAMP | Fecha de creación |
| `updated_at` | TIMESTAMP | Fecha de actualización |

---

## 🔒 Configuración del Bucket de Storage

La migración crea automáticamente el bucket `expense-attachments`, pero debes verificar la configuración:

1. **Ve a Storage en Supabase Dashboard**
2. **Verifica que el bucket `expense-attachments` existe**
3. **Revisa las políticas RLS** (ya aplicadas por la migración):
   - Admins: acceso completo
   - Suppliers: acceso completo
   - Users: sin acceso

---

## ✅ Verificación Post-Migración

Después de aplicar la migración, verifica lo siguiente:

### En Supabase Dashboard:

1. **Table Editor**:
   ```
   ✓ Tabla expense_requests creada
   ✓ Tablas event_orders y order_types eliminadas
   ```

2. **Storage**:
   ```
   ✓ Bucket expense-attachments creado
   ✓ Políticas RLS configuradas
   ```

3. **Authentication**:
   ```
   ✓ Tablas auth.users intactas
   ✓ Usuarios existentes mantienen sus permisos
   ```

### En la Aplicación:

1. **Inicia sesión como Admin o Supplier**
2. **Navega a "Pedidos" (Orders)**
3. **Verifica que ves**:
   - Sección de enlaces a Asana en la parte superior
   - Botón "Nueva Solicitud"
   - Filtros por estado, tipo, ciudad, y creador
   - Lista de solicitudes (vacía inicialmente)

4. **Prueba crear una nueva solicitud**:
   - Llena todos los campos requeridos
   - Sube algunos archivos de prueba
   - Guarda la solicitud
   - Verifica que aparece en la lista

---

## 🚨 Solución de Problemas

### Error: "relation event_orders does not exist"
**Solución**: Las tablas antiguas ya fueron eliminadas. Esto es esperado después de la migración.

### Error: "bucket expense-attachments already exists"
**Solución**: El bucket ya fue creado. Puedes ignorar este error o comentar esa línea en el SQL.

### Error al subir archivos
**Posibles causas**:
1. Políticas RLS incorrectas en Storage
2. Usuario sin permisos de admin/supplier
3. Archivo excede el tamaño máximo (10MB)

**Solución**:
- Verifica las políticas RLS en Storage
- Confirma que el usuario tiene rol admin o supplier
- Reduce el tamaño del archivo

### La página muestra "No tienes permisos"
**Causa**: Usuario con rol 'user' intentando acceder
**Solución**: Solo admin y supplier pueden acceder. Cambia el rol del usuario o usa una cuenta con permisos.

---

## 📞 Soporte

Si encuentras problemas durante la migración:

1. Revisa los logs de Supabase en la sección "Logs"
2. Verifica que tienes permisos de admin en tu proyecto Supabase
3. Asegúrate de que todos los archivos nuevos estén correctamente subidos al repositorio

---

## 🎉 Funcionalidades Nuevas

Después de la migración, tendrás acceso a:

- ✨ Formulario de solicitud de gastos con campos específicos
- 📎 Subida de múltiples archivos adjuntos
- 🔗 Enlaces directos a formularios de Asana
- 🏙️ Filtrado por ciudad, tipo, estado y creador
- 📊 Vista de lista con cards informativos
- 🔒 Control de acceso por roles (admin/supplier)
- 📧 Tracking del creador de cada solicitud
- 💰 Gestión de importes e IBANs

---

## 📝 Notas Importantes

1. **Backup**: Considera hacer un backup de `event_orders` antes de ejecutar esta migración si necesitas preservar datos históricos.

2. **Irreversible**: Esta migración elimina tablas. No hay forma de revertirla automáticamente.

3. **Permisos**: Solo usuarios con rol `admin` o `supplier` pueden acceder a la nueva funcionalidad.

4. **Storage**: Los archivos subidos se almacenan en Supabase Storage y cuentan contra tu cuota de almacenamiento.

5. **Emails**: Las notificaciones de Asana se gestionan mediante los formularios externos enlazados.

---

**Fecha de creación**: 2025-11-01
**Versión**: 1.0
**Archivo de migración**: `supabase/06_expense_requests_migration.sql`
