import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ContactoPage } from './pages/ContactoPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { FavoritesPage } from './pages/FavoritesPage';
import { CartPage } from './pages/CartPage';
import { SearchPage } from './pages/SearchPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminEstilos } from './pages/admin/AdminEstilos';
import { AdminClients } from './pages/admin/AdminClients'; 
import { AdminOrders } from './pages/admin/AdminOrders';
import { CatalogoPage } from './pages/Catalogo'; // 🔑 1. IMPORTAMOS TU NUEVO CATÁLOGO

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'categoria/:categoryId', Component: CategoryPage }, // 🔑 Mapea directo a tu página funcional
      { path: 'catalogo', Component: CatalogoPage }, // Deja el catálogo limpio para "Ver todo"
      { path: 'contacto', Component: ContactoPage },
      { path: 'perfil', Component: UserProfilePage },
      { path: 'favoritos', Component: FavoritesPage },
      { path: 'carrito', Component: CartPage },
      { path: 'buscar',  Component: SearchPage },
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true,             Component: AdminDashboard },
      { path: 'dashboard',       Component: AdminDashboard }, 
      { path: 'productos',       Component: AdminProducts },
      { path: 'categorias',      Component: AdminCategories },
      { path: 'estilos',         Component: AdminEstilos },
      { path: 'clientes',        Component: AdminClients }, 
      { path: 'pedidos',         Component: AdminOrders },
    ],
  },
]);