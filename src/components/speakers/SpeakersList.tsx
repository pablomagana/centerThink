import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Edit2,
  Mail,
  Phone,
  Instagram,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";

export default function SpeakersList({ speakers, onEdit, onDelete }) {
  if (speakers.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Mic className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            No hay ponentes registrados
          </h3>
          <p className="text-slate-500">
            Agrega tu primer ponente para comenzar a organizar eventos.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      no_contactado: "bg-gray-100 text-gray-700",
      contactado: "bg-blue-100 text-blue-700",
      seguimiento: "bg-yellow-100 text-yellow-700"
    };
    return colors[status] || colors.no_contactado;
  };

  const getProposalStatusColor = (status) => {
    const colors = {
      sin_propuesta: "bg-gray-100 text-gray-700",
      propuesta_enviada: "bg-purple-100 text-purple-700",
      confirmado: "bg-green-100 text-green-700",
      rechazado: "bg-red-100 text-red-700"
    };
    return colors[status] || colors.sin_propuesta;
  };

  const getStatusLabel = (status) => {
    const labels = {
      no_contactado: "No Contactado",
      contactado: "Contactado",
      seguimiento: "En Seguimiento"
    };
    return labels[status] || status;
  };

  const getProposalLabel = (status) => {
    const labels = {
      sin_propuesta: "Sin Propuesta",
      propuesta_enviada: "Propuesta Enviada",
      confirmado: "Confirmado",
      rechazado: "Rechazado"
    };
    return labels[status] || status;
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {speakers.map((speaker, index) => (
        <motion.div
          key={speaker.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mic className="w-6 h-6 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-900 text-lg truncate">
                      {speaker.name}
                    </h3>
                    {!speaker.active && (
                      <Badge variant="outline" className="mt-1">
                        Inactivo
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(speaker)}
                    className="h-8 w-8"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(speaker.id)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">{speaker.email}</span>
              </div>
              {speaker.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{speaker.phone}</span>
                </div>
              )}
              {speaker.instagram && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Instagram className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>@{speaker.instagram}</span>
                </div>
              )}
              <div className="pt-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Contacto:</span>
                  <Badge className={getStatusColor(speaker.contact_status)}>
                    {getStatusLabel(speaker.contact_status)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Propuesta:</span>
                  <Badge className={getProposalStatusColor(speaker.proposal_status)}>
                    {getProposalLabel(speaker.proposal_status)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
