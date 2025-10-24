import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MapPin, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function CityForm({ city, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: city?.name || "",
    country: city?.country || "",
    region: city?.region || "",
    active: city?.active !== undefined ? city.active : true
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <MapPin className="w-6 h-6 text-emerald-600" />
            {city ? "Editar Ciudad" : "Nueva Ciudad"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  className="h-12 px-4"
                />
              </div>

              <div className="space-y-2 lg:col-span-2">
                <Label htmlFor="region">Región/Estado</Label>
                <Input
                  id="region"
                  value={formData.region}
                  onChange={(e) => handleInputChange("region", e.target.value)}
                  placeholder="Comunidad de Madrid"
                  className="h-12 px-4"
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

            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onCancel} className="h-12 px-8 text-base">
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
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
