import { useState } from 'react';
import { Search, Eye, X, ChevronDown } from 'lucide-react';

const ESTADOS = ['Pendiente','Confirmado','En camino','Entregado','Cancelado'];

interface Pedido {
  ped_id: number;
  cliente: string;
  email: string;
  estado: string;
  ped_total: number;
  ped_fecha_compra: string;
  ped_fecha_entrega: string;
  metodo_pago: string;
  items: number;
}

const EMPTY_ORDERS: Pedido[] = [];

const ESTADO_COLORS: Record<string, { color: string; bg: string }> = {
  Pendiente:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  Confirmado:  { color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
  'En camino': { color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
  Entregado:   { color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  Cancelado:   { color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
};

export function AdminOrders() {
  const [orders,    setOrders]    = useState<Pedido[]>(EMPTY_ORDERS);
  const [search,    setSearch]    = useState('');
  const [filterEst, setFilterEst] = useState('');
  const [viewing,   setViewing]   = useState<Pedido | null>(null);

  const filtered = orders.filter((o) => {
    const matchSearch = `${o.cliente} ${o.email} ${o.ped_id}`.toLowerCase().includes(search.toLowerCase());
    const matchEst    = !filterEst || o.estado === filterEst;
    return matchSearch && matchEst;
  });

  const updateEstado = (id: number, estado: string) => {
    setOrders((prev) => prev.map((o) => o.ped_id === id ? { ...o, estado } : o));
    if (viewing?.ped_id === id) setViewing((v) => v ? { ...v, estado } : v);
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Pedidos</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{orders.length} pedidos en total</p>
        </div>
      </div>

      {/* filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="flex items-center gap-3 bg-white px-4 py-2.5 flex-1" style={{ border: '1px solid #f0f0f0', maxWidth: 340 }}>
          <Search style={{ width: 15, height: 15, color: '#9ca3af', flexShrink: 0 }} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar pedido..." className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-300"
            style={{ fontSize: 13 }}
          />
        </div>
        <div className="relative">
          <select
            value={filterEst} onChange={(e) => setFilterEst(e.target.value)}
            className="appearance-none bg-white px-4 py-2.5 pr-9 text-gray-600 focus:outline-none"
            style={{ border: '1px solid #f0f0f0', fontSize: 13 }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => <option key={e}>{e}</option>)}
          </select>
          <ChevronDown style={{ width: 13, height: 13, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* table */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
              {search || filterEst ? 'Sin resultados con los filtros aplicados' : 'No hay pedidos registrados'}
            </p>
            <p style={{ fontSize: 12, color: '#d1d5db' }}>{!search && !filterEst && 'Los pedidos aparecerán aquí al conectar el API'}</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Pedido','Cliente','Estado','Total','Fecha','Entrega','Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const ec = ESTADO_COLORS[o.estado] ?? { color: '#9ca3af', bg: '#f9f9f9' };
                return (
                  <tr key={o.ped_id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>#{o.ped_id}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{o.cliente}</p>
                        <p style={{ fontSize: 11, color: '#9ca3af' }}>{o.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span style={{ fontSize: 11, fontWeight: 700, color: ec.color, background: ec.bg, padding: '2px 8px' }}>{o.estado}</span>
                    </td>
                    <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>S/ {o.ped_total.toFixed(2)}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>{o.ped_fecha_compra}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>{o.ped_fecha_entrega}</td>
                    <td className="px-5 py-3.5">
                      <button onClick={() => setViewing(o)} className="p-1.5 text-gray-300 hover:text-[#7c3aed] transition-colors">
                        <Eye style={{ width: 14, height: 14 }} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* detail modal */}
      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewing(null)} />
          <div className="relative z-10 bg-white w-full overflow-y-auto" style={{ maxWidth: 500, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Pedido #{viewing.ped_id}</h3>
              <button onClick={() => setViewing(null)} className="text-gray-300 hover:text-gray-600"><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <div className="p-6 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Cliente" value={viewing.cliente} />
                <InfoRow label="Email" value={viewing.email} />
                <InfoRow label="Fecha compra" value={viewing.ped_fecha_compra} />
                <InfoRow label="Fecha entrega" value={viewing.ped_fecha_entrega} />
                <InfoRow label="Método de pago" value={viewing.metodo_pago} />
                <InfoRow label="Artículos" value={String(viewing.items)} />
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Total</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>S/ {viewing.ped_total.toFixed(2)}</p>
              </div>
              <div>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Cambiar estado</p>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((est) => {
                    const ec = ESTADO_COLORS[est] ?? { color: '#9ca3af', bg: '#f9f9f9' };
                    return (
                      <button
                        key={est}
                        onClick={() => updateEstado(viewing.ped_id, est)}
                        style={{
                          padding: '5px 14px', fontSize: 11, fontWeight: 700,
                          border: `1.5px solid ${viewing.estado === est ? ec.color : '#e5e7eb'}`,
                          color: viewing.estado === est ? ec.color : '#9ca3af',
                          background: viewing.estado === est ? ec.bg : 'transparent',
                          transition: 'all 0.15s',
                        }}
                      >
                        {est}
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={() => setViewing(null)} className="py-2.5 border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors" style={{ fontSize: 12 }}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#111' }}>{value || '—'}</p>
    </div>
  );
}
