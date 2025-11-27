import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface CityFormProps {
  city?: any;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}

export default function CityForm({ city, isOpen, onClose, onSubmit }: CityFormProps) {
  const [formData, setFormData] = useState({
    name: city?.name || "",
    country: city?.country || "",
    region: city?.region || "",
    active: city?.active !== undefined ? city.active : true
  });

  // Reset form when city changes
  React.useEffect(() => {
    setFormData({
      name: city?.name || "",
      country: city?.country || "",
      region: city?.region || "",
      active: city?.active !== undefined ? city.active : true
    });
  }, [city, isOpen]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-6 h-6 text-emerald-600" />
            {city ? "Editar Ciudad" : "Nueva Ciudad"}
          </DialogTitle>
          <DialogDescription>
            {city ? "Modifica los datos de la ciudad" : "Completa los datos para crear una nueva ciudad"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Ciudad *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Madrid"
                required
                className="text-lg h-12 px-4"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">País *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                placeholder="España"
                required
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>

            <div className="space-y-2 lg:col-span-2">
              <Label htmlFor="region">Región/Estado</Label>
              <Input
                id="region"
                value={formData.region}
                onChange={(e) => handleInputChange("region", e.target.value)}
                placeholder="Comunidad de Madrid"
                className="h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => handleInputChange("active", e.target.checked)}
              className="rounded h-5 w-5"
            />
            <Label htmlFor="active" className="text-base">Ciudad activa</Label>
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} className="h-11 sm:h-12 px-6 sm:px-8 text-base">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 h-12 px-8 text-base"
            >
              <Save className="w-4 h-4 mr-2" />
              {city ? "Actualizar" : "Crear"} Ciudad
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
