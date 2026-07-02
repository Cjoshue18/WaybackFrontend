# Wayback — E-commerce Frontend

Este repositorio contiene el frontend desarrollado en React + Vite para la tienda Wayback. Está diseñado para conectarse a una API backend construida en .NET.

## Agradecimientos y Créditos

- Repo original: [klownika](https://github.com/klownika)
- Refactorizado, expandido y modernizado por: Joshue (@Cjoshue18)

Principales mejoras realizadas:
- Migración de datos estáticos a integración real y persistente con la API REST en .NET.
- Paginación global y optimización de rendimiento desde el lado del servidor.
- Implementación de un Panel de Administración completo (Gestión de órdenes, clientes y productos).
- Refactorización profunda de UI/UX, integración de mapas y mejoras en el flujo de carrito.
- Estabilización del sistema de autenticación, sesiones mediante JWT y Context API.

Para más detalles, consulta el documento completo de cambios: [[MEJORAS.md]](file:///C:/Users/joshu/Desktop/wbdas/FEWayBack/MEJORAS.md).

## Requisitos Previos

- [Node.js](https://nodejs.org/) (versión 18 o superior recomendada)
- Un backend de Wayback corriendo localmente o desplegado en la nube.

## Instalación y Configuración

```bash
# 1. Clonar el repositorio
git clone <url-repositorio>
cd FEWayBack

# 2. Instalar las dependencias
npm install
```

### Configuración de Variables de Entorno

Para que la aplicación web se comunique correctamente con la base de datos y la API, es necesario definir la URL del backend. Crea un archivo llamado `.env.local` en la raíz del proyecto basándote en el siguiente ejemplo:

```env
# URL base de la API backend (ejemplo local)
VITE_API_BASE=http://localhost:5000

# Opcional: Token de Mapbox para habilitar el autocompletado de direcciones en el carrito
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...
```

## Scripts de Desarrollo

- `npm run dev`: Inicia el entorno de desarrollo de Vite. Utilizará la configuración de `.env.local` para conectarse a la API.
- `npm run server`: Inicia un servidor puente de pruebas local. Es útil si deseas testear el flujo de pago sin tener la pasarela real conectada.
- `npm run dev:full`: Inicia tanto el entorno de Vite como el servidor puente en paralelo.
- `npm run build`: Compila la aplicación y genera los archivos estáticos listos para producción en la carpeta `/dist`.

## Estructura del Proyecto

```text
src/
  app/
    components/     # Componentes reutilizables de UI (Header, ProductCard, Modales)
    context/        # Gestión de estado global (Sesión, Autenticación)
    hooks/          # Hooks personalizados para lógica de negocio (carrito, perfil)
    pages/          # Vistas de la tienda (Home, Catálogo, Carrito)
      admin/        # Panel de administración (Dashboard, Inventario, Pedidos)
    layouts/        # Plantillas de diseño principales (RootLayout, AdminLayout)
    routes.tsx      # Configuración del árbol de rutas de la aplicación
  lib/
    api.ts          # Centralización de las llamadas HTTP hacia la API REST (.NET)
    ubigeo.ts       # Datos estáticos para selección de departamentos/provincias
```

## Stack Tecnológico

- **Framework:** React 19 con TypeScript
- **Build Tool:** Vite 6
- **Enrutamiento:** React Router 7
- **Estilos:** Tailwind CSS 4, componentes de Radix UI (shadcn)
- **Recursos Visuales:** Lucide React (íconos), Sonner (notificaciones)
