/**
 * ExpenseRequest Entity
 * Schema definition and service export for expense requests
 */

import { expenseRequestService } from '@/services/expenseRequest.service'

/**
 * ExpenseRequest Schema Definition
 */
export const ExpenseRequestSchema = {
  table: 'expense_requests',
  properties: {
    id: {
      type: 'string',
      format: 'uuid',
      description: 'ID único de la solicitud',
      readOnly: true
    },
    request_name: {
      type: 'string',
      description: 'Nombre de la solicitud',
      required: true
    },
    email: {
      type: 'string',
      format: 'email',
      description: 'Dirección de email de contacto',
      required: true
    },
    request_type: {
      type: 'string',
      enum: ['presupuesto', 'material', 'camisetas', 'viajes', 'IT'],
      description: 'Tipo de solicitud',
      required: true,
      default: 'presupuesto'
    },
    estimated_amount: {
      type: 'number',
      format: 'decimal',
      description: 'Importe estimado en euros',
      minimum: 0
    },
    iban: {
      type: 'string',
      description: 'IBAN para transferencias bancarias',
      pattern: '^[A-Z]{2}[0-9]{2}[A-Z0-9]+$'
    },
    shipping_address: {
      type: 'string',
      description: 'Dirección de envío de material solicitado'
    },
    additional_info: {
      type: 'string',
      description: 'Información adicional sobre la solicitud'
    },
    attachments: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Nombre del archivo' },
          url: { type: 'string', description: 'URL del archivo' },
          path: { type: 'string', description: 'Ruta en storage' },
          size: { type: 'number', description: 'Tamaño en bytes' },
          type: { type: 'string', description: 'Tipo MIME' },
          uploadedAt: { type: 'string', format: 'date-time', description: 'Fecha de subida' }
        }
      },
      description: 'Archivos adjuntos',
      default: []
    },
    status: {
      type: 'string',
      enum: ['pendiente', 'en_proceso', 'completado', 'cancelado'],
      description: 'Estado de la solicitud',
      required: true,
      default: 'pendiente'
    },
    city_id: {
      type: 'string',
      format: 'uuid',
      description: 'ID de la ciudad asociada',
      required: true
    },
    created_by: {
      type: 'string',
      format: 'uuid',
      description: 'ID del usuario que creó la solicitud',
      required: true,
      readOnly: true
    },
    created_at: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de creación',
      readOnly: true
    },
    updated_at: {
      type: 'string',
      format: 'date-time',
      description: 'Fecha de última actualización',
      readOnly: true
    }
  },
  required: ['request_name', 'email', 'request_type', 'city_id']
}

/**
 * Request Type Display Names
 */
export const REQUEST_TYPE_LABELS = {
  presupuesto: 'Presupuesto',
  material: 'Material',
  camisetas: 'Camisetas',
  viajes: 'Viajes',
  IT: 'IT'
}

/**
 * Status Display Names
 */
export const STATUS_LABELS = {
  pendiente: 'Pendiente',
  en_proceso: 'En Proceso',
  completado: 'Completado',
  cancelado: 'Cancelado'
}

/**
 * Status Colors (Tailwind classes)
 */
export const STATUS_COLORS = {
  pendiente: 'amber',
  en_proceso: 'blue',
  completado: 'emerald',
  cancelado: 'red'
}

/**
 * Request Type Colors (Tailwind classes)
 */
export const REQUEST_TYPE_COLORS = {
  presupuesto: 'purple',
  material: 'blue',
  camisetas: 'green',
  viajes: 'orange',
  IT: 'cyan'
}

// Export service as ExpenseRequest for backward compatibility with entity pattern
export const ExpenseRequest = expenseRequestService
