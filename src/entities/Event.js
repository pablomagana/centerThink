import { eventService } from '@/services/event.service';

export const EventSchema = {
    name: "Event",
    type: "object",
    properties: {
        description: {
            type: "string",
            description: "Descripción del evento"
        },
        city_id: {
            type: "string",
            description: "ID de la ciudad"
        },
        date: {
            type: "string",
            format: "date-time",
            description: "Fecha y hora del evento"
        },
        speaker_id: {
            type: "string",
            description: "ID del ponente asignado"
        },
        venue_id: {
            type: "string",
            description: "ID del local asignado"
        },
        status: {
            type: "string",
            enum: [
                "planificacion",
                "confirmado",
                "completado",
                "cancelado"
            ],
            default: "planificacion",
            description: "Estado del evento"
        },
        max_attendees: {
            type: "number",
            description: "Máximo de asistentes"
        },
        preparations: {
            type: "object",
            properties: {
                presentation_video: {
                    type: "string",
                    enum: [
                        "pendiente",
                        "procesando",
                        "resuelto"
                    ],
                    default: "pendiente"
                },
                poster_image: {
                    type: "string",
                    enum: [
                        "pendiente",
                        "procesando",
                        "resuelto"
                    ],
                    default: "pendiente"
                },
                theme: {
                    type: "string",
                    enum: [
                        "pendiente",
                        "procesando",
                        "resuelto"
                    ],
                    default: "pendiente"
                },
                transport: {
                    type: "string",
                    enum: [
                        "pendiente",
                        "procesando",
                        "resuelto"
                    ],
                    default: "pendiente"
                },
                accommodation: {
                    type: "string",
                    enum: [
                        "pendiente",
                        "procesando",
                        "resuelto"
                    ],
                    default: "pendiente"
                }
            },
            description: "Estados de los preparativos"
        },
        confirmed_volunteers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    user_id: {
                        type: "string"
                    },
                    arrival_time: {
                        type: "string"
                    }
                }
            },
            description: "Voluntarios que confirmaron asistencia y su hora de llegada",
            default: []
        },
        notes: {
            type: "string",
            description: "Notas adicionales del evento"
        }
    },
    required: [
        "city_id",
        "date"
    ]
};

export const Event = eventService;

export default EventSchema;
