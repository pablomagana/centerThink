import { base44 } from '@/api/base44Client';

export const OrderTypeSchema = {
    name: "OrderType",
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Nombre del tipo de pedido"
        },
        description: {
            type: "string",
            description: "Descripción del pedido"
        },
        priority: {
            type: "string",
            enum: [
                "alta",
                "media",
                "baja"
            ],
            default: "media",
            description: "Prioridad del pedido"
        },
        active: {
            type: "boolean",
            default: true,
            description: "Si el tipo está activo"
        }
    },
    required: [
        "name"
    ]
};

export const OrderType = base44.entities.OrderType;

export default OrderTypeSchema;
