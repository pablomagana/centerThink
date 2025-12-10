import React, { useState, useEffect, useContext, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { AppContext } from "@/components/AppContextProvider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User, MapPin, Calendar as CalendarDaysIcon, Plus, Loader2, GripVertical } from "lucide-react";
import { format, parseISO, getDaysInMonth } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { eventService } from "@/services/event.service";

// Helper para obtener el año de inicio del curso académico para una fecha dada
const getAcademicYearStart = (date) => {
  return date.getMonth() >= 8 ? date.getFullYear() : date.getFullYear() - 1; // Curso empieza en Septiembre (mes 8)
};

export default function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [cities, setCities] = useState([]);
  const [academicYear, setAcademicYear] = useState(getAcademicYearStart(new Date()));
  const [isLoading, setIsLoading] = useState(true);
  const { selectedCity } = useContext(AppContext);
  const navigate = useNavigate();

  // Estados para drag & drop
  const [draggedEvent, setDraggedEvent] = useState(null);
  const [dropTargetMonth, setDropTargetMonth] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [eventsData, speakersData, citiesData] = await Promise.all([
          base44.entities.Event.list("-date", 1000), // Increased limit for year view
          base44.entities.Speaker.list(),
          base44.entities.City.list(),
        ]);
        setEvents(eventsData);
        setSpeakers(speakersData);
        setCities(citiesData);
      } catch (error) {
        console.error("Error loading calendar data:", error);
      }
      setIsLoading(false);
    };
    loadData();
  }, []);

  const nextYear = () => setAcademicYear(prev => prev + 1);
  const prevYear = () => setAcademicYear(prev => prev - 1);
  const goToCurrentAcademicYear = () => setAcademicYear(getAcademicYearStart(new Date()));

  const filteredEvents = events.filter(event => {
    return selectedCity ? event.city_id === selectedCity.id : true;
  });

  const getSpeaker = (speakerId) => speakers.find(s => s.id === speakerId);
  const getCity = (cityId) => cities.find(c => c.id === cityId);

  const academicMonths = [
    { month: 8, name: "Septiembre" }, { month: 9, name: "Octubre" },
    { month: 10, name: "Noviembre" }, { month: 11, name: "Diciembre" },
    { month: 0, name: "Enero" }, { month: 1, name: "Febrero" },
    { month: 2, name: "Marzo" }, { month: 3, name: "Abril" },
    { month: 4, name: "Mayo" }, { month: 5, name: "Junio" }
  ];

  // Funciones para Drag & Drop
  const handleDragStart = useCallback((e, event) => {
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', event.id);
    // Añadir clase al elemento arrastrado
    e.currentTarget.classList.add('opacity-50');
  }, []);

  const handleDragEnd = useCallback((e) => {
    setDraggedEvent(null);
    setDropTargetMonth(null);
    e.currentTarget.classList.remove('opacity-50');
  }, []);

  const handleDragOver = useCallback((e, month, year) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetMonth({ month, year });
  }, []);

  const handleDragLeave = useCallback((e) => {
    // Solo limpiar si realmente salimos del contenedor
    const relatedTarget = e.relatedTarget;
    if (!e.currentTarget.contains(relatedTarget)) {
      setDropTargetMonth(null);
    }
  }, []);

  const handleDrop = useCallback(async (e, targetMonth, targetYear) => {
    e.preventDefault();
    setDropTargetMonth(null);

    if (!draggedEvent || isUpdating) return;

    // Obtener la fecha actual del evento
    const currentDate = parseISO(draggedEvent.date);
    const currentDay = currentDate.getDate();

    // Verificar si el evento ya está en el mes destino
    if (currentDate.getMonth() === targetMonth && currentDate.getFullYear() === targetYear) {
      setDraggedEvent(null);
      return;
    }

    // Calcular el máximo de días en el mes destino
    const maxDaysInTargetMonth = getDaysInMonth(new Date(targetYear, targetMonth, 1));

    // Usar el día actual o el último día del mes si excede
    const newDay = Math.min(currentDay, maxDaysInTargetMonth);

    // Crear la nueva fecha en formato YYYY-MM-DD
    const newDate = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}-${String(newDay).padStart(2, '0')}`;

    // Guardar estado anterior para rollback
    const previousEvents = [...events];

    // Optimistic update
    setEvents(prev => prev.map(ev =>
      ev.id === draggedEvent.id ? { ...ev, date: newDate } : ev
    ));

    setIsUpdating(true);

    try {
      await eventService.update(draggedEvent.id, { date: newDate });
      // Recargar datos para asegurar consistencia
      const eventsData = await base44.entities.Event.list("-date", 1000);
      setEvents(eventsData);
    } catch (error) {
      console.error("Error moving event:", error);
      // Rollback
      setEvents(previousEvents);
      alert("Error al mover el Thinkglao. Por favor, inténtalo de nuevo.");
    } finally {
      setIsUpdating(false);
      setDraggedEvent(null);
    }
  }, [draggedEvent, events, isUpdating]);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Calendario del Curso</h1>
        <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
          Vista anual de todos los Thinkglaos programados de Septiembre a Junio.
          <span className="text-xs text-slate-400 ml-2">(Arrastra los eventos para moverlos entre meses)</span>
        </p>
      </div>

      {/* Indicador de actualización */}
      {isUpdating && (
        <div className="fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Moviendo Thinkglao...</span>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-slate-200/80 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevYear} className="h-10 w-10 sm:h-11 sm:w-11">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-800 w-44 sm:w-48 text-center">
              Curso {academicYear}-{academicYear + 1}
            </h2>
            <Button variant="outline" size="icon" onClick={nextYear} className="h-10 w-10 sm:h-11 sm:w-11">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={goToCurrentAcademicYear} className="w-full sm:w-auto h-10 sm:h-11 text-sm sm:text-base">
            Curso Actual
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {academicMonths.map(({ month, name }, index) => {
              const year = month >= 8 ? academicYear : academicYear + 1;
              const monthEvents = filteredEvents
                .filter(event => {
                  const eventDate = parseISO(event.date);
                  return eventDate.getMonth() === month && eventDate.getFullYear() === year;
                })
                .sort((a, b) => parseISO(a.date) - parseISO(b.date));

              const isDropTarget = dropTargetMonth?.month === month && dropTargetMonth?.year === year;

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`bg-white rounded-xl border-2 shadow-md flex flex-col transition-all duration-200 ${
                    isDropTarget
                      ? 'border-blue-400 bg-blue-50/50 ring-2 ring-blue-200'
                      : 'border-slate-200'
                  }`}
                  onDragOver={(e) => handleDragOver(e, month, year)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, month, year)}
                >
                  <div className="flex items-center justify-between p-4 border-b border-slate-200">
                    <h3 className="font-bold text-lg text-slate-800 capitalize">
                      {name}
                    </h3>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => navigate(`/events?new=true&month=${month}&year=${year}`)}
                      title={`Crear Thinkglao en ${name}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className={`p-4 space-y-3 flex-1 overflow-auto min-h-[150px] transition-colors duration-200 ${
                    isDropTarget ? 'bg-blue-50/30' : 'bg-slate-50/50'
                  }`}>
                    {monthEvents.length > 0 ? (
                      monthEvents.map(event => {
                        const speaker = getSpeaker(event.speaker_id);
                        const city = getCity(event.city_id);
                        const isDragging = draggedEvent?.id === event.id;
                        return (
                          <div
                            key={event.id}
                            draggable={!isUpdating}
                            onDragStart={(e) => handleDragStart(e, event)}
                            onDragEnd={handleDragEnd}
                            className={`bg-white border border-slate-200 rounded-lg p-3 text-sm shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all duration-150 select-none ${
                              isDragging ? 'opacity-50 scale-95' : ''
                            } ${isUpdating ? 'pointer-events-none' : ''}`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                <p className="font-bold text-blue-800 truncate">
                                  {speaker?.name || "Sin ponente"}
                                </p>
                              </div>
                              <span className="font-bold text-blue-700 bg-blue-100 rounded-md h-7 w-7 flex items-center justify-center text-xs flex-shrink-0">
                                {format(parseISO(event.date), "d")}
                              </span>
                            </div>
                            {city && (
                              <p className="text-slate-600 truncate flex items-center gap-1.5 text-xs mt-1 ml-6">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                                {city.name}
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className={`text-center text-sm h-full flex flex-col items-center justify-center ${
                        isDropTarget ? 'text-blue-500' : 'text-slate-400'
                      }`}>
                        <CalendarDaysIcon className="w-8 h-8 mb-2"/>
                        <span>{isDropTarget ? 'Soltar aquí' : 'Sin Thinkglaos'}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
