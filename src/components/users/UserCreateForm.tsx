import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, X, Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface UserCreateFormProps {
  user?: any; // Si existe, es modo edición
  cities: Array<{ id: string; name: string; country: string }>;
  currentUserRole: string;
  currentUserCities: string[];
  onSubmit: (userData: any) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

export default function UserCreateForm({
  user,
  cities,
  currentUserRole,
  currentUserCities,
  onSubmit,
  onCancel,
  isSubmitting,
  error
}: UserCreateFormProps) {
  const isEditMode = !!user;

  const [formData, setFormData] = useState({
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    role: user?.role || "user",
    phone: user?.phone || "",
    cities: user?.cities || [] as string[]
  });

  // Filtrar ciudades disponibles según el rol del usuario actual
  const availableCities = currentUserRole === "admin"
    ? cities
    : cities.filter(city => currentUserCities.includes(city.id));

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCityToggle = (cityId: string) => {
    setFormData(prev => {
      const cities = prev.cities.includes(cityId)
        ? prev.cities.filter(id => id !== cityId)
        : [...prev.cities, cityId];
      return { ...prev, cities };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const selectedCities = availableCities.filter(city => formData.cities.includes(city.id));

  const roleOptions = [
    {
      value: "user",
      label: "Usuario",
      badge: "bg-blue-100 text-blue-700",
      description: "Acceso operativo"
    },
    {
      value: "supplier",
      label: "Suministrador",
      badge: "bg-purple-100 text-purple-700",
      description: "Gestiona usuarios/ciudades"
    },
    {
      value: "admin",
      label: "Admin",
      badge: "bg-red-100 text-red-700",
      description: "Acceso total"
    }
  ];

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
        </DialogTitle>
        <DialogDescription>
          {isEditMode
            ? "Modifica los datos del usuario. El email no puede ser modificado."
            : "Completa los datos para crear un nuevo usuario. Se enviará un email con una contraseña temporal automáticamente."
          }
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Email - Full width */}
          <div className="space-y-2 lg:col-span-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              disabled={isSubmitting || isEditMode}
              className="h-12 px-4"
            />
            {isEditMode && (
              <p className="text-xs text-slate-500">El email no puede ser modificado</p>
            )}
          </div>

          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="first_name">
              Nombre <span className="text-red-500">*</span>
            </Label>
            <Input
              id="first_name"
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange("first_name", e.target.value)}
              placeholder="Juan"
              required
              disabled={isSubmitting}
              className="h-12 px-4"
              minLength={2}
            />
          </div>

          {/* Apellidos */}
          <div className="space-y-2">
            <Label htmlFor="last_name">
              Apellidos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="last_name"
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange("last_name", e.target.value)}
              placeholder="García López"
              required
              disabled={isSubmitting}
              className="h-12 px-4"
              minLength={2}
            />
          </div>

          {/* Rol */}
          <div className="space-y-2">
            <Label htmlFor="role">
              Rol <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => handleInputChange("role", value)}
              disabled={isSubmitting}
              required
            >
              <SelectTrigger className="h-12 px-4">
                <SelectValue placeholder="Seleccionar rol..." />
              </SelectTrigger>
              <SelectContent>
                {roleOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Badge className={option.badge}>{option.label}</Badge>
                      <span className="text-sm text-slate-500">- {option.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+34 600 000 000"
              disabled={isSubmitting}
              className="h-12 px-4"
            />
          </div>

          {/* Ciudades - Full width */}
          <div className="space-y-2 lg:col-span-2">
            <Label>
              Ciudades Asignadas
              {currentUserRole === "supplier" && (
                <span className="text-xs text-slate-500 ml-2">
                  (Solo puedes asignar tus ciudades)
                </span>
              )}
            </Label>
            <div className="border rounded-md p-4 bg-slate-50">
              {availableCities.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableCities.map((city) => (
                    <label
                      key={city.id}
                      className="flex items-center space-x-2 p-3 rounded-md hover:bg-white cursor-pointer transition-colors border border-transparent hover:border-slate-200 hover:shadow-sm"
                    >
                      <input
                        type="checkbox"
                        checked={formData.cities.includes(city.id)}
                        onChange={() => handleCityToggle(city.id)}
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {city.name}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 text-center py-2">
                  No hay ciudades disponibles
                </p>
              )}
            </div>
            {selectedCities.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {selectedCities.map(city => (
                  <Badge key={city.id} variant="secondary" className="px-3 py-1">
                    {city.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Footer Buttons */}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 px-8 text-base"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-12 px-8 text-base"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando Usuario...
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Crear Usuario
              </>
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}
