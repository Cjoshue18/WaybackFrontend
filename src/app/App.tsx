import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'; 
import { AuthProvider, useAuth } from '@/app/context/AuthContext';
import { HomePage } from '@/app/pages/HomePage'; 
import { SearchPage } from '@/app/pages/SearchPage';
import { AdminLayout } from '@/app/pages/admin/AdminLayout';
import { AdminDashboard } from '@/app/pages/admin/AdminDashboard';
import { AdminProducts } from '@/app/pages/admin/AdminProducts';
// Importa tus otras páginas de administración si las necesitas

function ProtectedAdminRoute({ children }: { children: React.JSX.Element }) {
  const { token, isAdmin } = useAuth();
  
  // Si no está logueado o no es admin, lo rebota a la página de inicio pública
  if (!token || !isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* 🛒 RUTAS PÚBLICAS (LA TIENDA) */}
      <Route path="/" element={<HomePage />} />
      <Route path="/buscar" element={<SearchPage />} />

      {/* ⚙️ RUTAS PROTEGIDAS DEL ADMINISTRADOR */}
      <Route 
        path="/admin" 
        element={
          <ProtectedAdminRoute>
            <AdminLayout />
          </ProtectedAdminRoute>
        }
      >
        {/* Al entrar a /admin, te redirige por defecto al dashboard interno */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="productos" element={<AdminProducts />} />
      </Route>

      {/* Redirección por si escriben cualquier otra ruta inexistente */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}