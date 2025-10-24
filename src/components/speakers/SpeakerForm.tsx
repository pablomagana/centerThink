
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Mail,
  Phone,
  Instagram,
  Edit2,
  User,
  Star,
  CheckCircle,
  Clock,
  Send,
  HelpCircle,
  FileCheck,
  FileX,
  PhoneOutgoing,
  MoreVertical,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";


const contactStatusConfig = {
  no_contactado: { label: "No contactado", color: "bg-slate-100 text-slate-600", icon: HelpCircle },
  contactado: { label: "Contactado", color: "bg-blue-100 text-blue-700", icon: PhoneOutgoing },
  seguimiento: { label: "Seguimiento", color: "bg-amber-100 text-amber-700", icon: Clock },
};

const proposalStatusConfig = {
  sin_propuesta: { label: "Sin propuesta", color: "bg-slate-100 text-slate-600", icon: HelpCircle },
  propuesta_enviada: { label: "Propuesta enviada", color: "bg-blue-100 text-blue-700", icon: Send },
  confirmado: { label: "Confirmado", color: "bg-emerald-100 text-emerald-700", icon: FileCheck },
  rechazado: { label: "Rechazado", color: "bg-red-100 text-red-700", icon: FileX },
};

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
            Agrega tu primer ponente para comenzar a gestionar tu base de datos.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {speakers.map((speaker, index) => {
        const contactStatus = contactStatusConfig[speaker.contact_status] || contactStatusConfig.no_contactado;
        const proposalStatus = proposalStatusConfig[speaker.proposal_status] || proposalStatusConfig.sin_propuesta;
        const ContactIcon = contactStatus.icon;
        const ProposalIcon = proposalStatus.icon;

        return (
          <motion.div
            key={speaker.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full shadow-lg border-0 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-900 text-lg truncate">
                        {speaker.name}
                      </h3>
                      {!speaker.active && (
                        <Badge variant="outline" className="text-slate-500 mt-1">
                          Inactivo
                        </Badge>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0 -mr-2"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(speaker)} className="cursor-pointer text-base py-2 px-3">
                        <Edit2 className="w-4 h-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onDelete(speaker.id)} className="cursor-pointer text-base py-2 px-3 text-red-600 focus:bg-red-50 focus:text-red-700">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 flex-1 flex flex-col">
                <div className="space-y-3">
                  {speaker.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <a
                        href={`mailto:${speaker.email}`}
                        className="text-sm hover:text-blue-600 transition-colors truncate"
                      >
                        {speaker.email}
                      </a>
                    </div>
                  )}

                  {speaker.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-emerald-500" />
                      <a
                        href={`tel:${speaker.phone}`}
                        className="text-sm hover:text-emerald-600 transition-colors"
                      >
                        {speaker.phone}
                      </a>
                    </div>
                  )}

                  {speaker.instagram && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      <a
                        href={`https://instagram.com/${speaker.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm hover:text-pink-600 transition-colors"
                      >
                        {speaker.instagram}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  {speaker.bio && (
                    <p className="text-sm text-slate-500 line-clamp-3 pt-3 mt-3 border-t">
                      {speaker.bio}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge className={contactStatus.color}>
                      <ContactIcon className="w-3.5 h-3.5 mr-1.5" />
                      {contactStatus.label}
                    </Badge>
                    <Badge className={proposalStatus.color}>
                      <ProposalIcon className="w-3.5 h-3.5 mr-1.5" />
                      {proposalStatus.label}
                    </Badge>
                  </div>
                  {speaker.proposal_status === 'confirmado' && speaker.proposal_confirmation_date && (
                    <div className="flex items-center gap-2 text-xs text-emerald-700">
                      <CheckCircle className="w-3 h-3" />
                      <span>
                        Confirmado el {format(new Date(speaker.proposal_confirmation_date), 'dd MMM yyyy', { locale: es })}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </div>
  );
}
