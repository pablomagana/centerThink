import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  MapPin,
  Users,
  User,
  Phone,
  Mail,
  Edit2
} from "lucide-react";
import { motion } from "framer-motion";

export default function VenuesList({ venues, cities, onEdit }) {
  const getCityName = (cityId) => {
    const city = cities.find(c => c.id === cityId);
    return city ? city.name : "N/A";
  };

  if (venues.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Building2 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay locales registrados
          </h3>
          <p className="text-slate-500">
            Añade tu primer local para poder asignarlo a los eventos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {venues.map((venue, index) => (
        <motion.div
          key={venue.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                   <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-lg flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-lg truncate">
                      {venue.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      {!venue.active && (
                        <Badge variant="outline" className="text-slate-500">Inactivo</Badge>
                      )}
                      {venue.capacity && (
                        <Badge variant="secondary" className="flex items-center gap-1 bg-blue-50 text-blue-700">
                          <Users className="w-3 h-3" />
                          {venue.capacity}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(venue)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-emerald-500 mt-1 flex-shrink-0" />
                  <div className="text-sm">
                    <p>{venue.address}</p>
                    <p className="font-medium">{getCityName(venue.city_id)}</p>
                  </div>
                </div>

                {venue.notes && (
                  <p className="text-sm text-slate-500 line-clamp-2 mt-3 pt-3 border-t">
                    {venue.notes}
                  </p>
                )}
              </div>

              {(venue.contact_name || venue.contact_phone || venue.contact_email) && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-sm font-semibold text-slate-800">Contacto</h4>
                  <div className="space-y-2">
                    {venue.contact_name && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <User className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{venue.contact_name}</span>
                      </div>
                    )}
                    {venue.contact_phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="w-4 h-4 text-purple-500" />
                        <span className="text-sm">{venue.contact_phone}</span>
                      </div>
                    )}
                    {venue.contact_email && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Mail className="w-4 h-4 text-purple-500" />
                        <a href={`mailto:${venue.contact_email}`} className="text-sm hover:underline truncate">
                          {venue.contact_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
