
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import UsersList from "../components/users/UsersList";
import UserCreateForm from "../components/users/UserCreateForm";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, citiesData] = await Promise.all([
        base44.entities.User.list(),
        base44.entities.City.list(),
      ]);
      setUsers(usersData);
      setCities(citiesData.filter(c => c.active));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (userData) => {
    setIsSubmitting(true);
    setFormError(null);

    try {
      if (editingUser) {
        // Modo edición: solo actualizar campos permitidos
        const { first_name, last_name, phone, cities, role } = userData;
        const updateData = { first_name, last_name, phone, cities, role };
        await base44.entities.User.update(editingUser.id, updateData);

        setShowDialog(false);
        setEditingUser(null);
        await loadData();
      } else {
        // Modo creación: llamar a Edge Function
        const result = await base44.entities.User.createComplete(userData);

        setShowDialog(false);
        await loadData();

        // Mostrar la contraseña temporal al administrador
        alert(
          `Usuario creado exitosamente!\n\n` +
          `Email: ${userData.email}\n` +
          `Contraseña temporal: ${result.tempPassword}\n\n` +
          `Por favor, comunica estas credenciales al usuario de forma segura.`
        );
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setFormError(error.message || "Error al guardar el usuario. Por favor, intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormError(null);
    setShowDialog(true);
  };

  const handleCreate = () => {
    setEditingUser(null);
    setFormError(null);
    setShowDialog(true);
  };

  const handleCancel = () => {
    setShowDialog(false);
    setEditingUser(null);
    setFormError(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
          <p className="text-slate-600 mt-2">
            Administra los usuarios y sus permisos en la aplicación
          </p>
        </div>
        <Button
          onClick={handleCreate}
          disabled={showDialog}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg h-12 px-8 text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Crear Usuario
        </Button>
      </div>

      <UsersList
        users={users}
        cities={cities}
        onEdit={handleEdit}
      />

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <UserCreateForm
            user={editingUser}
            cities={cities}
            currentUserRole={profile?.role || "user"}
            currentUserCities={profile?.cities || []}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
            error={formError}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
