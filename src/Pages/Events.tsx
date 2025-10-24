
import React, { useState, useEffect, useContext } from "react";
import { Event } from "@/entities/Event";
import { Speaker } from "@/entities/Speaker";
import { Venue } from "@/entities/Venue";
import { City } from "@/entities/City";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import EventsList from "../components/events/EventList";
import EventForm from "../components/events/EventForm";
import EventFilters from "../components/events/EventFilters";
import { AppContext } from "@/components/AppContextProvider";

export default function EventsPage() {
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [venues, setVenues] = useState([]);
  const [cities, setCities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [filters, setFilters] = useState({
    status: "all",
  });
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCity } = useContext(AppContext);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [eventsData, speakersData, venuesData, citiesData] = await Promise.all([
        Event.list("-date"),
        Speaker.list(),
        Venue.list(),
        City.list()
      ]);
      
      setEvents(eventsData);
      setSpeakers(speakersData.filter(s => s.active));
      setVenues(venuesData.filter(v => v.active));
      setCities(citiesData.filter(c => c.active));
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setIsLoading(false);
  };

  const handleSubmit = async (eventData) => {
    try {
      if (editingEvent) {
        await Event.update(editingEvent.id, eventData);
      } else {
        await Event.create(eventData);
      }
      setShowForm(false);
      setEditingEvent(null);
      loadData();
    } catch (error) {
      console.error("Error saving event:", error);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
  };

  const filteredEvents = events.filter(event => {
    const statusMatch = filters.status === "all" || event.status === filters.status;
    const cityMatch = selectedCity ? event.city_id === selectedCity.id : true;
    return statusMatch && cityMatch;
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
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Thinkglaos</h1>
          <p className="text-slate-600 mt-2">
            Organiza y supervisa todos tus Thinkglaos desde un solo lugar
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg h-12 px-8 text-base"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Thinkglao
        </Button>
      </div>

      {showForm && (
        <EventForm
          event={editingEvent}
          speakers={speakers}
          venues={venues}
          cities={cities}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}

      <EventFilters 
        filters={filters}
        setFilters={setFilters}
      />

      <EventsList
        events={filteredEvents}
        speakers={speakers}
        venues={venues}
        cities={cities}
        onEdit={handleEdit}
        onRefresh={loadData}
      />
    </div>
  );
}
