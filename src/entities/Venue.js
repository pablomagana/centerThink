import { venueService } from '@/services/venue.service';

export const VenueSchema = {
    name: "Venue",
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Nombre del local"
        },
        address: {
            type: "string",
            description: "Dirección completa"
        },
        city_id: {
            type: "string",
            description: "ID de la ciudad"
        },
        capacity: {
            type: "number",
            description: "Capacidad máxima"
        },
        contact_name: {
            type: "string",
            description: "Nombre del contacto"
        },
        contact_phone: {
            type: "string",
            description: "Teléfono del contacto"
        },
        contact_email: {
            type: "string",
            description: "Email del contacto"
        },
        notes: {
            type: "string",
            description: "Notas adicionales"
        },
        active: {
            type: "boolean",
            default: true,
            description: "Si el local está activo"
        }
    },
    required: [
        "name",
        "address",
        "city_id"
    ]
};

export const Venue = venueService;

export default VenueSchema;
