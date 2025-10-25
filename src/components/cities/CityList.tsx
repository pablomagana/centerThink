import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Edit2,
  Globe,
  Map,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function CitiesList({ cities, onEdit, onDelete }) {
  const [cityToDelete, setCityToDelete] = useState(null);

  const handleDeleteClick = (city) => {
    setCityToDelete(city);
  };

  const handleConfirmDelete = async () => {
    if (cityToDelete) {
      await onDelete(cityToDelete.id);
      setCityToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setCityToDelete(null);
  };
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
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(city)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteClick(city)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
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
                  Creada el {new Date(city.created_at).toLocaleDateString('es-ES', {
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

      <AlertDialog open={!!cityToDelete} onOpenChange={handleCancelDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar ciudad?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar la ciudad{" "}
              <strong>{cityToDelete?.name}</strong>?
              Esta acción no se puede deshacer y solo es posible si la ciudad
              no tiene eventos asociados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
