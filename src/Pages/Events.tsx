
import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
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
    status: "active",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [defaultDate, setDefaultDate] = useState(null);
  const { selectedCity } = useContext(AppContext);
  const [searchParams, setSearchParams] = useSearchParams();

  // Abrir modal si viene de calendario con ?new=true
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      const month = searchParams.get("month");
      const year = searchParams.get("year");
      if (month && year) {
        // Crear fecha para el día 15 del mes seleccionado
        const date = new Date(parseInt(year), parseInt(month), 15);
        setDefaultDate(date.toISOString().slice(0, 10));
      }
      setShowForm(true);
      // Limpiar los parámetros de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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

      // Actualizar automáticamente los eventos pasados a "completado"
      const now = new Date();
      const eventsToUpdate = eventsData.filter((event: any) => {
        const eventDate = new Date(event.date);
        // Si la fecha ya pasó y el estado no es "completado" ni "cancelado"
        return eventDate < now && event.status !== "completado" && event.status !== "cancelado";
      });

      // Actualizar cada evento pasado a "completado"
      if (eventsToUpdate.length > 0) {
        await Promise.all(
          eventsToUpdate.map((event: any) =>
            Event.update(event.id, { status: "completado" })
          )
        );
        // Recargar los eventos con los estados actualizados
        const updatedEventsData = await Event.list("-date");
        setEvents(updatedEventsData);
      } else {
        setEvents(eventsData);
      }

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

  const handleDelete = async (eventId) => {
    try {
      await Event.delete(eventId);
      loadData();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  const filteredEvents = events.filter(event => {
    let statusMatch = false;
    if (filters.status === "all") {
      statusMatch = true;
    } else if (filters.status === "active") {
      // Mostrar todos excepto completados
      statusMatch = event.status !== "completado";
    } else {
      statusMatch = event.status === filters.status;
    }
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
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Gestión de Thinkglaos</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
            Organiza y supervisa todos tus Thinkglaos desde un solo lugar
          </p>
        </div>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Nuevo Thinkglao
        </Button>
      </div>

      <EventForm
        event={editingEvent}
        speakers={speakers}
        venues={venues}
        cities={cities}
        selectedCity={selectedCity}
        defaultDate={defaultDate}
        isOpen={showForm}
        onClose={handleCancel}
        onSubmit={handleSubmit}
      />

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
        onDelete={handleDelete}
      />
    </div>
  );
}
