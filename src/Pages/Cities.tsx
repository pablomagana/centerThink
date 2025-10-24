import React, { useState, useEffect } from "react";
import { City } from "@/entities/City";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import CitiesList from "../components/cities/CityList";
import CityForm from "../components/cities/CityForm";

export default function CitiesPage() {
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCity, setEditingCity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCities();
  }, []);

  const loadCities = async () => {
    setIsLoading(true);
    try {
      const data = await City.list("-created_date");
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
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Ciudades</h1>
          <p className="text-slate-600 mt-2">
            Configura las ciudades donde opera tu organización
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg h-12 px-8 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nueva Ciudad
        </Button>
      </div>

      {showForm && (
        <CityForm
          city={editingCity}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <CitiesList
        cities={cities}
        onEdit={handleEdit}
      />
    </div>
  );
}
