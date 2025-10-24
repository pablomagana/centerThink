import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Calendar, 
  MapPin, 
  User, 
  Building2, 
  Edit2, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function EventsList({ 
  events, 
  speakers, 
  venues, 
  cities, 
  onEdit 
}) {
  const getSpeaker = (speakerId) => speakers.find(s => s.id === speakerId);
  const getVenue = (venueId) => venues.find(v => v.id === venueId);
  const getCity = (cityId) => cities.find(c => c.id === cityId);

  const statusConfig = {
    planificacion: { 
      label: "Planificación", 
      color: "bg-amber-100 text-amber-800", 
      icon: Clock 
    },
    confirmado: { 
      label: "Confirmado", 
      color: "bg-blue-100 text-blue-800", 
      icon: CheckCircle 
    },
    completado: { 
      label: "Completado", 
      color: "bg-emerald-100 text-emerald-800", 
      icon: CheckCircle 
    },
    cancelado: { 
      label: "Cancelado", 
      color: "bg-red-100 text-red-800", 
      icon: XCircle 
    }
  };

  const getPreparationProgress = (preparations) => {
    if (!preparations) return 0;
    const total = 5;
    const completed = Object.values(preparations).filter(status => status === "resuelto").length;
    return Math.round((completed / total) * 100);
  };

  if (events.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay Thinkglaos
          </h3>
          <p className="text-slate-500">
            Crea tu primer Thinkglao para comenzar a organizarte.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {events.map((event, index) => {
        const speaker = getSpeaker(event.speaker_id);
        const venue = getVenue(event.venue_id);
        const city = getCity(event.city_id);
        const status = statusConfig[event.status];
        const StatusIcon = status?.icon || AlertCircle;
        const preparationProgress = getPreparationProgress(event.preparations);

        const eventTitle = speaker 
          ? `${speaker.name} - ${format(new Date(event.date), "MMMM yyyy", { locale: es })}`
          : format(new Date(event.date), "PPP", { locale: es });

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex-shrink-0 bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-white"
                    >
                      <Zap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 truncate text-lg capitalize">
                        {eventTitle}
                      </h3>
                       <p className="text-sm text-blue-600 font-semibold">
                        Thinkglao
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(event)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Badge className={status?.color}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status?.label}
                  </Badge>
                  {preparationProgress > 0 && (
                    <Badge variant="outline" className="text-emerald-600">
                      {preparationProgress}% preparado
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium">
                      {format(new Date(event.date), "PPP 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>

                  {city && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="w-4 h-4 text-emerald-500" />
                      <span className="text-sm">{city.name}, {city.country}</span>
                    </div>
                  )}

                  {speaker && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4 text-purple-500" />
                      <span className="text-sm">{speaker.name}</span>
                    </div>
                  )}

                  {venue && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Building2 className="w-4 h-4 text-orange-500" />
                      <span className="text-sm truncate">{venue.name}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 mt-auto">
                    <Link to={createPageUrl(`EventDetails?id=${event.id}`)}>
                      <Button variant="outline" className="w-full">
                        Ver Detalles y Voluntarios
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
