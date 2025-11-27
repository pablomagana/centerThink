import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, X } from "lucide-react";
// @ts-ignore
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface VenueFormProps {
  venue?: any;
  cities: Array<{ id: string; name: string }>;
  selectedCity?: { id: string; name: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function VenueForm({ venue, cities, selectedCity, isOpen, onClose, onSubmit }: VenueFormProps) {
  const [formData, setFormData] = useState({
    name: venue?.name || "",
    address: venue?.address || "",
    city_id: venue?.city_id || selectedCity?.id || "",
    capacity: venue?.capacity || "",
    contact_name: venue?.contact_name || "",
    contact_phone: venue?.contact_phone || "",
    contact_email: venue?.contact_email || "",
    notes: venue?.notes || "",
    active: venue?.active !== undefined ? venue.active : true
  });

  // Reset form when venue changes
  React.useEffect(() => {
    setFormData({
      name: venue?.name || "",
      address: venue?.address || "",
      city_id: venue?.city_id || selectedCity?.id || "",
      capacity: venue?.capacity || "",
      contact_name: venue?.contact_name || "",
      contact_phone: venue?.contact_phone || "",
      contact_email: venue?.contact_email || "",
      notes: venue?.notes || "",
      active: venue?.active !== undefined ? venue.active : true
    });
  }, [venue, selectedCity, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      capacity: formData.capacity ? parseInt(formData.capacity as string) : null
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="w-6 h-6 text-orange-600" />
            {venue ? "Editar Local" : "Nuevo Local"}
          </DialogTitle>
          <DialogDescription>
            {venue ? "Modifica los datos del local" : "Completa los datos para crear un nuevo local"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Local *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("name", e.target.value)}
                placeholder="Ej: Auditorio Central"
                required
                className="text-lg h-12 px-4"
              />
            </div>

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
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="address">Dirección *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("address", e.target.value)}
                placeholder="Calle Falsa 123, 28080 Madrid"
                required
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("capacity", e.target.value)}
                placeholder="Ej: 250"
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-900 col-span-1 lg:col-span-2 pt-6 border-t">
            Información de Contacto
          </h3>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Nombre de Contacto</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("contact_name", e.target.value)}
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Teléfono de Contacto</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("contact_phone", e.target.value)}
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email de Contacto</Label>
              <Input
                id="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("contact_email", e.target.value)}
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="space-y-2 pt-6 border-t">
            <Label htmlFor="notes">Notas Adicionales</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("notes", e.target.value)}
              placeholder="Notas internas sobre el local..."
              rows={3}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("active", e.target.checked)}
              className="rounded h-5 w-5"
            />
            <Label htmlFor="active" className="text-base">Local activo</Label>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 sm:h-12 px-6 sm:px-8 text-base">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-12 px-8 text-base"
            >
              <Save className="w-4 h-4 mr-2" />
              {venue ? "Actualizar" : "Crear"} Local
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
