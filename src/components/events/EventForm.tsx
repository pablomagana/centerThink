
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Save, X } from "lucide-react";
// @ts-ignore
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface City {
  id: string;
  name: string;
  country: string;
}

interface Speaker {
  id: string;
  name: string;
}

interface Venue {
  id: string;
  name: string;
}

interface EventPreparations {
  presentation_video?: string;
  poster_image?: string;
  theme?: string;
  transport?: string;
  accommodation?: string;
}

interface Event {
  description?: string;
  city_id?: string;
  date?: string;
  speaker_id?: string;
  venue_id?: string;
  status?: string;
  max_attendees?: number | string;
  notes?: string;
  preparations?: EventPreparations;
}

interface EventFormProps {
  event?: Event | null;
  speakers: Speaker[];
  venues: Venue[];
  cities: City[];
  selectedCity?: City | null;
  defaultDate?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function EventForm({
  event,
  speakers,
  venues,
  cities,
  selectedCity,
  defaultDate,
  isOpen,
  onClose,
  onSubmit
}: EventFormProps) {
  const getInitialDate = () => {
    if (event?.date) {
      // Si viene como YYYY-MM-DD (formato DATE de Supabase)
      if (event.date.length === 10) {
        return event.date;
      }
      // Si viene como ISO datetime, extraer solo la fecha
      try {
        const date = new Date(event.date);
        if (!isNaN(date.getTime())) {
          return date.toISOString().slice(0, 10);
        }
      } catch (e) {
        console.error("Error parsing event date:", e);
      }
    }
    return defaultDate || "";
  };

  const [formData, setFormData] = useState({
    description: event?.description || "",
    city_id: event?.city_id || selectedCity?.id || "",
    date: getInitialDate(),
    speaker_id: event?.speaker_id || "_none",
    venue_id: event?.venue_id || "_none",
    status: event?.status || "planificacion",
    max_attendees: event?.max_attendees !== null && event?.max_attendees !== undefined ? String(event.max_attendees) : "",
    notes: event?.notes || "",
    preparations: {
      presentation_video: event?.preparations?.presentation_video || "pendiente",
      poster_image: event?.preparations?.poster_image || "pendiente",
      theme: event?.preparations?.theme || "pendiente",
      transport: event?.preparations?.transport || "pendiente",
      accommodation: event?.preparations?.accommodation || "pendiente"
    }
  });

  // Reset form when event changes
  React.useEffect(() => {
    const getDate = () => {
      if (event?.date) {
        // Si viene como YYYY-MM-DD (formato DATE de Supabase)
        if (event.date.length === 10) {
          return event.date;
        }
        // Si viene como ISO datetime, extraer solo la fecha
        try {
          const date = new Date(event.date);
          if (!isNaN(date.getTime())) {
            return date.toISOString().slice(0, 10);
          }
        } catch (e) {
          console.error("Error parsing event date:", e);
        }
      }
      return defaultDate || "";
    };

    setFormData({
      description: event?.description || "",
      city_id: event?.city_id || selectedCity?.id || "",
      date: getDate(),
      speaker_id: event?.speaker_id || "_none",
      venue_id: event?.venue_id || "_none",
      status: event?.status || "planificacion",
      max_attendees: event?.max_attendees !== null && event?.max_attendees !== undefined ? String(event.max_attendees) : "",
      notes: event?.notes || "",
      preparations: {
        presentation_video: event?.preparations?.presentation_video || "pendiente",
        poster_image: event?.preparations?.poster_image || "pendiente",
        theme: event?.preparations?.theme || "pendiente",
        transport: event?.preparations?.transport || "pendiente",
        accommodation: event?.preparations?.accommodation || "pendiente"
      }
    });
  }, [event, selectedCity, defaultDate, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreparationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      preparations: { ...prev.preparations, [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Generate title automatically
    const selectedCityObj = cities.find(city => city.id === formData.city_id);
    const cityName = selectedCityObj ? selectedCityObj.name : "Ciudad Desconocida";

    const selectedSpeaker = speakers.find(speaker => speaker.id === formData.speaker_id);
    const speakerName = selectedSpeaker ? selectedSpeaker.name : "Ponente No Asignado";

    let formattedDate = "";
    if (formData.date) {
      try {
        // Crear fecha a partir del string YYYY-MM-DD
        const [year, month, day] = formData.date.split('-').map(Number);
        const dateObj = new Date(year, month - 1, day);
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        formattedDate = dateObj.toLocaleDateString('es-ES', options);
      } catch (error) {
        console.error("Error formatting date for title:", error);
      }
    }

    let generatedTitle = `Thinkglao en ${cityName}`;
    if (speakerName !== "Ponente No Asignado") {
      generatedTitle += ` con ${speakerName}`;
    }
    if (formattedDate) {
      generatedTitle += ` el ${formattedDate}`;
    }

    onSubmit({
      ...formData,
      city_id: formData.city_id || null,
      speaker_id: formData.speaker_id === "_none" || !formData.speaker_id ? null : formData.speaker_id,
      venue_id: formData.venue_id === "_none" || !formData.venue_id ? null : formData.venue_id,
      title: generatedTitle,
      date: formData.date, // Enviar solo la fecha YYYY-MM-DD
      max_attendees: formData.max_attendees ? Number.parseInt(formData.max_attendees as string) : null
    });
  };

  const preparationOptions = [
    { value: "pendiente", label: "Pendiente", color: "text-amber-600 bg-amber-50" },
    { value: "procesando", label: "Procesando", color: "text-blue-600 bg-blue-50" },
    { value: "resuelto", label: "Resuelto", color: "text-emerald-600 bg-emerald-50" }
  ];

  const preparationFields: { key: keyof EventPreparations; label: string }[] = [
    { key: "presentation_video", label: "Vídeo de Presentación" },
    { key: "poster_image", label: "Imagen/Cartel" },
    { key: "theme", label: "Tema" },
    { key: "transport", label: "Transporte" },
    { key: "accommodation", label: "Alojamiento" }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            {event ? "Editar Thinkglao" : "Nuevo Thinkglao"}
          </DialogTitle>
          <DialogDescription>
            {event ? "Modifica los datos del thinkglao" : "Completa los datos para crear un nuevo thinkglao"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="city_id">Ciudad *</Label>
              <Select
                value={formData.city_id}
                onValueChange={(value: string) => handleInputChange("city_id", value)}
                required
              >
                <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar ciudad" />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id} className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">
                      {city.name}, {city.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm sm:text-base">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("date", e.target.value)}
                required
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="speaker_id" className="text-sm sm:text-base">Ponente</Label>
              <Select
                value={formData.speaker_id}
                onValueChange={(value: string) => handleInputChange("speaker_id", value)}
              >
                <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar ponente" />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  <SelectItem value="_none" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Sin asignar</SelectItem>
                  {speakers.map((speaker) => (
                    <SelectItem key={speaker.id} value={speaker.id} className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">
                      {speaker.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_id" className="text-sm sm:text-base">Local</Label>
              <Select
                value={formData.venue_id}
                onValueChange={(value: string) => handleInputChange("venue_id", value)}
              >
                <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                  <SelectValue placeholder="Seleccionar local" />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  <SelectItem value="_none" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Sin asignar</SelectItem>
                  {venues.map((venue) => (
                    <SelectItem key={venue.id} value={venue.id} className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">
                      {venue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm sm:text-base">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: string) => handleInputChange("status", value)}
              >
                <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[60vh]">
                  <SelectItem value="planificacion" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Planificación</SelectItem>
                  <SelectItem value="confirmado" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Confirmado</SelectItem>
                  <SelectItem value="completado" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Completado</SelectItem>
                  <SelectItem value="cancelado" className="py-2.5 px-3 sm:px-4 text-sm sm:text-base">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_attendees" className="text-sm sm:text-base">Máximo de Asistentes</Label>
              <Input
                id="max_attendees"
                type="number"
                value={formData.max_attendees}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("max_attendees", e.target.value)}
                placeholder="Ej: 100"
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm sm:text-base">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
              placeholder="Descripción del evento..."
              rows={4}
              className="text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
            />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900">
              Estado de Preparativos
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              {preparationFields.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm sm:text-base">{label}</Label>
                  <Select
                    value={formData.preparations[key]}
                    onValueChange={(value: string) => handlePreparationChange(key, value)}
                  >
                    <SelectTrigger className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-[60vh]">
                      {preparationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="py-2.5 px-3 sm:px-4">
                          <div className={`px-2 py-1 rounded text-xs sm:text-sm ${option.color}`}>
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm sm:text-base">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
              placeholder="Notas internas del evento..."
              rows={3}
              className="text-sm sm:text-base px-3 sm:px-4 py-2 sm:py-3"
            />
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full sm:w-auto h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-2 sm:order-1"
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base order-1 sm:order-2"
            >
              <Save className="w-4 h-4 mr-2" />
              {event ? "Actualizar" : "Crear"} Thinkglao
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
