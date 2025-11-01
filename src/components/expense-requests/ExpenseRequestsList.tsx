import React from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  Loader,
  CheckCircle,
  XCircle,
  FileText,
  MapPin,
  User,
  Mail,
  Euro,
  Edit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  REQUEST_TYPE_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  REQUEST_TYPE_COLORS
} from '@/entities/ExpenseRequest'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { AttachmentsViewer } from './AttachmentsViewer'

interface ExpenseRequestsListProps {
  requests: any[]
  onEdit: (request: any) => void
}

export function ExpenseRequestsList({ requests, onEdit }: ExpenseRequestsListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Clock className="h-4 w-4" />
      case 'en_proceso':
        return <Loader className="h-4 w-4" />
      case 'completado':
        return <CheckCircle className="h-4 w-4" />
      case 'cancelado':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusBadgeClass = (status: string) => {
    const color = STATUS_COLORS[status] || 'gray'
    return `bg-${color}-100 text-${color}-700 border-${color}-300`
  }

  const getRequestTypeBadgeClass = (type: string) => {
    const color = REQUEST_TYPE_COLORS[type] || 'gray'
    return `bg-${color}-100 text-${color}-700 border-${color}-300`
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No hay solicitudes</h3>
        <p className="mt-1 text-sm text-gray-500">
          Comienza creando una nueva solicitud de gasto
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {requests.map((request, index) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
        >
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {request.request_name}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(request)}
                  className="shrink-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge
                  variant="outline"
                  className={getStatusBadgeClass(request.status)}
                >
                  {getStatusIcon(request.status)}
                  <span className="ml-1">{STATUS_LABELS[request.status]}</span>
                </Badge>
                <Badge
                  variant="outline"
                  className={getRequestTypeBadgeClass(request.request_type)}
                >
                  {REQUEST_TYPE_LABELS[request.request_type]}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* City */}
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">{request.city?.name || 'N/A'}</span>
              </div>

              {/* Email */}
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2 shrink-0" />
                <span className="truncate">{request.email}</span>
              </div>

              {/* Creator */}
              {request.creator && (
                <div className="flex items-center text-sm text-gray-600">
                  <User className="h-4 w-4 mr-2 shrink-0" />
                  <span className="truncate">
                    {request.creator.first_name} {request.creator.last_name}
                  </span>
                </div>
              )}

              {/* Estimated Amount */}
              {request.estimated_amount && (
                <div className="flex items-center text-sm font-medium text-gray-900">
                  <Euro className="h-4 w-4 mr-2 shrink-0" />
                  <span>{request.estimated_amount.toFixed(2)} €</span>
                </div>
              )}

              {/* IBAN */}
              {request.iban && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">IBAN:</span>{' '}
                  <span className="font-mono text-xs">{request.iban}</span>
                </div>
              )}

              {/* Shipping Address */}
              {request.shipping_address && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Dirección:</span>{' '}
                  <span className="line-clamp-2">{request.shipping_address}</span>
                </div>
              )}

              {/* Additional Info */}
              {request.additional_info && (
                <div className="text-sm text-gray-600">
                  <p className="line-clamp-3">{request.additional_info}</p>
                </div>
              )}

              {/* Attachments */}
              {request.attachments && request.attachments.length > 0 && (
                <AttachmentsViewer attachments={request.attachments} />
              )}

              {/* Created Date */}
              <div className="text-xs text-gray-400 pt-2 border-t">
                Creado:{' '}
                {format(new Date(request.created_at), 'dd MMM yyyy, HH:mm', { locale: es })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
