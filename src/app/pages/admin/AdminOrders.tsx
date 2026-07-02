import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Search, Eye, X, ChevronDown, RefreshCw, Smartphone, ShieldCheck } from 'lucide-react';
import {
  getPedidosAdmin, getPedidoAdminDetalle, actualizarEstadoPedido,
  ESTADOS_PEDIDO, type EstadoPedido, type PedidoAdmin, type PedidoAdminDetalle,
} from '@/lib/api';
import { Toaster } from '@/app/components/ui/sonner';

const ESTADO_COLORS: Record<string, { color: string; bg: string }> = {
  pendiente: {
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
  },

  aceptado: {
    color: '#10b981',
    bg: 'rgba(16,185,129,0.12)',
  },

  rechazado: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.12)',
  },

  cancelado: {
    color: '#f97316',
    bg: 'rgba(249,115,22,0.12)',
  },

  entregado: {
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.12)',
  },
};

export function AdminOrders() {
  const [orders, setOrders] = useState<PedidoAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEst, setFilterEst] = useState('');

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const [viewingId, setViewingId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<PedidoAdminDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [updatingEstado, setUpdatingEstado] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    const data = await getPedidosAdmin(page, ITEMS_PER_PAGE);
    setOrders(data.elementos || []);
    setTotalPages(data.totalPaginas || 1);
    setTotalRegistros(data.totalRegistros || 0);
    setLoading(false);
  }, [page]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  useEffect(() => {
    if (viewingId === null) {
      setDetalle(null);
      return;
    }
    let active = true;
    setDetalleLoading(true);
    getPedidoAdminDetalle(viewingId).then((data) => {
      if (active) {
        setDetalle(data);
        setDetalleLoading(false);
      }
    });
    return () => { active = false; };
  }, [viewingId]);

  const filtered = orders.filter((o) => {
    const matchSearch = `${o.cliente} ${o.email} ${o.pedId}`.toLowerCase().includes(search.toLowerCase());
    const matchEst = !filterEst || o.estado === filterEst;
    return matchSearch && matchEst;
  });

  const handleUpdateEstado = async (estado: EstadoPedido) => {
    if (viewingId === null) return;
    setUpdatingEstado(true);
    const result = await actualizarEstadoPedido(viewingId, estado);
    setUpdatingEstado(false);

    if (result.success) {
      toast.success(`Pedido #${viewingId} actualizado a "${estado}".`);
      setDetalle((d) => (d ? { ...d, estado } : d));
      fetchOrders();
    } else {
      toast.error(result.error ?? 'No se pudo actualizar el estado del pedido.');
    }
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Pedidos</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{orders.length} pedidos en total</p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-gray-500 hover:text-[#7c3aed] transition-colors"
          style={{ fontSize: 12, border: '1px solid #f0f0f0' }}
        >
          <RefreshCw style={{ width: 13, height: 13 }} className={loading ? 'animate-spin' : ''} /> Actualizar
        </button>
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
            className="appearance-none bg-white px-4 py-2.5 pr-9 text-gray-600 focus:outline-none capitalize"
            style={{ border: '1px solid #f0f0f0', fontSize: 13 }}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_PEDIDO.map((e) => <option key={e} value={e} className="capitalize">{e}</option>)}
          </select>
          <ChevronDown style={{ width: 13, height: 13, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
        </div>
      </div>

      {/* table */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af' }}>Cargando pedidos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
              {search || filterEst ? 'Sin resultados con los filtros aplicados' : 'No hay pedidos registrados'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['Pedido', 'Cliente', 'Estado', 'Total', 'Fecha', 'Entrega', 'Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const ec = ESTADO_COLORS[o.estado] ?? { color: '#9ca3af', bg: '#f9f9f9' };
                return (
                  <tr key={o.pedId} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9f9f9' }}>
                    <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>#{o.pedId}</td>
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{o.cliente}</p>
                        <p className="text-xs text-slate-500 mt-1">{o.email}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="capitalize" style={{ fontSize: 11, fontWeight: 700, color: ec.color, background: ec.bg, padding: '4px 10px', borderRadius: 999 }}>{o.estado}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-900">
                        S/ {o.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#475569' }}>{formatDate(o.fechaCompra)}</td>
                    <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#475569' }}>{o.fechaEntrega ? formatDate(o.fechaEntrega) : 'No programada'}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setViewingId(o.pedId)}
                        className="rounded-full bg-[#7c3aed] px-3 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-[#2563eb] transition-colors"
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-violet-600 disabled:opacity-40 disabled:hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200"
            >
              <ChevronDown style={{ transform: 'rotate(90deg)' }} size={14} />
              Anterior
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Página {page} de {totalPages} ({totalRegistros} pedidos en total)
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-violet-600 disabled:opacity-40 disabled:hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200"
            >
              Siguiente
              <ChevronDown style={{ transform: 'rotate(-90deg)' }} size={14} />
            </button>
          </div>
        )}
      </div>

      {/* detail modal */}
      {viewingId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setViewingId(null)} />
          <div className="relative z-10 bg-white w-full overflow-y-auto" style={{ maxWidth: 500, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Pedido #{viewingId}</h3>
              <button onClick={() => setViewingId(null)} className="text-gray-300 hover:text-gray-600"><X style={{ width: 16, height: 16 }} /></button>
            </div>

            {detalleLoading || !detalle ? (
              <div className="p-10 text-center" style={{ fontSize: 13, color: '#9ca3af' }}>Cargando detalle…</div>
            ) : (
              <div className="p-6 flex flex-col gap-5">

                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Cliente" value={detalle.cliente} />
                  <InfoRow label="Email" value={detalle.email} />
                  <InfoRow label="Fecha compra" value={detalle.fechaCompra} />
                  <InfoRow label="Fecha entrega" value={detalle.fechaEntrega} />
                  <InfoRow label="Dirección" value={detalle.direccionEnvio} />
                  <InfoRow label="Artículos" value={String(detalle.items)} />
                </div>

                {detalle.itemsDetalle.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>
                      Productos
                    </p>
                    <div className="flex flex-col gap-2">
                      {detalle.itemsDetalle.map((it, i) => (
                        <div key={i} className="flex items-center justify-between" style={{ fontSize: 12, color: '#374151' }}>
                          <span>{it.nombre} — {it.talla} / {it.color} × {it.cantidad}</span>
                          <span style={{ fontWeight: 700 }}>S/ {(it.precio * it.cantidad).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Total</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#111' }}>S/ {detalle.total.toFixed(2)}</p>
                </div>

                <div>
                  <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 8 }}>Cambiar estado</p>
                  <div className="flex flex-wrap gap-2">
                    {ESTADOS_PEDIDO.map((est) => {
                      const ec = ESTADO_COLORS[est] ?? { color: '#9ca3af', bg: '#f9f9f9' };
                      const active = detalle.estado === est;
                      return (
                        <button
                          key={est}
                          disabled={updatingEstado}
                          onClick={() => handleUpdateEstado(est)}
                          className="capitalize disabled:opacity-50"
                          style={{
                            padding: '5px 14px', fontSize: 11, fontWeight: 700,
                            border: `1.5px solid ${active ? ec.color : '#e5e7eb'}`,
                            color: active ? ec.color : '#9ca3af',
                            background: active ? ec.bg : 'transparent',
                            transition: 'all 0.15s',
                          }}
                        >
                          {est}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button onClick={() => setViewingId(null)} className="py-2.5 border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors" style={{ fontSize: 12 }}>
                  Cerrar
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}

function formatDate(raw: string): string {
  if (!raw) return '—';
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 13, color: '#111' }}>{value || '—'}</p>
    </div>
  );
}
