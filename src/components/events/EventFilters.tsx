import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter } from "lucide-react";

export default function EventFilters({ filters, setFilters }) {
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="shadow-md border-0 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filtros:</span>
          </div>

          <Select
            value={filters.status}
            onValueChange={(value) => handleFilterChange("status", value)}
          >
            <SelectTrigger className="w-full sm:w-48 h-11 sm:h-12 text-sm sm:text-base">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent className="max-h-[60vh]">
              <SelectItem value="all" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Todos los estados</SelectItem>
              <SelectItem value="planificacion" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Planificación</SelectItem>
              <SelectItem value="confirmado" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Confirmado</SelectItem>
              <SelectItem value="completado" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Completado</SelectItem>
              <SelectItem value="cancelado" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
