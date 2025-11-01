import React from 'react'
import { ExternalLink, FileText, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export function AsanaLinksSection() {
  const handleAsanaLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-emerald-50 border-2 border-blue-200">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col gap-4">
          {/* Título y descripción */}
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">
              Formularios Externos
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              Accede a los formularios de Asana para solicitudes de gastos y planificación de eventos
            </p>
          </div>

          {/* Botones - Stack vertical en móvil, horizontal en tablet+ */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {/* Solicitud de Gastos Button */}
            <Button
              onClick={() => handleAsanaLink('https://form.asana.com/?k=4lJO_f6OmwYENXGob52Tsg&d=1210557974425102')}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all group w-full sm:flex-1"
              size="default"
            >
              <FileText className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate text-sm sm:text-base">Solicitud de Gastos</span>
              <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </Button>

            {/* Planificación de Thinkglaos Button */}
            <Button
              onClick={() => handleAsanaLink('https://form.asana.com/?k=8DSw01UpsQkIriYSjhaihg&d=1210557974425102')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg transition-all group w-full sm:flex-1"
              size="default"
            >
              <Calendar className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate text-sm sm:text-base">Planificación de Thinkglaos</span>
              <ExternalLink className="ml-2 h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
