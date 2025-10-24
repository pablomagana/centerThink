import { base44 } from '@/api/base44Client';

export const EventOrderSchema = {
    name: "EventOrder",
    type: "object",
    properties: {
        event_id: {
            type: "string",
            description: "ID del evento"
        },
        order_type_id: {
            type: "string",
            description: "ID del tipo de pedido"
        },
        responsible_user_id: {
            type: "string",
            description: "ID del usuario responsable"
        },
        status: {
            type: "string",
            enum: [
                "pendiente",
                "en_proceso",
                "completado",
                "cancelado"
            ],
            default: "pendiente",
            description: "Estado del pedido"
        },
        due_date: {
            type: "string",
            format: "date",
            description: "Fecha límite"
        },
        notes: {
            type: "string",
            description: "Notas del pedido"
        },
        completion_notes: {
            type: "string",
            description: "Notas de finalización"
        }
    },
    required: [
        "event_id",
        "order_type_id",
        "responsible_user_id"
    ]
};

export const EventOrder = base44.entities.EventOrder;

export default EventOrderSchema;
