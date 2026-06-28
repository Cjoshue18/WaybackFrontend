import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Eye } from 'lucide-react';
import { getProductos, fetchJson, API_BASE } from '@/lib/api';
import type { Product } from '@/lib/api';

const CATEGORIAS = ['Pantalón','Falda','Shorts','Jogger','Camisetas','Suéteres','Chaquetas','Sets Baggy','Sets Denim','Sets Deportivos','Sets Tejidos'];

// ✅ Géneros en minúsculas exactos que acepta el regex del backend: ^(masculino|femenino|unisex)$
const SEXOS: { label: string; value: string }[] = [
  { label: 'Mujer',   value: 'femenino'  },
  { label: 'Hombre',  value: 'masculino' },
  { label: 'Unisex',  value: 'unisex'    },
];

interface FormData {
  pro_nombre: string;
  pro_descripcion: string;
  categoria: string;          // nombre legible → se convierte a CatId al enviar
  sexo: string;               // 'masculino' | 'femenino' | 'unisex'
  precio: number;
  estiloId: number;           // EstId en el DTO
  imagenUrl: string;
  descuento: number;          // ProDescuento (short?)
  descuentoInicio: string;    // ISO string o vacío
  descuentoFin: string;       // ISO string o vacío
}

const EMPTY_FORM: FormData = {
  pro_nombre: '', pro_descripcion: '', categoria: 'Camisetas',
  sexo: 'unisex', precio: 0, estiloId: 1, imagenUrl: '',
  descuento: 0, descuentoInicio: '', descuentoFin: ''
};

// Mapa nombre legible → CatId relacional (índice 1-based de la lista CATEGORIAS)
const catIdFromNombre = (nombre: string): number => CATEGORIAS.indexOf(nombre) + 1;

// ISO completo → formato que aceptan los <input type="datetime-local"> ('YYYY-MM-DDTHH:mm').
const isoToLocalInput = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Mapa valor sexo almacenado en Product → value del selector
const sexoToValue = (sexo: string): string => {
  const s = (sexo ?? '').toLowerCase();
  if (s === 'mujer' || s === 'femenino') return 'femenino';
  if (s === 'hombre' || s === 'masculino') return 'masculino';
  return 'unisex';
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Product | null>(null);
  const [form,     setForm]     = useState<FormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [variantesOf, setVariantesOf] = useState<Product | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const sincronizarInventario = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProductos();
      setProducts(data ?? []);
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      setError('No se pudo cargar el inventario. Verifica tu sesión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { sincronizarInventario(); }, []);

  const filtered = products.filter((p) =>
    (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.categoria ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setError(null); setShowForm(true); };

  const openEdit = (p: Product) => {
    setEditing(p);
    setError(null);

    // Intentamos resolver el nombre de categoría desde el valor almacenado
    let catNombre = 'Camisetas';
    if (typeof p.categoria === 'number') {
      catNombre = CATEGORIAS[p.categoria - 1] ?? 'Camisetas';
    } else if (typeof p.categoria === 'string' && p.categoria.trim() !== '') {
      // El backend puede devolver el nombre directamente
      const match = CATEGORIAS.find(c => c.toLowerCase() === p.categoria?.toString().toLowerCase());
      catNombre = match ?? 'Camisetas';
    }

    setForm({
      pro_nombre:       p.name,
      // descripción y estilo no vienen en el GET /api/productos; quedan editables pero sin prefill.
      pro_descripcion:  'Prenda Wayback Original',
      categoria:        catNombre,
      sexo:             sexoToValue(p.sexo),
      precio:           p.price,
      estiloId:         1,
      imagenUrl:        p.image,
      // ✅ Prefijamos el descuento real para no borrarlo al guardar (antes se forzaba a 0).
      descuento:        p.proDescuento ?? 0,
      descuentoInicio:  p.proDescuentoInicio ?? '',
      descuentoFin:     p.proDescuentoFin ?? '',
    });
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // ✅ PAYLOAD exacto que acepta AdminUpsertProductosDTO del backend .NET
    const payload: Record<string, unknown> = {
      ProNombre:      form.pro_nombre.trim(),
      ProDescripcion: form.pro_descripcion.trim() || undefined,
      ProGenero:      form.sexo,                          // 'masculino'|'femenino'|'unisex'
      CatId:          catIdFromNombre(form.categoria),    // int requerido
      EstId:          Number(form.estiloId) || undefined, // int? opcional
      ProPrecio:      Number(form.precio),                // decimal requerido ≥ 0.10
      ProDescuento:   form.descuento > 0 ? form.descuento : undefined,
      ProDescuentoInicio: form.descuentoInicio || undefined,
      ProDescuentoFin:    form.descuentoFin    || undefined,
    };

    // Incluimos la URL de imagen solo si se proporcionó (el endpoint puede aceptarla extra)
    if (form.imagenUrl.trim()) {
      payload['ImagenesUrl'] = [form.imagenUrl.trim()];
    }

    // En edición incluimos el id para que el controlador haga UPDATE
    if (editing) {
      payload['ProId'] = Number(editing.id);
    }

    try {
      if (editing) {
        await fetchJson(`${API_BASE}/api/admin/reportes/productos/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        await fetchJson(`${API_BASE}/api/admin/reportes/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      setShowForm(false);
      await sincronizarInventario();
    } catch (err: any) {
      console.error('❌ Error guardando producto:', err);
      setError(err?.message ?? 'Error al guardar. Verifica los datos e inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await fetchJson(`${API_BASE}/api/admin/reportes/productos/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      await sincronizarInventario();
    } catch (err: any) {
      console.error('❌ Error eliminando producto:', err);
      setError(err?.message ?? 'No se pudo eliminar el artículo.');
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Productos</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{products.length} prendas en base de datos</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-white transition-colors"
          style={{ background: '#7c3aed', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Agregar Prenda
        </button>
      </div>

      {/* Banner de error global */}
      {error && !showForm && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
          <span style={{ fontSize: 13, color: '#b91c1c', flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600"><X style={{ width: 14, height: 14 }} /></button>
        </div>
      )}

      {/* Buscador */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 mb-5" style={{ border: '1px solid #f0f0f0', maxWidth: 380 }}>
        <Search style={{ width: 15, height: 15, color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre..." className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-300"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading && products.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400 animate-pulse">Cargando inventario...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af' }}>No se encontraron registros activos</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                {['Id', 'Nombre', 'Categoría', 'Precio', 'Acciones'].map((h) => (
                  <th key={h} className="px-5 py-3 text-gray-400 font-bold" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors" style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td className="px-5 py-3.5 font-mono" style={{ fontSize: 12, color: '#9ca3af' }}>#{p.id}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{p.name}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#374151' }}>{p.categoria || 'Sin categoría'}</td>
                  <td className="px-5 py-3.5 font-bold" style={{ fontSize: 13, color: '#111' }}>S/ {p.price.toFixed(2)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setVariantesOf(p)}
                        title="Ver variantes (talla / color / stock)"
                        className="relative p-1 text-gray-400 hover:text-[#7c3aed] transition-colors"
                      >
                        <Eye style={{ width: 14, height: 14 }} />
                        {(p.variantes?.length ?? 0) > 0 && (
                          <span
                            className="absolute -top-1 -right-1 flex items-center justify-center text-white"
                            style={{ minWidth: 14, height: 14, padding: '0 3px', borderRadius: 7, background: '#7c3aed', fontSize: 9, fontWeight: 700, lineHeight: 1 }}
                          >
                            {p.variantes!.length}
                          </span>
                        )}
                      </button>
                      <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-[#7c3aed] transition-colors" title="Editar">
                        <Edit2 style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={() => setDeleteId(p.id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors" title="Eliminar">
                        <Trash2 style={{ width: 13, height: 13 }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MODAL FORMULARIO ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setShowForm(false)} />
          <div className="relative z-10 bg-white w-full max-w-[540px] overflow-y-auto" style={{ maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{editing ? 'Editar prenda' : 'Nueva prenda'}</h3>
              <button onClick={() => !saving && setShowForm(false)} className="text-gray-300 hover:text-gray-600" disabled={saving}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {/* Error en modal */}
            {error && (
              <div className="mx-6 mt-4 px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
                <p style={{ fontSize: 12, color: '#b91c1c' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">

              <Field label="Nombre del producto *">
                <input
                  type="text" required value={form.pro_nombre}
                  onChange={(e) => setForm({...form, pro_nombre: e.target.value})}
                  className="form-input" maxLength={100}
                />
              </Field>

              <Field label="Descripción">
                <input
                  type="text" value={form.pro_descripcion}
                  onChange={(e) => setForm({...form, pro_descripcion: e.target.value})}
                  className="form-input" maxLength={500}
                />
              </Field>

              <Field label="URL de Imagen">
                <input
                  type="text" value={form.imagenUrl}
                  onChange={(e) => setForm({...form, imagenUrl: e.target.value})}
                  className="form-input" placeholder="https://..."
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Categoría *">
                  <select value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} className="form-input w-full">
                    {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Estilo (EstId)">
                  <input
                    type="number" min="1" value={form.estiloId || ''}
                    onChange={(e) => setForm({...form, estiloId: Number(e.target.value)})}
                    className="form-input"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Género *">
                  {/* ✅ Los values coinciden exactamente con el regex del backend */}
                  <select value={form.sexo} onChange={(e) => setForm({...form, sexo: e.target.value})} className="form-input w-full">
                    {SEXOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </Field>
                <Field label="Precio (S/) *">
                  <input
                    type="number" required min="0.10" step="0.01" value={form.precio || ''}
                    onChange={(e) => setForm({...form, precio: Number(e.target.value)})}
                    className="form-input"
                  />
                </Field>
              </div>

              {/* Descuento (opcional) */}
              <details>
                <summary style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#6b7280', textTransform: 'uppercase', cursor: 'pointer', userSelect: 'none' }}>
                  Descuento (opcional)
                </summary>
                <div className="grid grid-cols-3 gap-4 mt-3">
                  <Field label="% Descuento">
                    <input
                      type="number" min="0" max="100" value={form.descuento || ''}
                      onChange={(e) => setForm({...form, descuento: Number(e.target.value)})}
                      className="form-input"
                    />
                  </Field>
                  <Field label="Inicio">
                    <input
                      type="datetime-local" value={isoToLocalInput(form.descuentoInicio)}
                      onChange={(e) => setForm({...form, descuentoInicio: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                      className="form-input"
                    />
                  </Field>
                  <Field label="Fin">
                    <input
                      type="datetime-local" value={isoToLocalInput(form.descuentoFin)}
                      onChange={(e) => setForm({...form, descuentoFin: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                      className="form-input"
                    />
                  </Field>
                </div>
              </details>

              <div className="flex gap-3 pt-2">
                <button
                  type="button" onClick={() => setShowForm(false)} disabled={saving}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600"
                  style={{ opacity: saving ? 0.5 : 1 }}
                >
                  Cancelar
                </button>
                <button
                  type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-white"
                  style={{ background: saving ? '#a78bfa' : '#7c3aed' }}
                >
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL ELIMINAR ── */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white p-6 max-w-[360px]" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>¿Eliminar artículo?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Esta acción es permanente y eliminará el producto del servidor.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 text-white font-bold" disabled={loading}>
                {loading ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL VARIANTES (visor talla / color / stock) ── */}
      {variantesOf && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setVariantesOf(null)} />
          <div className="relative z-10 bg-white w-full max-w-[520px] overflow-y-auto" style={{ maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>Variantes</h3>
                <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{variantesOf.name} · #{variantesOf.id}</p>
              </div>
              <button onClick={() => setVariantesOf(null)} className="text-gray-300 hover:text-gray-600">
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            <div className="p-6">
              {(variantesOf.variantes?.length ?? 0) === 0 ? (
                <div className="text-center py-12" style={{ border: '1px dashed #e5e7eb' }}>
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>Esta prenda no tiene variantes registradas.</p>
                  <p style={{ fontSize: 12, color: '#d1d5db', marginTop: 4 }}>Las combinaciones de talla y color se cargan desde inventario.</p>
                </div>
              ) : (
                <>
                  {/* Resumen de stock total */}
                  {(() => {
                    const vs = variantesOf.variantes!;
                    const stockTotal = vs.reduce((acc, v) => acc + (v.varStock || 0), 0);
                    const agotadas = vs.filter((v) => (v.varStock || 0) === 0).length;
                    return (
                      <div className="flex gap-6 mb-5">
                        <Resumen label="Combinaciones" valor={String(vs.length)} />
                        <Resumen label="Stock total" valor={String(stockTotal)} color={stockTotal === 0 ? '#ef4444' : '#7c3aed'} />
                        <Resumen label="Agotadas" valor={String(agotadas)} color={agotadas > 0 ? '#ef4444' : '#111'} />
                      </div>
                    );
                  })()}

                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                        {['Talla', 'Color', 'Stock'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-gray-400 font-bold" style={{ fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {variantesOf.variantes!.map((v) => {
                        const sinStock = (v.varStock || 0) === 0;
                        const hex = v.colorHex ? (v.colorHex.startsWith('#') ? v.colorHex : `#${v.colorHex}`) : '#e5e7eb';
                        return (
                          <tr key={v.varId} style={{ borderBottom: '1px solid #f9f9f9' }}>
                            <td className="px-4 py-3" style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{v.varTalla || '—'}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <span style={{ width: 16, height: 16, borderRadius: '50%', background: hex, border: '1px solid #e5e7eb', flexShrink: 0 }} />
                                <span style={{ fontSize: 13, color: '#374151' }}>{v.colorNombre || '—'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {sinStock ? (
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Agotado</span>
                              ) : (
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#111' }}>{v.varStock}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .form-input {
          width: 100%; padding: 8px 12px;
          border: 1px solid #e5e7eb; background: #fafafa;
          font-size: 13px; color: #111; outline: none;
        }
        .form-input:focus { border-color: #7c3aed; background: #fff; }
        details > summary::-webkit-details-marker { display: none; }
      `}</style>
    </div>
  );
}

function Resumen({ label, valor, color = '#111' }: { label: string; valor: string; color?: string }) {
  return (
    <div>
      <p style={{ fontSize: 22, fontWeight: 800, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{valor}</p>
      <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase', marginTop: 4 }}>{label}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}