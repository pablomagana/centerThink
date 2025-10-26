import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, X, Loader2, KeyRound, Mail, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/entities/User.js";
import { Alert, AlertDescription } from "@/components/ui/alert";

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

  // Estados para reseteo de contraseña
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetMethod, setResetMethod] = useState<'manual' | 'email' | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);

  // Estados para verificación de email
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null);

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

  const handlePasswordReset = async () => {
    if (!user?.id) return;

    setIsResetting(true);
    setResetSuccess(null);

    try {
      if (resetMethod === 'email') {
        // Enviar email de recuperación
        await User.sendPasswordResetEmail(user.id);
        setResetSuccess(`Email de recuperación enviado a ${user.email}`);
        setShowPasswordReset(false);
        setResetMethod(null);
      } else if (resetMethod === 'manual' && newPassword) {
        // Establecer contraseña manualmente
        if (newPassword.length < 6) {
          alert("La contraseña debe tener al menos 6 caracteres");
          return;
        }
        await User.resetPassword(user.id, newPassword);
        setResetSuccess(`Contraseña actualizada exitosamente`);
        setShowPasswordReset(false);
        setResetMethod(null);
        setNewPassword("");
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!user?.id) return;

    if (!confirm(`¿Verificar manualmente el email de ${user.first_name} ${user.last_name}?`)) {
      return;
    }

    setIsVerifying(true);
    setVerificationSuccess(null);

    try {
      await User.verifyUserEmail(user.id);
      setVerificationSuccess(`Email verificado exitosamente para ${user.email}`);
      // Actualizar el estado local del usuario
      if (user) {
        user.email_verified = true;
      }
    } catch (error: any) {
      alert(`Error al verificar email: ${error.message}`);
    } finally {
      setIsVerifying(false);
    }
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
            <div className="flex gap-2 items-start">
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
                disabled={isSubmitting || isEditMode}
                className="h-12 px-4 flex-1"
              />
              {isEditMode && user && (
                <div className="flex items-center gap-2">
                  {user.email_verified ? (
                    <Badge className="bg-green-100 text-green-700 h-12 px-4 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Verificado
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleVerifyEmail}
                      disabled={isSubmitting || isVerifying}
                      className="h-12 px-4 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Verificar Email
                        </>
                      )}
                    </Button>
                  )}
                </div>
              )}
            </div>
            {isEditMode && !user?.email_verified && (
              <p className="text-xs text-orange-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                Este usuario aún no ha verificado su email
              </p>
            )}
            {isEditMode && user?.email_verified && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Email verificado
              </p>
            )}
            {verificationSuccess && (
              <p className="text-xs text-green-600">{verificationSuccess}</p>
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

        {/* Password Reset Section - Solo en modo edición */}
        {isEditMode && (
          <div className="border-t pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Resetear Contraseña</h3>
                  <p className="text-sm text-slate-600">
                    Establece una nueva contraseña o envía un email de recuperación al usuario
                  </p>
                </div>
              </div>

              {resetSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700">{resetSuccess}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setResetMethod('manual');
                    setShowPasswordReset(true);
                  }}
                  disabled={isSubmitting || isResetting}
                  className="h-12 justify-start"
                >
                  <KeyRound className="w-4 h-4 mr-2" />
                  Establecer Nueva Contraseña
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={async () => {
                    if (confirm(`¿Enviar email de recuperación a ${user?.email}?`)) {
                      setResetMethod('email');
                      setIsResetting(true);
                      setResetSuccess(null);
                      try {
                        await User.sendPasswordResetEmail(user?.id);
                        setResetSuccess(`Email de recuperación enviado a ${user?.email}`);
                      } catch (error: any) {
                        alert(`Error: ${error.message}`);
                      } finally {
                        setIsResetting(false);
                        setResetMethod(null);
                      }
                    }
                  }}
                  disabled={isSubmitting || isResetting}
                  className="h-12 justify-start"
                >
                  {isResetting && resetMethod === 'email' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Mail className="w-4 h-4 mr-2" />
                  )}
                  Enviar Email de Recuperación
                </Button>
              </div>
            </div>
          </div>
        )}

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

      {/* Modal para establecer contraseña manualmente */}
      <AlertDialog open={showPasswordReset && resetMethod === 'manual'} onOpenChange={setShowPasswordReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Establecer Nueva Contraseña</AlertDialogTitle>
            <AlertDialogDescription>
              Ingresa una nueva contraseña para {user?.first_name} {user?.last_name}.
              La contraseña debe tener al menos 6 caracteres.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nueva Contraseña</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 px-4 pr-12"
                  autoComplete="new-password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-slate-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-slate-500" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-slate-500">
                {newPassword.length > 0 && newPassword.length < 6 && (
                  <span className="text-red-600">La contraseña debe tener al menos 6 caracteres</span>
                )}
                {newPassword.length >= 6 && (
                  <span className="text-green-600">Contraseña válida</span>
                )}
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowPasswordReset(false);
                setResetMethod(null);
                setNewPassword("");
              }}
              disabled={isResetting}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePasswordReset}
              disabled={isResetting || newPassword.length < 6}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" />
                  Establecer Contraseña
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
