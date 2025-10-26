import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Phone,
  Edit2,
  MapPin,
  Shield,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";

export default function UsersList({ users, cities, onEdit, onDelete }) {
  const getUserCities = (userCityIds) => {
    if (!userCityIds || userCityIds.length === 0) return [];
    return cities.filter(city => userCityIds.includes(city.id));
  };
  
  if (users.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <User className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay usuarios en la aplicación
          </h3>
          <p className="text-slate-500">
            Invita a tu primer usuario para empezar a construir tu equipo.
          </p>
        </CardContent>
      </Card>
    );
  }

  const roleConfig = {
    admin: { label: "Admin", color: "bg-red-100 text-red-700" },
    user: { label: "Usuario", color: "bg-blue-100 text-blue-700" },
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {users.map((user, index) => {
        const userRole = roleConfig[user.role] || { label: user.role, color: "bg-slate-100 text-slate-600" };
        const assignedCities = getUserCities(user.cities);

        return (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg truncate">
                        {user.first_name} {user.last_name}
                      </h3>
                      <Badge className={`${userRole.color} mt-1`}>
                        <Shield className="w-3 h-3 mr-1.5" />
                        {userRole.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(user)}
                      title="Editar usuario"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(user)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Eliminar usuario"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  {user.email && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <a
                          href={`mailto:${user.email}`}
                          className="text-sm hover:text-blue-600 transition-colors truncate"
                        >
                          {user.email}
                        </a>
                      </div>
                      {user.email_verified ? (
                        <div className="flex items-center gap-1.5 text-green-600 ml-6">
                          <CheckCircle2 className="w-3 h-3" />
                          <span className="text-xs">Email verificado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-orange-600 ml-6">
                          <AlertCircle className="w-3 h-3" />
                          <span className="text-xs">Email sin verificar</span>
                        </div>
                      )}
                    </div>
                  )}

                  {user.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-sm">{user.phone}</span>
                    </div>
                  )}
                </div>

                {assignedCities.length > 0 && (
                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      Ciudades Asignadas
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {assignedCities.map(city => (
                        <Badge key={city.id} variant="secondary">{city.name}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  );
}
