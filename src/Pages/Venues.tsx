import React, { useState, useEffect, useContext } from "react";
import { Venue } from "@/entities/Venue";
import { City } from "@/entities/City";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import VenuesList from "../components/venues/VenueList";
import VenueForm from "../components/venues/VenueForm";
import { AppContext } from "@/components/AppContextProvider";

export default function VenuesPage() {
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCity } = useContext(AppContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [venuesData, citiesData] = await Promise.all([
        Venue.list("-created_at"),
        City.list()
      ]);
      setVenues(venuesData);
      setCities(citiesData.filter(c => c.active));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (venueData) => {
    try {
      if (editingVenue) {
        await Venue.update(editingVenue.id, venueData);
      } else {
        await Venue.create(venueData);
      }
      setShowForm(false);
      setEditingVenue(null);
      loadData();
    } catch (error) {
      console.error("Error saving venue:", error);
    }
  };

  const handleEdit = (venue) => {
    setEditingVenue(venue);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVenue(null);
  };

  const filteredVenues = venues.filter(venue => {
    return selectedCity ? venue.city_id === selectedCity.id : true;
  });

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
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Locales</h1>
          <p className="text-slate-600 mt-2">
            Administra la base de datos de locales para tus eventos
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg h-12 px-8 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Local
        </Button>
      </div>

      {showForm && (
        <VenueForm
          venue={editingVenue}
          cities={cities}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <VenuesList
        venues={filteredVenues}
        cities={cities}
        onEdit={handleEdit}
      />
    </div>
  );
}
