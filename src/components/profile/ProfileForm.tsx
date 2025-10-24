import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { User, Save, X } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfileForm({ profile, cities, onSubmit }) {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    phone: profile?.phone || "",
  });

  const [isEdited, setIsEdited] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Check if form has been edited
    const hasChanges =
      formData.first_name !== profile?.first_name ||
      formData.last_name !== profile?.last_name ||
      formData.phone !== (profile?.phone || "");
    setIsEdited(hasChanges);
  }, [formData, profile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name?.trim()) {
      newErrors.first_name = "El nombre es requerido";
    }

    if (!formData.last_name?.trim()) {
      newErrors.last_name = "Los apellidos son requeridos";
    }

    if (formData.phone && !/^[0-9\s\-\+\(\)]{9,}$/.test(formData.phone)) {
      newErrors.phone = "Formato de teléfono inválido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || "",
      last_name: profile?.last_name || "",
      phone: profile?.phone || "",
    });
    setErrors({});
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      admin: { label: "Administrador", className: "bg-purple-100 text-purple-800" },
      supplier: { label: "Suministrador", className: "bg-blue-100 text-blue-800" },
      user: { label: "Usuario", className: "bg-green-100 text-green-800" },
    };
    const config = roleConfig[role] || { label: role, className: "bg-gray-100 text-gray-800" };
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getUserCities = () => {
    if (!profile?.cities || profile.cities.length === 0) {
      return <span className="text-slate-500 text-sm">Sin ciudades asignadas</span>;
    }
    return cities
      .filter((city) => profile.cities.includes(city.id))
      .map((city) => (
        <Badge key={city.id} variant="secondary" className="bg-slate-100 text-slate-800">
          {city.name}
        </Badge>
      ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-indigo-600" />
            Información Personal
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="first_name">
                  Nombre <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => handleInputChange("first_name", e.target.value)}
                  className={`h-12 px-4 ${errors.first_name ? "border-red-500" : ""}`}
                />
                {errors.first_name && (
                  <p className="text-sm text-red-600">{errors.first_name}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="last_name">
                  Apellidos <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => handleInputChange("last_name", e.target.value)}
                  className={`h-12 px-4 ${errors.last_name ? "border-red-500" : ""}`}
                />
                {errors.last_name && (
                  <p className="text-sm text-red-600">{errors.last_name}</p>
                )}
              </div>

              {/* Email (readonly) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="h-12 px-4 bg-slate-100 text-slate-600 cursor-not-allowed"
                />
                <p className="text-xs text-slate-500">
                  El email no se puede modificar
                </p>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="Ej: +52 55 1234 5678"
                  className={`h-12 px-4 ${errors.phone ? "border-red-500" : ""}`}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
              </div>

              {/* Role (readonly) */}
              <div className="space-y-2">
                <Label>Rol</Label>
                <div className="flex items-center h-12">
                  {getRoleBadge(profile?.role)}
                </div>
                <p className="text-xs text-slate-500">
                  Solo los administradores pueden cambiar roles
                </p>
              </div>

              {/* Cities (readonly) */}
              <div className="space-y-2">
                <Label>Ciudades Asignadas</Label>
                <div className="flex items-center flex-wrap gap-2 min-h-12 py-2">
                  {getUserCities()}
                </div>
                <p className="text-xs text-slate-500">
                  Solo los administradores pueden asignar ciudades
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={!isEdited}
                className="h-12 px-8 text-base"
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isEdited}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-8 text-base"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
