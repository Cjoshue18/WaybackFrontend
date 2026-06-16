import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ContactoPage } from './pages/ContactoPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { CartPage } from './pages/CartPage';
import { SearchPage } from './pages/SearchPage';
import { RegisterPage } from './pages/RegisterPage'; // ✨ 1. IMPORTA LA PÁGINA DE REGISTRO
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminClients } from './pages/admin/AdminClients'; // 🛠️ Conservamos tu componente de Clientes
import { AdminOrders } from './pages/admin/AdminOrders';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'categoria/:categoryId', Component: CategoryPage },
      { path: 'contacto', Component: ContactoPage },
      { path: 'perfil', Component: UserProfilePage },
      { path: 'carrito', Component: CartPage },
      { path: 'buscar',  Component: SearchPage },
      { path: 'registrar', Component: RegisterPage }, // ✨ 2. CONECTA LA RUTA PÚBLICA AQUÍ
    ],
  },
  {
    path: '/admin',
    Component: AdminLayout,
    children: [
      { index: true,             Component: AdminDashboard },
      { path: 'dashboard',       Component: AdminDashboard }, // ✨ Agrega esta línea aquí
      { path: 'productos',       Component: AdminProducts },
      { path: 'categorias',      Component: AdminCategories },
      { path: 'clientes',        Component: AdminClients }, 
      { path: 'pedidos',         Component: AdminOrders },
    ],
  },
]);