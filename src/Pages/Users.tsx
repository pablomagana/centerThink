
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { User } from "@/entities/user.js";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import UsersList from "../components/users/UsersList";
import UserCreateForm from "../components/users/UserCreateForm";
import {
  Dialog,
  DialogContent,
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
import { useAuth } from "@/contexts/AuthContext";
import { emailService } from "@/services/email.service";

export default function UsersPage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [cities, setCities] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, citiesData] = await Promise.all([
        User.list(),
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
        await User.update(editingUser.id, updateData);

        setShowDialog(false);
        setEditingUser(null);
        await loadData();
      } else {
        // Modo creación: llamar a Edge Function
        const result = await User.createComplete(userData);

        // Intentar enviar email con credenciales
        try {
          await emailService.sendUserCredentials({
            toEmail: userData.email,
            userName: `${userData.first_name} ${userData.last_name}`,
            tempPassword: result.tempPassword,
            creatorName: `${profile.first_name} ${profile.last_name}`
          });

          // Éxito: email enviado
          alert(
            `Usuario creado exitosamente!\n\n` +
            `Se ha enviado un email a ${userData.email} con las credenciales de acceso.`
          );

        } catch (emailError) {
          // Usuario creado pero email falló - mostrar contraseña manualmente
          console.error("Error enviando email:", emailError);

          alert(
            `Usuario creado exitosamente, pero no se pudo enviar el email automático.\n\n` +
            `Por favor, comunica estas credenciales manualmente:\n\n` +
            `Email: ${userData.email}\n` +
            `Contraseña temporal: ${result.tempPassword}\n\n` +
            `El usuario debe cambiar su contraseña después del primer inicio de sesión.`
          );
        }

        setShowDialog(false);
        await loadData();
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

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    try {
      // Usar deleteComplete para eliminar tanto de auth.users como de user_profiles
      await User.deleteComplete(userToDelete.id);
      setShowDeleteDialog(false);
      setUserToDelete(null);
      await loadData();
      alert("Usuario eliminado exitosamente de auth y perfiles");
    } catch (error) {
      console.error("Error deleting user:", error);
      alert(`Error al eliminar el usuario: ${error.message}\nPor favor, intenta de nuevo.`);
    }
  };

  const cancelDelete = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
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
        onDelete={handleDelete}
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario{" "}
              <strong>
                {userToDelete?.first_name} {userToDelete?.last_name}
              </strong>
              ? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
