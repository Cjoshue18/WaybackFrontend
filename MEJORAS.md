# Mejoras y Refactorizaciones por Joshue (@Cjoshue18)

Este documento detalla todas las implementaciones, refactorizaciones y nuevas características añadidas al repositorio desde el último commit original ("persistencia DNI").

## Arquitectura y Conexión con Backend
- **Mejorada la Integración con API REST (.NET):** Se reemplazaron todos los datos estáticos (`mockData`) por llamadas reales al servidor a través de una capa centralizada de servicios (`api.ts`).
- **Mejorada la Paginación Global desde el Servidor:** Implementación de paginación robusta usando `Skip` y `Take` en el backend, reflejada en el frontend a través de componentes paginados, optimizando drásticamente la carga de datos.
- **Mejorada la Refactorización de Autenticación:** Migración y estabilización del flujo de registro, login y persistencia de sesión utilizando JWT (JSON Web Tokens) y Context API, eliminando dependencias locales inestables.

## Experiencia de Usuario (UI/UX)
- **Mejorado el Panel de Administración Completo:** Desarrollo desde cero de las vistas de administración (`AdminDashboard`, `AdminOrders`, `AdminProducts`, `AdminClients`) para gestionar inventario, cambiar estados de pedidos y ver métricas en tiempo real.
- **Componentes de Navegación Avanzados:** Creación de un `DesktopDropdownMenu` para una navegación por categorías más intuitiva en escritorio, y optimización del menú lateral para móviles.
- **Catálogo Dinámico:** Motor de búsqueda y filtrado avanzado (por categoría, estilo, color, talla, precio y stock) con sincronización bidireccional en la URL (`searchParams`) para compartir búsquedas exactas.

## Flujo de Compra y Checkout
- **Integración de Mapbox:** Funcionalidad de autocompletado y validación visual de direcciones en un mapa interactivo durante el checkout y en el perfil de usuario.
- **Gestión de Direcciones y Perfil:** Flujo completo para guardar, editar y seleccionar múltiples direcciones de envío directamente desde la base de datos.
- **Historial de Pedidos Detallado:** Panel de usuario con historial de compras paginado y capacidad de ver los detalles exactos de cada transacción.

## Código y Mantenimiento
- **Estandarización de Tipos:** Definición de interfaces estrictas en TypeScript para garantizar la sincronización perfecta con los DTOs del backend en C#.
- **Gestión de Errores y Carga:** Implementación de "Skeletons" (pantallas de carga) y validaciones de errores amigables para el usuario en cada llamada a la API.
