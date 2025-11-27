import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mic, Save, X, Calendar as CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface SpeakerFormProps {
  speaker?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function SpeakerForm({ speaker, isOpen, onClose, onSubmit }: SpeakerFormProps) {
  const [formData, setFormData] = useState({
    name: speaker?.name || "",
    email: speaker?.email || "",
    phone: speaker?.phone || "",
    instagram: speaker?.instagram || "",
    bio: speaker?.bio || "",
    contact_status: speaker?.contact_status || "no_contactado",
    proposal_status: speaker?.proposal_status || "sin_propuesta",
    proposal_confirmation_date: speaker?.proposal_confirmation_date ? new Date(speaker.proposal_confirmation_date) : null,
    active: speaker?.active !== undefined ? speaker.active : true
  });

  // Reset form when speaker changes
  React.useEffect(() => {
    setFormData({
      name: speaker?.name || "",
      email: speaker?.email || "",
      phone: speaker?.phone || "",
      instagram: speaker?.instagram || "",
      bio: speaker?.bio || "",
      contact_status: speaker?.contact_status || "no_contactado",
      proposal_status: speaker?.proposal_status || "sin_propuesta",
      proposal_confirmation_date: speaker?.proposal_confirmation_date ? new Date(speaker.proposal_confirmation_date) : null,
      active: speaker?.active !== undefined ? speaker.active : true
    });
  }, [speaker, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Mic className="w-6 h-6 text-purple-600" />
            {speaker ? "Editar Ponente" : "Nuevo Ponente"}
          </DialogTitle>
          <DialogDescription>
            {speaker ? "Modifica los datos del ponente" : "Completa los datos para crear un nuevo ponente"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nombre del ponente"
                required
                className="text-lg h-12 px-4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="email@ejemplo.com"
                required
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                placeholder="+34 600 000 000"
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagram}
                onChange={(e) => handleInputChange("instagram", e.target.value)}
                placeholder="@usuario"
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 col-span-1 lg:col-span-2 pt-6 border-t">
            Estado de Colaboración
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_status">Estado de Contacto</Label>
              <Select
                value={formData.contact_status}
                onValueChange={(value) => handleInputChange("contact_status", value)}
              >
                <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no_contactado">No Contactado</SelectItem>
                  <SelectItem value="contactado">Contactado</SelectItem>
                  <SelectItem value="seguimiento">En Seguimiento</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_status">Estado Propuesta (Thinkglao)</Label>
              <Select
                value={formData.proposal_status}
                onValueChange={(value) => handleInputChange("proposal_status", value)}
              >
                <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sin_propuesta">Sin Propuesta</SelectItem>
                  <SelectItem value="propuesta_enviada">Propuesta Enviada</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proposal_confirmation_date">Fecha Confirmación</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className="w-full justify-start text-left font-normal h-12 px-4"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.proposal_confirmation_date ? (
                      format(new Date(formData.proposal_confirmation_date), 'PPP')
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.proposal_confirmation_date ? new Date(formData.proposal_confirmation_date) : undefined}
                    onSelect={(date) => handleInputChange("proposal_confirmation_date", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Información sobre el ponente, su experiencia y especialidades..."
              rows={4}
            />
          </div>

          <div className="flex items-center gap-3 pt-6 border-t">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              className="rounded h-5 w-5"
            />
            <Label htmlFor="active" className="text-base">Ponente activo</Label>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 sm:h-12 px-6 sm:px-8 text-base">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-8 text-base"
            >
              <Save className="w-4 h-4 mr-2" />
              {speaker ? "Actualizar" : "Crear"} Ponente
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
