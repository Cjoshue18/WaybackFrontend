import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { Search, ShoppingBag, User, Heart, Menu, X, LayoutDashboard, LogOut } from 'lucide-react';
import { CategoryMenu } from './CategoryMenu';
import { SearchOverlay } from './SearchOverlay';
import { useAuth } from '../context/AuthContext';

// 🔑 DEFINIMOS LAS PROPS QUE EL CONTROLADOR GLOBAL LE PASARÁ AL HEADER
interface HeaderProps {
  onOpenLogin: () => void;
}

export function Header({ onOpenLogin }: HeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [isMobileMenuOpen,   setIsMobileMenuOpen]   = useState(false);
  const [isSearchOpen,       setIsSearchOpen]       = useState(false);
  const [isUserMenuOpen,     setIsUserMenuOpen]     = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleUserClick = () => {
    // 🛠️ Cambiado: En lugar de abrir un estado local, dispara el modal global controlado por el Layout
    if (!user) { onOpenLogin(); return; }
    setIsUserMenuOpen((v) => !v);
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">

          {/* top row: logo + icons */}
          <div className="flex items-center justify-between mb-3">
            <Link
              to="/"
              className="tracking-[0.22em] uppercase hover:opacity-90 transition-all"
              style={{
                fontSize: 17,
                fontWeight: 700,
                letterSpacing: '0.25em',
                color: '#7c3aed'
              }}
            > 
              WAYBACK
            </Link>

            {/* desktop icons */}
            <div className="hidden md:flex items-center gap-0.5">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2.5 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900"
                title="Buscar"
              >
                <Search style={{ width: 18, height: 18 }} />
              </button>

              {/* user icon with dropdown */}
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={handleUserClick}
                  className="p-2.5 hover:bg-gray-50 transition-colors relative"
                  title={user ? user.name : 'Mi cuenta'}
                  style={{ color: user ? '#7c3aed' : '#6b7280' }}
                >
                  {user ? (
                    <div
                      className="flex items-center justify-center"
                      style={{ width: 22, height: 22, background: '#7c3aed', borderRadius: '50%' }}
                    >
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff' }}>
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  ) : (
                    <User style={{ width: 18, height: 18 }} />
                  )}
                </button>

                {/* user dropdown */}
                {isUserMenuOpen && user && (
                  <div
                    className="absolute right-0 top-full mt-1 bg-white py-2"
                    style={{ width: 200, boxShadow: '0 8px 24px rgba(0,0,0,0.10)', border: '1px solid #f3f4f6', zIndex: 60 }}
                  >
                    <div className="px-4 py-2.5 mb-1" style={{ borderBottom: '1px solid #f9f9f9' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{user.name}</p>
                      <p style={{ fontSize: 11, color: '#9ca3af' }}>{user.email}</p>
                    </div>

                    {user.role === 'admin' ? (
                      <button
                        onClick={() => { navigate('/admin'); setIsUserMenuOpen(false); }}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                        onMouseEnter={(e) => { (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#7c3aed'; }}
                        onMouseLeave={(e) => { (e.currentTarget.querySelector('span') as HTMLElement).style.color = '#374151'; }}
                      >
                        <LayoutDashboard style={{ width: 14, height: 14, color: '#7c3aed' }} />
                        <span style={{ fontSize: 13, color: '#374151' }}>Panel de Control</span>
                      </button>
                    ) : (
                      <>
                        <button onClick={() => { navigate('/perfil'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
                          <User style={{ width: 14, height: 14, color: '#9ca3af' }} />
                          <span style={{ fontSize: 13, color: '#374151' }}>Mi perfil</span>
                        </button>
                        <button onClick={() => { navigate('/favoritos'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
                          <Heart style={{ width: 14, height: 14, color: '#9ca3af' }} />
                          <span style={{ fontSize: 13, color: '#374151' }}>Favoritos</span>
                        </button>
                        <button onClick={() => { navigate('/carrito'); setIsUserMenuOpen(false); }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors">
                          <ShoppingBag style={{ width: 14, height: 14, color: '#9ca3af' }} />
                          <span style={{ fontSize: 13, color: '#374151' }}>Carrito</span>
                        </button>
                      </>
                    )}

                    <div style={{ height: 1, background: '#f9f9f9', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left hover:bg-red-50 transition-colors group"
                    >
                      <LogOut style={{ width: 14, height: 14, color: '#9ca3af' }} className="group-hover:text-red-400" />
                      <span style={{ fontSize: 13, color: '#374151' }} className="group-hover:text-red-500">Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>

              {!user && (
                <>              
                  <Link
                    to="/carrito"
                    className="p-2.5 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900 relative"
                    title="Carrito"
                  >
                    <ShoppingBag style={{ width: 18, height: 18 }} />
                  </Link>
                </>
              )}

              {user && user.role === 'client' && (
                <>
                  <Link to="/carrito" className="p-2.5 hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-900 relative" title="Carrito">
                    <ShoppingBag style={{ width: 18, height: 18 }} />
                  </Link>
                </>
              )}
            </div>

            {/* mobile hamburger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* desktop nav */}
          <nav className="hidden md:flex items-center gap-7" style={{ fontSize: 12, letterSpacing: '0.09em' }}>
            <Link to="/" className="text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">
              Inicio
            </Link>
            <button
              onClick={() => setIsCategoryMenuOpen((v) => !v)}
              className="flex items-center gap-1 uppercase tracking-widest transition-colors"
              style={{ color: isCategoryMenuOpen ? '#7c3aed' : '#6b7280' }}
            >
              Categorías
              <span style={{ fontSize: 9, transform: isCategoryMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)', display: 'inline-block', transition: 'transform 0.2s' }}>▾</span>
            </button>
            <Link to="/contacto" className="text-gray-500 hover:text-gray-900 transition-colors uppercase tracking-widest">
              Contacto
            </Link>
          </nav>

          {/* mobile nav */}
          {isMobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 flex flex-col gap-5 border-t border-gray-100 pt-4" style={{ fontSize: 13 }}>
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 tracking-widest uppercase">Inicio</Link>
              <button
                onClick={() => { setIsCategoryMenuOpen((v) => !v); setIsMobileMenuOpen(false); }}
                className="text-gray-700 tracking-widest uppercase text-left"
              >
                Categorías
              </button>
              <Link to="/contacto" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 tracking-widest uppercase">Contacto</Link>
              <button
                onClick={() => { setIsMobileMenuOpen(false); setIsSearchOpen(true); }}
                className="flex items-center gap-2 text-gray-700 tracking-widest uppercase"
              >
                <Search className="w-4 h-4" /> Buscar
              </button>
              {!user ? (
                // 🛠️ Cambiado: Mobile también aprovecha la prop controlada
                <button onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }} className="flex items-center gap-2 text-[#7c3aed] tracking-widest uppercase">
                  <User className="w-4 h-4" /> Iniciar sesión
                </button>
              ) : (
                <button onClick={handleLogout} className="flex items-center gap-2 text-gray-500 tracking-widest uppercase">
                  <LogOut className="w-4 h-4" /> Cerrar sesión
                </button>
              )}
            </nav>
          )}
        </div>

        <CategoryMenu
          isOpen={isCategoryMenuOpen}
          onClose={() => setIsCategoryMenuOpen(false)}
        />
      </header>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      {/* 🛡️ MODAL INTERNO RETIRADO: Ahora se gestiona puramente desde RootLayout.tsx */}
    </>
  );
}