# centerThink - Event Management System

Sistema de gestión de eventos "Thinkglaos" con capacidades multiusuario y multi-ciudad.

## Requisitos Previos

- Node.js 18+
- npm o yarn

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

El servidor de desarrollo se iniciará en `http://localhost:3000`

## Build

```bash
npm run build
```

Los archivos de producción se generarán en la carpeta `dist/`

## Preview Build

```bash
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/       # Componentes React organizados por feature
│   ├── ui/          # Componentes base de shadcn/ui
│   ├── events/      # Componentes relacionados con eventos
│   ├── speakers/    # Componentes de ponentes
│   ├── venues/      # Componentes de locales
│   ├── cities/      # Componentes de ciudades
│   └── users/       # Componentes de usuarios
├── entities/        # Definiciones de esquemas de datos
├── Pages/           # Páginas principales de la aplicación
├── Layout.js        # Layout principal con sidebar
├── App.jsx          # Configuración de rutas
├── main.jsx         # Punto de entrada
└── utils.js         # Utilidades compartidas
```

## Tecnologías

- React 18
- Vite
- React Router
- Tailwind CSS
- shadcn/ui
- Lucide React (iconos)
- Framer Motion (animaciones)
