import { cityService } from '@/services/city.service';

export const CitySchema = {
    name: "City",
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Nombre de la ciudad"
        },
        country: {
            type: "string",
            description: "País"
        },
        region: {
            type: "string",
            description: "Región o estado"
        },
        active: {
            type: "boolean",
            default: true,
            description: "Si la ciudad está activa"
        }
    },
    required: [
        "name",
        "country"
    ]
};

export const City = cityService;

export default CitySchema;
