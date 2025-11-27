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

  const handleDelete = async (venueId) => {
    try {
      await Venue.delete(venueId);
      loadData();
    } catch (error) {
      console.error("Error deleting venue:", error);
    }
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestión de Locales</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
            Administra la base de datos de locales para tus eventos
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-lg h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Nuevo Local
        </Button>
      </div>

      {showForm && (
        <VenueForm
          venue={editingVenue}
          cities={cities}
          selectedCity={selectedCity}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <VenuesList
        venues={filteredVenues}
        cities={cities}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
