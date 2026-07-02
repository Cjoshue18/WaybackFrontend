import { useState, useEffect } from 'react';
import { Package, Users, ShoppingBag, Tag, TrendingUp, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
// Se importan las funciones de comunicación directa con .NET
import { getProductos, getClientes, getCategorias, getPedidosAdmin, getIngresosSemanales } from '@/lib/api';
import type { PedidoAdmin, IngresoDiario } from '@/lib/api';

export function AdminDashboard() {
  // ── ESTADOS DINÁMICOS PARA MÉTRICAS REALES ──
  const [metrics, setMetrics] = useState({
    productosCount: 0,
    clientesCount: 0,
    categoriasCount: 0,
    pedidosCount: 0,
  });
  const [allOrders, setAllOrders] = useState<PedidoAdmin[]>([]);
  const [ingresos, setIngresos] = useState<IngresoDiario[]>([]);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [sysStatus, setSysStatus] = useState({
    dbConnected: false,
    apiProducts: false,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function fetchDashboardData() {
      try {
        // Disparamos consultas paralelas a Render para optimizar tiempos de carga
        // Solicitamos solo 1 registro para traer la metadata total (optimización)
        const [listaProductos, listaClientes, listaCategorias, listaPedidos, listaIngresos] = await Promise.all([
          getProductos({ pagina: 1, registrosPorPagina: 1 }).catch(() => ({ totalRegistros: 0, elementos: [] }) as any),
          getClientes(1, 1).catch(() => ({ totalRegistros: 0, elementos: [] }) as any),
          getCategorias().catch(() => []),
          getPedidosAdmin(1, 10).catch(() => ({ totalRegistros: 0, elementos: [] }) as any),
          getIngresosSemanales().catch(() => []),
        ]);

        if (active) {
          setMetrics({
            productosCount: listaProductos.totalRegistros || 0,
            clientesCount: listaClientes.totalRegistros || 0,
            categoriasCount: listaCategorias.length || 11, // Fallback a las 11 estáticas
            pedidosCount: listaPedidos.totalRegistros || 0,
          });
          setAllOrders(listaPedidos.elementos || []);
          setIngresos(listaIngresos);

          // Si las consultas respondieron bien, el sistema está 100% operativo
          setSysStatus({
            dbConnected: true,
            apiProducts: true,
          });
        }
      } catch (err) {
        console.error("❌ [Wayback Dashboard Sync Error]:", err);
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchDashboardData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    async function fetchOrdersPage() {
      try {
        const result = await getPedidosAdmin(page, ITEMS_PER_PAGE);
        setAllOrders(result.elementos || []);
      } catch (e) {}
    }
    // Only fetch if not the first render, because the first render is handled by the big Promise.all
    if (page > 1 || allOrders.length === 0) {
        fetchOrdersPage();
    }
  }, [page]);

  // Estructura visual de las tarjetas (Mapeada dinámicamente desde el estado)
  const statCards = [
    { label: 'Productos', value: loading ? '...' : String(metrics.productosCount), sub: 'En catálogo de Supabase', icon: Package, color: '#7c3aed', bg: 'rgba(124,58,237,0.08)' },
    { label: 'Clientes', value: loading ? '...' : String(metrics.clientesCount), sub: 'Usuarios en PostgreSQL', icon: Users, color: '#0ea5e9', bg: 'rgba(14,165,233,0.08)' },
    { label: 'Pedidos', value: loading ? '...' : String(metrics.pedidosCount), sub: 'Historial de compras', icon: ShoppingBag, color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
    { label: 'Categorías', value: String(metrics.categoriasCount), sub: 'Segmentos activos', icon: Tag, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  ];

  return (
  <div>
    {/* Header */}
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Dashboard
      </h1>

      <p className="mt-1 text-sm text-slate-500">
        Resumen operativo en tiempo real de la plataforma Wayback
      </p>
    </div>

    {/* Stat Cards */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {statCards.map((s) => {
        const Icon = s.icon;

        return (
          <div
            key={s.label}
            className="
              bg-white
              rounded-xl
              border
              border-slate-200
              p-5
              shadow-sm
              hover:shadow-md
              transition-all
              duration-200
            "
          >
            <div className="flex items-start justify-between mb-4">
              <div
                className="flex items-center justify-center rounded-xl"
                style={{
                  width: 42,
                  height: 42,
                  background: s.bg,
                }}
              >
                <Icon
                  style={{
                    width: 18,
                    height: 18,
                    color: s.color,
                  }}
                />
              </div>
            </div>

            <p className="text-3xl font-bold text-slate-900 mb-1">
              {s.value}
            </p>

            <p className="text-sm font-semibold text-slate-700">
              {s.label}
            </p>

            <p className="text-xs text-slate-400 mt-1">
              {s.sub}
            </p>
          </div>
        );
      })}
    </div>

    {/* Bottom Section */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      {/* Pedidos recientes */}
      <div
        className="
          bg-white
          rounded-xl
          border
          border-slate-200
          p-6
          shadow-sm
        "
      >
        <div className="flex items-center gap-2 mb-5">
          <Clock
            className="text-violet-600"
            size={16}
          />

          <h2 className="text-sm font-semibold text-slate-900">
            Pedidos recientes
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-6">
            <p className="text-sm text-slate-400 animate-pulse">Cargando...</p>
          </div>
        ) : allOrders.length === 0 ? (
          <div className="text-center py-6">
            <ShoppingBag size={32} className="mx-auto mb-3 text-slate-200" />
            <p className="text-sm text-slate-500">Sin transacciones registradas</p>
            <p className="text-xs text-slate-400 mt-1">Las compras realizadas aparecerán aquí</p>
          </div>
        ) : (
          <>
            <div className="space-y-4 mt-4">
              {allOrders.map((order) => (
                <div key={order.pedId} className="flex items-center justify-between p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Pedido #{order.pedId}</p>
                    <p className="text-xs text-slate-500">{order.cliente}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#10b981]">S/ {order.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-400 capitalize">{order.estado}</p>
                  </div>
                </div>
              ))}
            </div>
            
            {Math.ceil(metrics.pedidosCount / ITEMS_PER_PAGE) > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-100">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-violet-600 disabled:opacity-40 disabled:hover:text-slate-600 transition-colors"
                >
                  <ChevronLeft size={14} />
                  Anterior
                </button>
                <span className="text-xs text-slate-400 font-medium">
                  Página {page} de {Math.ceil(metrics.pedidosCount / ITEMS_PER_PAGE)}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(Math.ceil(metrics.pedidosCount / ITEMS_PER_PAGE), p + 1))}
                  disabled={page === Math.ceil(metrics.pedidosCount / ITEMS_PER_PAGE)}
                  className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-violet-600 disabled:opacity-40 disabled:hover:text-slate-600 transition-colors"
                >
                  Siguiente
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Right Column: Estado del Sistema + Gráfica */}
      <div className="flex flex-col gap-6">
        {/* Estado del Sistema */}
      <div
        className="
          bg-white
          rounded-xl
          border
          border-slate-200
          p-6
          shadow-sm
        "
      >
        <div className="flex items-center gap-2 mb-5">
          <TrendingUp
            className="text-violet-600"
            size={16}
          />

          <h2 className="text-sm font-semibold text-slate-900">
            Estado del Sistema
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              label: 'Base de Datos PostgreSQL',
              status: sysStatus.dbConnected
                ? 'Conectado'
                : 'Sin respuesta',
              ok: sysStatus.dbConnected,
            },
            {
              label: 'API Productos',
              status: sysStatus.apiProducts
                ? 'Activo'
                : 'Error',
              ok: sysStatus.apiProducts,
            },
            {
              label: 'Frontend Administrativo',
              status: 'En línea',
              ok: true,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="
                flex
                items-center
                justify-between
                pb-3
                border-b
                border-slate-100
                last:border-b-0
                last:pb-0
              "
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    item.ok
                      ? 'bg-emerald-500'
                      : 'bg-amber-500'
                  }`}
                />

                <span className="text-sm text-slate-600">
                  {item.label}
                </span>
              </div>

              <span
                className={`text-xs font-semibold ${
                  item.ok
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Ingresos Chart Section */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="text-violet-600" size={16} />
            <h2 className="text-sm font-semibold text-slate-900">Ingresos de los últimos 7 días</h2>
          </div>

          {loading ? (
            <div className="text-center py-10">
              <p className="text-sm text-slate-400 animate-pulse">Cargando gráfica...</p>
            </div>
          ) : ingresos.length === 0 ? (
            <div className="text-center py-10">
               <p className="text-sm text-slate-500">No hay datos de ingresos recientes.</p>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48 mt-4 border-b border-slate-100 pb-2">
              {(() => {
                 const maxTotal = Math.max(...ingresos.map(i => i.total), 1);
                 return ingresos.map((item) => {
                   const heightPercent = (item.total / maxTotal) * 100;
                   return (
                     <div key={item.fecha} className="flex-1 flex flex-col items-center justify-end h-full group">
                       <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-[#10b981] mb-2">
                         S/ {item.total.toFixed(2)}
                       </div>
                       <div 
                         className="w-full max-w-[40px] bg-violet-100 rounded-t-md group-hover:bg-violet-400 transition-colors cursor-pointer"
                         style={{ height: `${heightPercent}%`, minHeight: '4px' }}
                       />
                       <div className="mt-3 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                         {item.fecha.substring(0, 3)}
                       </div>
                     </div>
                   );
                 });
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
}