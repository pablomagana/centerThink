import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Edit2, 
  Globe,
  Map
} from "lucide-react";
import { motion } from "framer-motion";

export default function CitiesList({ cities, onEdit }) {
  if (cities.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay ciudades registradas
          </h3>
          <p className="text-slate-500">
            Agrega tu primera ciudad para comenzar a configurar tu organización.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {cities.map((city, index) => (
        <motion.div
          key={city.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate">
                      {city.name}
                    </h3>
                    {!city.active && (
                      <Badge variant="outline" className="text-slate-500 mt-1">
                        Inactiva
                      </Badge>
                    )}
                    {city.active && (
                      <Badge className="bg-emerald-100 text-emerald-700 mt-1">
                        Activa
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(city)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-slate-600">
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">{city.country}</span>
                </div>

                {city.region && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Map className="w-4 h-4 text-purple-500" />
                    <span className="text-sm">{city.region}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-400">
                  Creada el {new Date(city.created_date).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
