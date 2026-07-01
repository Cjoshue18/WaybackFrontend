# Wayback — E-commerce Frontend

Frontend React + Vite para la tienda Wayback. Se conecta al backend de producción en Render o a un servidor híbrido local para desarrollo.

---

## Setup rápido

```bash
git clone <url-repo>
cd Wayback
git checkout prueba/pasarela-pago-mock   # o la rama que necesites

npm install

# Solo para modo híbrido local (mock + proxy):
echo "VITE_API_BASE=http://localhost:3000" > .env.local

npm run dev:full   # levanta server híbrido + Vite y abre el navegador
```

> Sin `.env.local` el frontend apunta directo al backend real de producción.

---

## Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Solo Vite (apunta al `VITE_API_BASE` configurado, abre navegador) |
| `npm run server` | Solo el servidor híbrido local en `:3000` |
| `npm run dev:full` | Ambos en paralelo con `concurrently` |
| `npm run build` | Build de producción en `/dist` |

---

## Variables de entorno

| Variable | Valor por defecto | Uso |
|----------|-------------------|-----|
| `VITE_API_BASE` | `https://y2kvault-backend.onrender.com` | URL base del backend. Crear `.env.local` para sobreescribir en local. En Vercel configurar como Environment Variable. |
| `VITE_MAPBOX_ACCESS_TOKEN` | `''` (deshabilitado) | Token público de Mapbox (`pk.eyJ1…`). Habilita el SearchBox de dirección con autocompletado. Sin este token el campo calle funciona como input libre. |

---

## Servidor híbrido local (`server.js`)

Corre en `http://localhost:3000`. Funciona como intermediario:

**Rutas mockeadas (datos en memoria):**
- `GET / PUT /api/profile/mi-perfil`
- `GET / POST / PUT / DELETE /api/profile/direcciones/:id`
- `POST /api/mis-pedidos` — guarda pedido con `pedEstado: "pendiente"`
- `GET /api/admin/reportes/pedidos` + `/:id`
- `PUT /api/admin/reportes/pedidos/:id/estado`
- `POST /api/pagos/crear-preferencia` — genera `PREF-MOCK-<timestamp>` con monto calculado
- `POST /api/pagos/webhook` — aprueba el pedido automáticamente en memoria

**Proxy al backend real (todo lo demás):**
- `/api/productos`, `/api/categorias`, `/api/auth/login`, etc.

> Los datos mock son volátiles — se reinician al reiniciar el server.

---

## Pasarela de pago (flujo automático)

1. Usuario selecciona dirección → clic en **"💳 Proceder al Pago Seguro"**
2. Frontend llama `POST /api/pagos/crear-preferencia` con los ítems
3. Overlay de "Procesando pago…" (2 segundos)
4. `POST /api/mis-pedidos` crea el pedido (`pendiente`)
5. `POST /api/pagos/webhook` lo aprueba automáticamente (`aceptado`)
6. Carrito se vacía · toast de confirmación

---

## Stack

- **React 19** + **TypeScript**
- **Vite 6** — bundler y dev server
- **React Router 7** — navegación
- **Tailwind CSS 4** — estilos
- **Radix UI / shadcn** — componentes
- **Lucide React** — iconos
- **Sonner** — toasts
- **Express 5 + cors** — servidor híbrido local (devDependency)
- **concurrently** — correr server + Vite en paralelo (devDependency)

---

## Estructura principal

```
src/
  app/
    components/     # Header, ProductCard, QuickViewModal, CartDrawer, ...
    context/        # AuthContext (login, register, token JWT)
    hooks/          # useCart, useFavorites, useProfile, useDirecciones
    pages/          # HomePage, Catalogo, CartPage, UserProfilePage, Direccionespage, ...
    pages/admin/    # AdminProducts, AdminOrders, AdminClients, AdminDashboard, ...
    layouts/        # RootLayout, AdminLayout (con guard isAdmin)
    routes.tsx      # createBrowserRouter — rutas públicas y /admin
  lib/
    api.ts          # Todas las funciones fetch (productos, auth, pedidos, pasarela)
    ubigeo.ts       # Data estática ubigeo Perú (25 departamentos, provincias, distritos)
server.js           # Servidor híbrido local Express 5
```

---

## Checklist antes de deploy en Vercel

- [ ] `VITE_API_BASE` configurado en Vercel → Settings → Environment Variables
- [ ] No hay `pnpm-lock.yaml` ni `pnpm-workspace.yaml` (Vercel usa npm)
- [ ] `.env.local` **no** está en git (patrón `*.local` en `.gitignore`)
- [ ] `dist/` **no** está en git (en `.gitignore`)
- [ ] Build local pasa: `npm run build`

---

## Ramas

| Rama | Descripción |
|------|-------------|
| `main` | Producción |
| `perfil` | Features de perfil de usuario |
| `prueba/pasarela-pago-mock` | Servidor híbrido + pasarela automática mock (esta rama) |
