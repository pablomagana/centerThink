
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function EventForm({ 
  event, 
  speakers, 
  venues, 
  cities, 
  onSubmit, 
  onCancel 
}) {
  const [formData, setFormData] = useState({
    description: event?.description || "",
    city_id: event?.city_id || "",
    date: event?.date ? new Date(event.date).toISOString().slice(0, 16) : "",
    speaker_id: event?.speaker_id || "",
    venue_id: event?.venue_id || "",
    status: event?.status || "planificacion",
    max_attendees: event?.max_attendees || "",
    notes: event?.notes || "",
    preparations: {
      presentation_video: event?.preparations?.presentation_video || "pendiente",
      poster_image: event?.preparations?.poster_image || "pendiente",
      theme: event?.preparations?.theme || "pendiente",
      transport: event?.preparations?.transport || "pendiente",
      accommodation: event?.preparations?.accommodation || "pendiente"
    }
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePreparationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      preparations: { ...prev.preparations, [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Generate title automatically
    const selectedCity = cities.find(city => city.id === formData.city_id);
    const cityName = selectedCity ? selectedCity.name : "Ciudad Desconocida"; // city_id is required, so this fallback should rarely be hit.

    const selectedSpeaker = speakers.find(speaker => speaker.id === formData.speaker_id);
    const speakerName = selectedSpeaker ? selectedSpeaker.name : "Ponente No Asignado";

    let formattedDate = "";
    if (formData.date) {
      try {
        const dateObj = new Date(formData.date);
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
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
      title: generatedTitle, // Add the generated title here
      date: new Date(formData.date).toISOString(),
      max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
    });
  };

  const preparationOptions = [
    { value: "pendiente", label: "Pendiente", color: "text-amber-600 bg-amber-50" },
    { value: "procesando", label: "Procesando", color: "text-blue-600 bg-blue-50" },
    { value: "resuelto", label: "Resuelto", color: "text-emerald-600 bg-emerald-50" }
  ];

  const preparationFields = [
    { key: "presentation_video", label: "Vídeo de Presentación" },
    { key: "poster_image", label: "Imagen/Cartel" },
    { key: "theme", label: "Tema" },
    { key: "transport", label: "Transporte" },
    { key: "accommodation", label: "Alojamiento" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-emerald-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            {event ? "Editar Thinkglao" : "Nuevo Thinkglao"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* The title input field has been removed as it's now automatically generated */}

              <div className="space-y-2">
                <Label htmlFor="city_id">Ciudad *</Label>
                <Select
                  value={formData.city_id}
                  onValueChange={(value) => handleInputChange("city_id", value)}
                  required
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue placeholder="Seleccionar ciudad" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city.id} value={city.id} className="py-2.5 px-4">
                        {city.name}, {city.country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Fecha y Hora *</Label>
                <Input
                  id="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  required
                  className="h-12 px-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="speaker_id">Ponente</Label>
                <Select
                  value={formData.speaker_id}
                  onValueChange={(value) => handleInputChange("speaker_id", value)}
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue placeholder="Seleccionar ponente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null} className="py-2.5 px-4">Sin asignar</SelectItem>
                    {speakers.map((speaker) => (
                      <SelectItem key={speaker.id} value={speaker.id} className="py-2.5 px-4">
                        {speaker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_id">Local</Label>
                <Select
                  value={formData.venue_id}
                  onValueChange={(value) => handleInputChange("venue_id", value)}
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue placeholder="Seleccionar local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null} className="py-2.5 px-4">Sin asignar</SelectItem>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id} className="py-2.5 px-4">
                        {venue.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="h-12 px-4">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planificacion" className="py-2.5 px-4">Planificación</SelectItem>
                    <SelectItem value="confirmado" className="py-2.5 px-4">Confirmado</SelectItem>
                    <SelectItem value="completado" className="py-2.5 px-4">Completado</SelectItem>
                    <SelectItem value="cancelado" className="py-2.5 px-4">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_attendees">Máximo de Asistentes</Label>
                <Input
                  id="max_attendees"
                  type="number"
                  value={formData.max_attendees}
                  onChange={(e) => handleInputChange("max_attendees", e.target.value)}
                  placeholder="Ej: 100"
                  className="h-12 px-4"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descripción del evento..."
                rows={4}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">
                Estado de Preparativos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {preparationFields.map(({ key, label }) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Select
                      value={formData.preparations[key]}
                      onValueChange={(value) => handlePreparationChange(key, value)}
                    >
                      <SelectTrigger className="h-12 px-4">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {preparationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value} className="py-2.5 px-4">
                            <div className={`px-2 py-1 rounded text-sm ${option.color}`}>
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
              <Label htmlFor="notes">Notas Adicionales</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Notas internas del evento..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 text-base">
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 h-12 px-8 text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                {event ? "Actualizar" : "Crear"} Thinkglao
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
