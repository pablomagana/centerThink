import React, { useCallback, useState } from 'react'
import { Upload, X, FileIcon, ImageIcon, FileTextIcon, Download, ExternalLink } from 'lucide-react'
import { storageService } from '@/services/storage.service'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FileUploadZoneProps {
  onFilesChange: (files: any[]) => void
  existingFiles?: any[]
  maxFiles?: number
  maxSizeMB?: number
}

export function FileUploadZone({
  onFilesChange,
  existingFiles = [],
  maxFiles = 10,
  maxSizeMB = 10
}: FileUploadZoneProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [downloading, setDownloading] = useState<string | null>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const validateAndAddFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return

    const fileArray = Array.from(newFiles)
    const totalFiles = files.length + existingFiles.length + fileArray.length

    // Check max files
    if (totalFiles > maxFiles) {
      setError(`No puedes subir más de ${maxFiles} archivos`)
      return
    }

    // Validate files
    const { valid, errors } = storageService.validateFiles(fileArray, {
      maxSize: maxSizeMB * 1024 * 1024
    })

    if (!valid) {
      setError(errors.join(', '))
      return
    }

    setError(null)
    const updatedFiles = [...files, ...fileArray]
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, existingFiles, maxFiles, maxSizeMB, onFilesChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    validateAndAddFiles(e.dataTransfer.files)
  }, [validateAndAddFiles])

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    validateAndAddFiles(e.target.files)
  }, [validateAndAddFiles])

  const removeFile = useCallback((index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }, [files, onFilesChange])

  const handleFileView = useCallback(async (file: any) => {
    try {
      setDownloading(file.path)
      setError(null)
      const signedUrl = await storageService.getDownloadUrl(file.path)
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error viewing file:', error)
      setError('Error al abrir el archivo. Por favor, intenta de nuevo.')
    } finally {
      setDownloading(null)
    }
  }, [])

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (type.includes('pdf')) return <FileTextIcon className="h-8 w-8 text-red-500" />
    return <FileIcon className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          multiple
          onChange={handleFileInput}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <Upload className="h-12 w-12 text-gray-400" />
          <div>
            <label
              htmlFor="file-upload"
              className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium"
            >
              Haz clic para seleccionar archivos
            </label>
            <p className="text-sm text-gray-500 mt-1">
              o arrastra y suelta archivos aquí
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Máximo {maxFiles} archivos, {maxSizeMB}MB cada uno
          </p>
          <p className="text-xs text-gray-400">
            Formatos: PDF, imágenes, documentos Word/Excel, texto
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos seleccionados ({files.length})
          </h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {storageService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Files */}
      {existingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            Archivos adjuntos ({existingFiles.length})
          </h4>
          <div className="space-y-2">
            {existingFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {storageService.formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileView(file)}
                    disabled={downloading === file.path}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    title="Ver archivo"
                  >
                    {downloading === file.path ? (
                      <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                    ) : (
                      <ExternalLink className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFileView(file)}
                    disabled={downloading === file.path}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                    title="Descargar archivo"
                  >
                    {downloading === file.path ? (
                      <div className="animate-spin h-4 w-4 border-2 border-green-600 border-t-transparent rounded-full" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
