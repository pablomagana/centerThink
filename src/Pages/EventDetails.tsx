
import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Event } from '@/entities/Event';
import { Speaker } from '@/entities/Speaker';
import { Venue } from '@/entities/Venue';
import { City } from '@/entities/City';
import { User } from '@/entities/User';
import { AppContext } from '@/components/AppContextProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { UserCheck, Clock, Users, Calendar, MapPin as MapPinIcon, Mic, Building2, Info, ListChecks, CheckSquare, Video, Image, TrainFront, BedDouble, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function EventDetailsPage() {
    const { id: eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [relatedData, setRelatedData] = useState({ speaker: null, venue: null, city: null, volunteers: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [arrivalTime, setArrivalTime] = useState('');
    const [isConfirming, setIsConfirming] = useState(false);
    const { currentUser } = useContext(AppContext);

    const loadData = async () => {
        setIsLoading(true);
        if (!eventId) {
            setIsLoading(false);
            return;
        }

        try {
            const eventData = await Event.get(eventId);
            setEvent(eventData);

            let allUsers = [];
            // Por seguridad, solo los admins pueden listar todos los usuarios.
            // Los voluntarios solo pueden verse a sí mismos.
            if(currentUser?.role === 'admin') {
                allUsers = await User.list();
            } else if (currentUser) {
                // Para el voluntario, solo cargamos su propio usuario para mostrar su nombre.
                allUsers = [currentUser];
            }

            const [speaker, venue, city] = await Promise.all([
                eventData.speaker_id ? Speaker.get(eventData.speaker_id) : null,
                eventData.venue_id ? Venue.get(eventData.venue_id) : null,
                eventData.city_id ? City.get(eventData.city_id) : null,
            ]);

            const volunteerDetails = (eventData.confirmed_volunteers || []).map(v => {
                const user = allUsers.find(u => u.id === v.user_id);
                // Si el usuario no se encuentra (porque el voluntario no tiene permisos para verlo),
                // al menos mostramos si es el usuario actual.
                if (user) {
                    return {
                        ...v,
                        name: `${user.first_name} ${user.last_name}`,
                    };
                }
                if(v.user_id === currentUser?.id) {
                     return {
                        ...v,
                        name: `${currentUser.first_name} ${currentUser.last_name}`,
                    };
                }
                // Para otros voluntarios que no podemos ver, mostramos un nombre genérico.
                return { ...v, name: 'Voluntario Confirmado' };
            }).sort((a,b) => a.arrival_time.localeCompare(b.arrival_time));
            
            setRelatedData({ speaker, venue, city, volunteers: volunteerDetails });

        } catch (error) {
            console.error("Error loading event details:", error);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [currentUser]); // Added currentUser to dependencies to re-load data if user changes

    const handleConfirmAssistance = async () => {
        if (!arrivalTime || !currentUser || !event) return;

        setIsConfirming(true);
        const newVolunteer = { user_id: currentUser.id, arrival_time: arrivalTime };

        // Avoid duplicates
        const existingVolunteers = event.confirmed_volunteers.filter(v => v.user_id !== currentUser.id);

        const updatedVolunteers = [...existingVolunteers, newVolunteer];

        try {
            await Event.update(event.id, { confirmed_volunteers: updatedVolunteers });
            await loadData(); // Reload data to show the new confirmation
        } catch (error) {
            console.error("Error confirming assistance:", error);
        }
        setIsConfirming(false);
    };

    const handleCancelAssistance = async () => {
      if (!currentUser || !event) return;
      setIsConfirming(true);
      const updatedVolunteers = event.confirmed_volunteers.filter(v => v.user_id !== currentUser.id);
      try {
            await Event.update(event.id, { confirmed_volunteers: updatedVolunteers });
            await loadData(); // Reload data
        } catch (error) {
            console.error("Error canceling assistance:", error);
        }
      setIsConfirming(false);
    }

    const isCurrentUserConfirmed = currentUser && relatedData.volunteers.some(v => v.user_id === currentUser.id);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!event) {
        return <div className="text-center py-12">No se encontró el evento.</div>;
    }

    const eventTitle = relatedData.speaker 
        ? `Thinkglao con ${relatedData.speaker.name}`
        : `Thinkglao del ${format(new Date(event.date), "PPP", { locale: es })}`;
    
    const preparationStatusConfig = {
      pendiente: { label: "Pendiente", color: "bg-amber-100 text-amber-700", icon: Clock },
      procesando: { label: "Procesando", color: "bg-blue-100 text-blue-700", icon: Loader2 },
      resuelto: { label: "Resuelto", color: "bg-emerald-100 text-emerald-700", icon: CheckSquare },
    };

    const preparationItems = [
      { key: 'accommodation', label: 'Alojamiento', icon: BedDouble },
      { key: 'transport', label: 'Transporte', icon: TrainFront },
      { key: 'poster_image', label: 'Cartel', icon: Image },
      { key: 'presentation_video', label: 'Vídeo Presentación', icon: Video },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">{eventTitle}</h1>
                <p className="text-slate-600 mt-2">
                    Detalles del evento y coordinación de voluntarios.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><Info className="w-5 h-5 text-blue-600"/>Información General</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="flex items-start gap-3"><Calendar className="w-4 h-4 mt-1 text-slate-500"/><div><p className="font-semibold text-slate-800">Fecha y Hora</p><p>{format(new Date(event.date), "eeee, dd MMMM yyyy 'a las' HH:mm", { locale: es })}</p></div></div>
                            <div className="flex items-start gap-3"><MapPinIcon className="w-4 h-4 mt-1 text-slate-500"/><div><p className="font-semibold text-slate-800">Ciudad</p><p>{relatedData.city?.name || 'N/A'}</p></div></div>
                            {relatedData.speaker && <div className="flex items-start gap-3"><Mic className="w-4 h-4 mt-1 text-slate-500"/><div><p className="font-semibold text-slate-800">Ponente</p><p>{relatedData.speaker.name}</p></div></div>}
                            {relatedData.venue && <div className="flex items-start gap-3"><Building2 className="w-4 h-4 mt-1 text-slate-500"/><div><p className="font-semibold text-slate-800">Local</p><p>{relatedData.venue.name}</p></div></div>}
                            <div className="flex items-start gap-3"><Users className="w-4 h-4 mt-1 text-slate-500"/><div><p className="font-semibold text-slate-800">Máx. Asistentes</p><p>{event.max_attendees || 'Sin límite'}</p></div></div>
                            <div className="flex items-start gap-3"><ListChecks className="w-4 h-4 mt-1 text-slate-500"/><div><p className="font-semibold text-slate-800">Estado</p><p className="capitalize">{event.status}</p></div></div>
                            {event.description && <div className="md:col-span-2 flex items-start gap-3"><p className="font-semibold text-slate-800">Descripción:</p><p className="text-slate-600">{event.description}</p></div>}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ListChecks className="w-5 h-5 text-blue-600"/>Estado de Preparativos</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {preparationItems.map(item => {
                                const statusKey = event.preparations?.[item.key] || 'pendiente';
                                const config = preparationStatusConfig[statusKey];
                                const Icon = config.icon;
                                const ItemIcon = item.icon;
                                
                                return (
                                    <div key={item.key} className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-lg border">
                                        <ItemIcon className="w-7 h-7 text-slate-500 mb-2"/>
                                        <p className="text-sm font-semibold text-slate-800 text-center mb-2">{item.label}</p>
                                        <Badge className={`${config.color} capitalize`}>
                                            <Icon className={`w-3.5 h-3.5 mr-1.5 ${statusKey === 'procesando' ? 'animate-spin' : ''}`} />
                                            {config.label}
                                        </Badge>
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle className="flex items-center gap-2"><UserCheck className="w-5 h-5 text-emerald-600"/>Voluntarios Confirmados ({relatedData.volunteers.length})</CardTitle></CardHeader>
                        <CardContent>
                            {currentUser?.role === 'user' && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button className={isCurrentUserConfirmed ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} disabled={isConfirming}>
                                          {isCurrentUserConfirmed ? 'Cancelar Asistencia' : 'Confirmar Asistencia'}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{isCurrentUserConfirmed ? 'Cancelar Asistencia' : 'Confirmar Asistencia'}</DialogTitle>
                                            <DialogDescription>
                                              {isCurrentUserConfirmed ? '¿Estás seguro de que quieres cancelar tu asistencia a este Thinkglao?' : 'Indica la hora a la que planeas llegar para ayudar con la preparación.'}
                                            </DialogDescription>
                                        </DialogHeader>
                                        {!isCurrentUserConfirmed ? (
                                        <div className="py-4">
                                            <Label htmlFor="arrival-time">Hora de llegada</Label>
                                            <Input
                                                id="arrival-time"
                                                type="time"
                                                value={arrivalTime}
                                                onChange={(e) => setArrivalTime(e.target.value)}
                                            />
                                        </div>
                                        ) : null}
                                        <DialogFooter>
                                            {isCurrentUserConfirmed ? (
                                              <Button variant="destructive" onClick={handleCancelAssistance} disabled={isConfirming}>{isConfirming ? 'Cancelando...' : 'Sí, cancelar'}</Button>
                                            ) : (
                                              <Button onClick={handleConfirmAssistance} disabled={!arrivalTime || isConfirming}>{isConfirming ? 'Confirmando...' : 'Confirmar'}</Button>
                                            )}
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            )}
                            <div className="mt-4 space-y-3 max-h-60 overflow-auto">
                                {relatedData.volunteers.length > 0 ? (
                                    relatedData.volunteers.map(volunteer => (
                                        <div key={volunteer.user_id} className="flex justify-between items-center bg-slate-50 p-2 rounded-lg">
                                            <span className="text-sm font-medium text-slate-800">{volunteer.name}</span>
                                            <div className="flex items-center gap-1 text-sm text-emerald-700 font-semibold bg-emerald-100 px-2 py-1 rounded-md">
                                                <Clock className="w-3.5 h-3.5" />
                                                {volunteer.arrival_time}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-slate-500 text-center py-4">Aún no hay voluntarios confirmados.</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
