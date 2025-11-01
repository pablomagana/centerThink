import React, { useState } from 'react'
import { Download, FileText, Image as ImageIcon, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { storageService } from '@/services/storage.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface Attachment {
  name: string
  url: string
  path: string
  size: number
  type: string
  uploadedAt: string
}

interface AttachmentsViewerProps {
  attachments: Attachment[]
}

export function AttachmentsViewer({ attachments }: AttachmentsViewerProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!attachments || attachments.length === 0) {
    return null
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />
    }
    if (type === 'application/pdf') {
      return <FileText className="h-4 w-4" />
    }
    return <File className="h-4 w-4" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const handleDownload = async (attachment: Attachment) => {
    try {
      setDownloading(attachment.path)
      setError(null)

      // Get signed URL for private bucket
      const signedUrl = await storageService.getDownloadUrl(attachment.path)

      // Open in new tab
      window.open(signedUrl, '_blank', 'noopener,noreferrer')
    } catch (error) {
      console.error('Error downloading file:', error)
      setError('Error al descargar el archivo. Por favor, intenta de nuevo.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">Archivos Adjuntos:</div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        {attachments.map((attachment, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="text-gray-600 shrink-0">
                {getFileIcon(attachment.type)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {attachment.name}
                </div>
                <div className="text-xs text-gray-500">
                  {formatFileSize(attachment.size)}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownload(attachment)}
              disabled={downloading === attachment.path}
              className="shrink-0 ml-2"
              title="Descargar archivo"
            >
              {downloading === attachment.path ? (
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
