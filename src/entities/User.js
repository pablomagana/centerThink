import { userService } from '@/services/user.service';

export const UserSchema = {
    name: "User",
    type: "object",
    properties: {
        first_name: {
            type: "string",
            description: "Nombre del usuario"
        },
        last_name: {
            type: "string",
            description: "Apellidos del usuario"
        },
        role: {
            type: "string",
            enum: ["admin", "user", "supplier"],
            description: "Rol del usuario (admin: administrador total, supplier: suministrador con acceso a usuarios y ciudades, user: usuario normal)"
        },
        cities: {
            type: "array",
            items: {
                type: "string"
            },
            description: "IDs de las ciudades asociadas al usuario"
        },
        phone: {
            type: "string",
            description: "Teléfono del usuario"
        }
    },
    required: [
        "first_name",
        "last_name"
    ]
};

export const User = userService;

export default UserSchema;
