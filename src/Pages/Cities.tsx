import React, { useState, useEffect } from "react";
import { City } from "@/entities/City";
import { Event } from "@/entities/Event";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import CitiesList from "../components/cities/CityList";
import CityForm from "../components/cities/CityForm";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setIsLoading(true);
    try {
      const data = await City.list("-created_at");
      setCities(data);
    } catch (error) {
      console.error("Error loading cities:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (cityData) => {
    try {
      if (editingCity) {
        await City.update(editingCity.id, cityData);
      } else {
        await City.create(cityData);
      }
      setShowForm(false);
      setEditingCity(null);
      loadCities();
    } catch (error) {
      console.error("Error saving city:", error);
    }
  };

  const handleEdit = (city) => {
    setEditingCity(city);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCity(null);
  };

  const handleDelete = async (cityId) => {
    try {
      setErrorMessage(null);

      // Verificar si la ciudad tiene eventos asociados
      const allEvents = await Event.list();
      const cityEvents = allEvents.filter(event => event.city_id === cityId);

      if (cityEvents.length > 0) {
        setErrorMessage(
          `No se puede eliminar la ciudad porque tiene ${cityEvents.length} evento(s) asociado(s). Elimina o reasigna los eventos primero.`
        );
        return;
      }

      // Si no hay eventos, proceder con la eliminación
      await City.delete(cityId);
      loadCities();
    } catch (error) {
      console.error("Error deleting city:", error);
      setErrorMessage("Error al eliminar la ciudad. Por favor intenta de nuevo.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestión de Ciudades</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
            Configura las ciudades donde opera tu organización
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Nueva Ciudad
        </Button>
      </div>

      <CityForm
        city={editingCity}
        isOpen={showForm}
        onClose={handleCancel}
        onSubmit={handleSubmit}
      />

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <CitiesList
        cities={cities}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
