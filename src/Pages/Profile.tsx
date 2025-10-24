import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { User } from "@/entities/User";
import { City } from "@/entities/City";
import ProfileForm from "@/components/profile/ProfileForm";
import PasswordChangeForm from "@/components/profile/PasswordChangeForm";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    try {
      const citiesData = await City.list();
      setCities(citiesData.filter(city => city.active));
    } catch (error) {
      console.error("Error loading cities:", error);
      showAlert("error", "Error al cargar las ciudades");
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ type, message });
    setTimeout(() => setAlert(null), 5000);
  };

  const handleProfileUpdate = async (formData) => {
    try {
      await User.update(profile.id, formData);
      await refreshProfile();
      showAlert("success", "Tu perfil ha sido actualizado correctamente");
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert("error", "Error al actualizar el perfil. Por favor, intenta nuevamente.");
    }
  };

  const handlePasswordChange = async (passwordData) => {
    try {
      // La lógica de cambio de contraseña está en PasswordChangeForm
      showAlert("success", "Tu contraseña ha sido cambiada correctamente");
    } catch (error) {
      console.error("Error changing password:", error);
      showAlert("error", "Error al cambiar la contraseña. Por favor, intenta nuevamente.");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Alert Messages */}
      {alert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <Alert
            className={
              alert.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            {alert.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={
                alert.type === "success" ? "text-green-800" : "text-red-800"
              }
            >
              {alert.message}
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Profile Form */}
      <ProfileForm
        profile={profile}
        cities={cities}
        onSubmit={handleProfileUpdate}
      />

      {/* Password Change Form */}
      <PasswordChangeForm onSuccess={() => showAlert("success", "Tu contraseña ha sido cambiada correctamente. Por seguridad, te recomendamos cerrar sesión y volver a iniciar.")} />
    </motion.div>
  );
}
