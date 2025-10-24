import React, { useState, useEffect, useContext } from "react";
import { base44 } from "@/api/base44Client";
import { AppContext } from "@/components/AppContextProvider";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User, MapPin, Calendar as CalendarDaysIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Calendario del Curso</h1>
        <p className="text-slate-600 mt-2">
          Vista anual de todos los Thinkglaos programados de Septiembre a Junio.
        </p>
      </div>
      
      <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-xl border border-slate-200/80 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={prevYear}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 w-48 text-center">
              Curso {academicYear}-{academicYear + 1}
            </h2>
            <Button variant="outline" size="icon" onClick={nextYear}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={goToCurrentAcademicYear} className="mt-4 sm:mt-0">
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

              return (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl border border-slate-200 shadow-md flex flex-col"
                >
                  <h3 className="font-bold text-lg text-slate-800 p-4 border-b border-slate-200 capitalize">
                    {name}
                  </h3>
                  <div className="p-4 space-y-3 flex-1 overflow-auto min-h-[150px] bg-slate-50/50">
                    {monthEvents.length > 0 ? (
                      monthEvents.map(event => {
                        const speaker = getSpeaker(event.speaker_id);
                        const city = getCity(event.city_id);
                        return (
                          <div key={event.id} className="bg-white border border-slate-200 rounded-lg p-3 text-sm shadow-sm">
                            <div className="flex justify-between items-start gap-2">
                              <p className="font-bold text-blue-800 truncate flex-1">
                                {speaker?.name || "Sin ponente"}
                              </p>
                              <span className="font-bold text-blue-700 bg-blue-100 rounded-md h-7 w-7 flex items-center justify-center text-xs flex-shrink-0">
                                {format(parseISO(event.date), "d")}
                              </span>
                            </div>
                            {city && (
                              <p className="text-slate-600 truncate flex items-center gap-1.5 text-xs mt-1">
                                <MapPin className="w-3 h-3 flex-shrink-0 text-emerald-500" />
                                {city.name}
                              </p>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-slate-400 text-sm h-full flex flex-col items-center justify-center">
                        <CalendarDaysIcon className="w-8 h-8 mb-2"/>
                        <span>Sin Thinkglaos</span>
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
