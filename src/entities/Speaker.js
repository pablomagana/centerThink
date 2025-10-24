import { speakerService } from '@/services/speaker.service';

export const SpeakerSchema = {
    name: "Speaker",
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Nombre del ponente"
        },
        email: {
            type: "string",
            description: "Correo electrónico"
        },
        phone: {
            type: "string",
            description: "Teléfono"
        },
        instagram: {
            type: "string",
            description: "Usuario de Instagram"
        },
        bio: {
            type: "string",
            description: "Biografía del ponente"
        },
        contact_status: {
            type: "string",
            enum: [
                "no_contactado",
                "contactado",
                "seguimiento"
            ],
            default: "no_contactado",
            description: "Estado del contacto con el ponente"
        },
        proposal_status: {
            type: "string",
            enum: [
                "sin_propuesta",
                "propuesta_enviada",
                "confirmado",
                "rechazado"
            ],
            default: "sin_propuesta",
            description: "Estado de la propuesta (Thinkglao)"
        },
        proposal_confirmation_date: {
            type: "string",
            format: "date",
            description: "Fecha de confirmación de la propuesta"
        },
        active: {
            type: "boolean",
            default: true,
            description: "Si el ponente está activo"
        }
    },
    required: [
        "name",
        "email"
    ]
};

export const Speaker = speakerService;

export default SpeakerSchema;
