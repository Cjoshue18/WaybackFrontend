import { Package, Users, ShoppingBag, Tag, TrendingUp, Clock } from 'lucide-react';

const STATS = [
  { label: 'Productos', value: '—', sub: 'Pendiente de API', icon: Package,     color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  { label: 'Usuarios',  value: '—', sub: 'Pendiente de API', icon: Users,       color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  { label: 'Pedidos',   value: '—', sub: 'Pendiente de API', icon: ShoppingBag, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { label: 'Categorías',value: '11', sub: 'Categorías activas', icon: Tag,       color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
];

const RECENT_ORDERS: { id: string; cliente: string; estado: string; total: string; fecha: string }[] = [];

export function AdminDashboard() {
  return (
    <div>
      {/* page header */}
      <div className="mb-8">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>
          Resumen general de la plataforma Wayback
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="bg-white p-5"
              style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex items-center justify-center"
                  style={{ width: 38, height: 38, background: s.bg, borderRadius: 8 }}
                >
                  <Icon style={{ width: 17, height: 17, color: s.color }} />
                </div>
              </div>
              <p style={{ fontSize: 26, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 2 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 2 }}>{s.label}</p>
              <p style={{ fontSize: 11, color: '#9ca3af' }}>{s.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* recent orders */}
        <div
          className="bg-white p-6"
          style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <Clock style={{ width: 15, height: 15, color: '#7c3aed' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>
              Pedidos recientes
            </h2>
          </div>

          {RECENT_ORDERS.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag style={{ width: 28, height: 28, color: '#e5e7eb', margin: '0 auto 10px' }} />
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Sin pedidos aún</p>
              <p style={{ fontSize: 11, color: '#d1d5db', marginTop: 4 }}>Conecta el API para ver pedidos</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {['ID', 'Cliente', 'Estado', 'Total'].map((h) => (
                    <th key={h} className="text-left pb-2" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RECENT_ORDERS.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td className="py-2.5" style={{ fontSize: 12, color: '#6b7280' }}>#{o.id}</td>
                    <td className="py-2.5" style={{ fontSize: 13, color: '#111', fontWeight: 500 }}>{o.cliente}</td>
                    <td className="py-2.5">
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '2px 8px' }}>
                        {o.estado}
                      </span>
                    </td>
                    <td className="py-2.5" style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{o.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* quick stats */}
        <div
          className="bg-white p-6"
          style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp style={{ width: 15, height: 15, color: '#7c3aed' }} />
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#111', letterSpacing: '-0.01em' }}>
              Estado del sistema
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {[
              { label: 'Base de datos', status: 'Pendiente de conexión', ok: false },
              { label: 'API de productos', status: 'Pendiente de conexión', ok: false },
              { label: 'Stripe Payments', status: 'Pendiente de conexión', ok: false },
              { label: 'Panel admin', status: 'Activo', ok: true },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #f9f9f9' }}>
                <span style={{ fontSize: 13, color: '#374151' }}>{item.label}</span>
                <span
                  style={{
                    fontSize: 11, fontWeight: 600,
                    color: item.ok ? '#10b981' : '#f59e0b',
                    background: item.ok ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
                    padding: '2px 10px',
                  }}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
