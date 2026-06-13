import { useState } from 'react';
import { Outlet } from 'react-router';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { LoginModal } from '../components/LoginModal';       // 🔑 Importamos el modal de Login
import { RegisterModal } from '../components/RegisterModal'; // 🔑 Importamos el nuevo modal de Registro

export function RootLayout() {
  // ── ESTADOS DE CONTROL PARA LOS MODALES ──
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Funciones de conveniencia para alternar entre modales ràpidamente
  const openLoginAndCloseRegister = () => {
    setIsRegisterOpen(false);
    setIsLoginOpen(true);
  };

  const openRegisterAndCloseLogin = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Le pasamos la función para abrir el Login al Header. 
        Asegúrate de que en tu <Header />, el botón del ícono de usuario ejecute esta prop 'onOpenLogin'
      */}
      <Header onOpenLogin={() => setIsLoginOpen(true)} />

      {/* Renderiza las páginas de la tienda (Catálogo, Inicio, Contacto, etc.) */}
      <Outlet />

      <Footer />

      {/* ── 🏛️ CAPA GLOBAL DE MODALES DE AUTENTICACIÓN ── */}
      
      {/* Modal de Iniciar Sesión */}
      <LoginModal 
        isOpen={isLoginOpen} 
        onClose={() => setIsLoginOpen(false)} 
        // Si el usuario da clic en "¿No tienes cuenta? Regístrate aquí", se cierra este y abre el otro
        onSwitchToRegister={openRegisterAndCloseLogin} 
      />

      {/* Modal de Registro de Clientes */}
      <RegisterModal 
        isOpen={isRegisterOpen} 
        onClose={() => setIsRegisterOpen(false)} 
        // Si el usuario da clic en "¿Ya tienes cuenta? Inicia sesión aquí", regresa al formulario anterior
        onSwitchToLogin={openLoginAndCloseRegister} 
      />
    </div>
  );
}