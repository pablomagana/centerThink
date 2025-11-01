import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUploadZone } from './FileUploadZone'
import { storageService } from '@/services/storage.service'
import { REQUEST_TYPE_LABELS, STATUS_LABELS } from '@/entities/ExpenseRequest'

interface ExpenseRequestFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => Promise<void>
  request?: any
  cities: any[]
}

export function ExpenseRequestForm({
  isOpen,
  onClose,
  onSubmit,
  request,
  cities
}: ExpenseRequestFormProps) {
  const [formData, setFormData] = useState({
    request_name: '',
    email: '',
    request_type: 'presupuesto',
    estimated_amount: '',
    iban: '',
    shipping_address: '',
    additional_info: '',
    city_id: '',
    status: 'pendiente'
  })

  const [newFiles, setNewFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  // Initialize form when request or cities change
  useEffect(() => {
    console.log('ExpenseRequestForm: Initializing', { request, cities: cities.length })

    if (request) {
      setFormData({
        request_name: request.request_name || '',
        email: request.email || '',
        request_type: request.request_type || 'presupuesto',
        estimated_amount: request.estimated_amount?.toString() || '',
        iban: request.iban || '',
        shipping_address: request.shipping_address || '',
        additional_info: request.additional_info || '',
        city_id: request.city_id || '',
        status: request.status || 'pendiente'
      })
      setNewFiles([])
    } else {
      // Reset for create mode - set first city as default
      const defaultCityId = cities.length > 0 ? cities[0].id : ''
      console.log('ExpenseRequestForm: Setting default city', defaultCityId)

      setFormData({
        request_name: '',
        email: '',
        request_type: 'presupuesto',
        estimated_amount: '',
        iban: '',
        shipping_address: '',
        additional_info: '',
        city_id: cities.length > 0 ? cities[0].id : '',
        status: 'pendiente'
      })
      setNewFiles([])
    }
    setError(null)
    setFieldErrors({})
  }, [request, cities, isOpen])

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear field error when user types
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const updated = { ...prev }
        delete updated[field]
        return updated
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.request_name.trim()) {
      errors.request_name = 'El nombre de la solicitud es obligatorio'
    }

    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido'
    }

    if (!formData.city_id) {
      errors.city_id = 'Debes seleccionar una ciudad'
    }

    if (!formData.request_type) {
      errors.request_type = 'Debes seleccionar un tipo de solicitud'
    }

    // IBAN validation (basic)
    if (formData.iban && !/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(formData.iban.replace(/\s/g, ''))) {
      errors.iban = 'IBAN inválido (formato: ES1234567890123456789012)'
    }

    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError('Por favor, corrige los errores en el formulario')
      return
    }

    try {
      setUploading(true)

      // Upload new files if any
      let uploadedFiles: any[] = []
      if (newFiles.length > 0) {
        const folderPath = `expense-requests/${request?.id || 'new'}`
        uploadedFiles = await storageService.uploadFiles(newFiles, folderPath)
      }

      // Combine existing attachments with new uploads
      const existingAttachments = request?.attachments || []
      const allAttachments = [...existingAttachments, ...uploadedFiles]

      // Prepare submission data
      const submitData = {
        ...formData,
        estimated_amount: formData.estimated_amount ? parseFloat(formData.estimated_amount) : null,
        iban: formData.iban.trim() || null,
        shipping_address: formData.shipping_address.trim() || null,
        additional_info: formData.additional_info.trim() || null,
        attachments: allAttachments
      }

      await onSubmit(submitData)
      onClose()
    } catch (err: any) {
      console.error('Error submitting form:', err)
      setError(err.message || 'Error al guardar la solicitud')
    } finally {
      setUploading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      request_name: '',
      email: '',
      request_type: 'presupuesto',
      estimated_amount: '',
      iban: '',
      shipping_address: '',
      additional_info: '',
      city_id: '',
      status: 'pendiente'
    })
    setNewFiles([])
    setError(null)
    setFieldErrors({})
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            {request ? 'Editar Solicitud de Gasto' : 'Nueva Solicitud de Gasto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Nombre de la Solicitud */}
          <div className="space-y-2">
            <Label htmlFor="request_name" className="required">
              Nombre de la Solicitud
            </Label>
            <Input
              id="request_name"
              value={formData.request_name}
              onChange={(e) => handleChange('request_name', e.target.value)}
              placeholder="Ej: Material para evento Madrid"
              className={fieldErrors.request_name ? 'border-red-500' : ''}
            />
            {fieldErrors.request_name && (
              <p className="text-sm text-red-600">{fieldErrors.request_name}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="required">
              Email de Contacto
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contacto@ejemplo.com"
              className={fieldErrors.email ? 'border-red-500' : ''}
            />
            {fieldErrors.email && (
              <p className="text-sm text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Ciudad and Tipo de Solicitud - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Ciudad */}
            <div className="space-y-2">
              <Label htmlFor="city_id" className="required">
                Ciudad
              </Label>
              <Select
                value={formData.city_id}
                onValueChange={(value) => handleChange('city_id', value)}
              >
                <SelectTrigger className={fieldErrors.city_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecciona una ciudad" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.city_id && (
                <p className="text-sm text-red-600">{fieldErrors.city_id}</p>
              )}
            </div>

            {/* Tipo de Solicitud */}
            <div className="space-y-2">
              <Label htmlFor="request_type" className="required">
                Tipo de Solicitud
              </Label>
              <Select
                value={formData.request_type}
                onValueChange={(value) => handleChange('request_type', value)}
              >
                <SelectTrigger className={fieldErrors.request_type ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(REQUEST_TYPE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.request_type && (
                <p className="text-sm text-red-600">{fieldErrors.request_type}</p>
              )}
            </div>
          </div>

          {/* Importe Estimado and IBAN - Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Importe Estimado */}
            <div className="space-y-2">
              <Label htmlFor="estimated_amount">
                Importe Estimado (€)
              </Label>
              <Input
                id="estimated_amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.estimated_amount}
                onChange={(e) => handleChange('estimated_amount', e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* IBAN */}
            <div className="space-y-2">
              <Label htmlFor="iban">
                IBAN
              </Label>
              <Input
                id="iban"
                value={formData.iban}
                onChange={(e) => handleChange('iban', e.target.value.toUpperCase())}
                placeholder="ES1234567890123456789012"
                className={fieldErrors.iban ? 'border-red-500' : ''}
              />
              {fieldErrors.iban && (
                <p className="text-sm text-red-600">{fieldErrors.iban}</p>
              )}
            </div>
          </div>

          {/* Dirección de Material */}
          <div className="space-y-2">
            <Label htmlFor="shipping_address">
              Dirección de Envío de Material
            </Label>
            <Textarea
              id="shipping_address"
              value={formData.shipping_address}
              onChange={(e) => handleChange('shipping_address', e.target.value)}
              placeholder="Calle, número, código postal, ciudad..."
              rows={2}
            />
          </div>

          {/* Información Adicional */}
          <div className="space-y-2">
            <Label htmlFor="additional_info">
              Información Adicional
            </Label>
            <Textarea
              id="additional_info"
              value={formData.additional_info}
              onChange={(e) => handleChange('additional_info', e.target.value)}
              placeholder="Detalles adicionales sobre la solicitud..."
              rows={3}
            />
          </div>

          {/* Status (only in edit mode) */}
          {request && (
            <div className="space-y-2">
              <Label htmlFor="status">
                Estado
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUS_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* File Upload */}
          <div className="space-y-2">
            <Label>Archivos Adjuntos</Label>
            <FileUploadZone
              onFilesChange={setNewFiles}
              existingFiles={request?.attachments || []}
              maxFiles={10}
              maxSizeMB={10}
            />
          </div>

          {/* Form Actions */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={uploading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={uploading}
              className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
            >
              {uploading ? 'Guardando...' : request ? 'Actualizar' : 'Crear Solicitud'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
