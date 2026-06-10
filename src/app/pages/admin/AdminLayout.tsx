import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router';
import { LayoutDashboard, Package, Tag, Users, ShoppingBag, LogOut, Menu, X, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/productos',  label: 'Productos',    icon: Package },
  { to: '/admin/categorias', label: 'Categorías',   icon: Tag },
  { to: '/admin/clientes',   label: 'Clientes',     icon: Users },
  { to: '/admin/pedidos',    label: 'Pedidos',      icon: ShoppingBag },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside
      className="flex flex-col h-full"
      style={{ background: '#111', width: mobile ? '100%' : 220, flexShrink: 0 }}
    >
      {/* brand */}
      <div className="px-6 pt-7 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <span
          style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.22em', color: '#7c3aed', textTransform: 'uppercase', display: 'block', marginBottom: 4 }}
        >
          WAYBACK
        </span>
        <span
          style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}
        >
          Panel Administrador
        </span>
      </div>

      {/* nav */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 mb-1 transition-all duration-150 group"
            style={({ isActive }) => ({
              borderRadius: 6,
              background: isActive ? 'rgba(124,58,237,0.18)' : 'transparent',
              color: isActive ? '#7c3aed' : 'rgba(255,255,255,0.5)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon style={{ width: 15, height: 15, flexShrink: 0, color: isActive ? '#7c3aed' : 'rgba(255,255,255,0.35)' }} />
                <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                {isActive && (
                  <span
                    className="ml-auto"
                    style={{ width: 4, height: 4, borderRadius: '50%', background: '#7c3aed', flexShrink: 0 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* user + logout */}
      <div className="px-4 pb-6 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        {user && (
          <div className="flex items-center gap-3 mb-4 px-2">
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{ width: 32, height: 32, background: '#7c3aed', borderRadius: '50%' }}
            >
              <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.85)', truncate: true }}
                className="truncate">
                {user.name}
              </p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Administrador
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 w-full px-3 py-2.5 mb-1 transition-colors"
          style={{ borderRadius: 6, color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#7c3aed'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(124,58,237,0.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 13 }}>Volver al sitio</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2.5 transition-colors"
          style={{ borderRadius: 6, color: 'rgba(255,255,255,0.35)' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#f87171'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.35)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          <LogOut style={{ width: 14, height: 14 }} />
          <span style={{ fontSize: 13 }}>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f8f7f5' }}>
      {/* desktop sidebar */}
      <div className="hidden md:flex flex-col" style={{ width: 220, flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10" style={{ width: 260 }}>
            <Sidebar mobile />
          </div>
        </div>
      )}

      {/* main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* mobile topbar */}
        <div
          className="md:hidden flex items-center justify-between px-4 py-3 bg-white"
          style={{ borderBottom: '1px solid #f3f4f6' }}
        >
          <button onClick={() => setMobileOpen(true)} className="p-1 text-gray-500">
            <Menu style={{ width: 20, height: 20 }} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: '0.2em', color: '#7c3aed' }}>WAYBACK</span>
          <button onClick={handleLogout} className="p-1 text-gray-400">
            <LogOut style={{ width: 18, height: 18 }} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
