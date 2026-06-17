import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, ChevronDown, Eye } from 'lucide-react';
// 🛠️ Usamos getProductos y fetchJson unificados que inyectan de forma transparente el JWT
import { getProductos, fetchJson } from '@/lib/api'; 
import type { Product } from '@/lib/api';

const API_BASE = 'https://y2kvault-backend.onrender.com';

const CATEGORIAS = ['Pantalón','Falda','Shorts','Jogger','Camisetas','Suéteres','Chaquetas','Sets Baggy','Sets Denim','Sets Deportivos','Sets Tejidos'];
const SEXOS      = ['Mujer','Hombre','Unisex'];

interface FormData {
  pro_nombre: string;
  pro_descripcion: string;
  categoria: string;
  sexo: string;
  precio: number;
  stock: number;
  estiloId: number; // 🔑 Sincronizado con el filtro combinado de Gaby/Joshue
  imagenUrl: string;
}

const EMPTY_FORM: FormData = {
  pro_nombre: '', pro_descripcion: '', categoria: 'Camisetas',
  sexo: 'Unisex', precio: 0, stock: 0, estiloId: 4, imagenUrl: ''
};

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Product | null>(null);
  const [form,     setForm]     = useState<FormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading,  setLoading]  = useState(true);

  // 📡 Traer inventario real desde el backend protegido por JWT
  const sincronizarInventarioRemoto = async () => {
    setLoading(true);
    try {
      const data = await getProductos();
      setProducts(data ?? []);
    } catch (err) {
      console.error("❌ Error consumiendo endpoint de administración protegido:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    sincronizarInventarioRemoto();
  }, []);

  const filtered = products.filter((p) =>
    (p.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.categoria ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); };
  
  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      pro_nombre: p.name,
      pro_descripcion: 'Prenda Wayback Original',
      categoria: String(p.categoria ?? 'Camisetas'),
      sexo: p.sexo,
      precio: p.price,
      stock: 12, // Stock base operativo
      estiloId: 4, // Estilo Y2K asignado por defecto en la coordinación
      imagenUrl: p.image
    });
    setShowForm(true);
  };

const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // 🔑 PAYLOAD REPARADO CON LA PROPIEDAD EXIGIDA POR EL VALIDADOR DE .NET
    const payload = {
      ProId: editing ? Number(editing.id) : 0,
      ProNombre: form.pro_nombre,
      ProPrecio: Number(form.precio),
      ProStock: Number(form.stock),
      ProGenero: form.sexo || "Unisex", // 🎯 ¡REPARADO!: Cambiado de ProSexo a ProGenero
      CategoriaId: CATEGORIAS.indexOf(form.categoria) + 1, 
      EstiloId: Number(form.estiloId || 4),
      ProDescuento: 0,
      ProPrecioOriginal: Number(form.precio),
      ProTallas: "M",
      ImagenesUrl: [form.imagenUrl || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500']
    };

    try {
      if (editing) {
        // Envíamos el PUT por segmento directo al endpoint administrativo validado
        await fetchJson(`${API_BASE}/api/admin/reportes/productos/${editing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // POST para inserciones nuevas
        await fetchJson(`${API_BASE}/api/admin/reportes/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      setShowForm(false);
      await sincronizarInventarioRemoto();
    } catch (err) {
      console.error("❌ Error enviando payload al controlador administrativo:", err);
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setLoading(true);
    try {
      // DELETE contra el controlador relacional unificado
      await fetchJson(`${API_BASE}/api/admin/reportes/productos/${id}`, { method: 'DELETE' });
      setDeleteId(null);
      await sincronizarInventarioRemoto();
    } catch (err) {
      console.error("❌ No se pudo eliminar el artículo del inventario:", err);
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

      {/* Buscador */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 mb-5" style={{ border: '1px solid #f0f0f0', maxWidth: 380 }}>
        <Search style={{ width: 15, height: 15, color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto por nombre..." className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-300"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* ── FORMATO DE TABLA REQUERIDO POR EL EQUIPO (VISTA OPERATIVA) ── */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading && products.length === 0 ? (
          <p className="p-8 text-center text-sm text-gray-400 animate-pulse">Sincronizando inventario con Render mediante JWT...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af' }}>No se encontraron registros activos</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
                {['Id de Producto', 'Nombre', 'Categoría', 'Precio', 'Acciones'].map((h) => (
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
                      {/* Botón Ver Más / Variantes (Estructurado según requerimientos) */}
                      <button type="button" title="Ver variantes (Módulo postergado)" className="p-1 text-gray-300 cursor-not-allowed">
                        <Eye style={{ width: 14, height: 14 }} />
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

      {/* Modal Formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative z-10 bg-white w-full max-w-[520px] overflow-y-auto" style={{ maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{editing ? 'Editar prenda' : 'Nueva prenda'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-600"><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Nombre del producto">
                <input type="text" required value={form.pro_nombre} onChange={(e) => setForm({...form, pro_nombre: e.target.value})} className="form-input" />
              </Field>
              <Field label="URL de Imagen (Supabase)">
                <input type="text" required value={form.imagenUrl} onChange={(e) => setForm({...form, imagenUrl: e.target.value})} className="form-input" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Categoría">
                  <select value={form.categoria} onChange={(e) => setForm({...form, categoria: e.target.value})} className="form-input w-full">
                    {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Estilo (ID del Filtro Combinado)">
                  <input type="number" required value={form.estiloId} onChange={(e) => setForm({...form, estiloId: Number(e.target.value)})} className="form-input" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Género">
                  <select value={form.sexo} onChange={(e) => setForm({...form, sexo: e.target.value})} className="form-input w-full">
                    {SEXOS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
                <Field label="Precio (S/)">
                  <input type="number" min="0" step="0.01" value={form.precio || ''} onChange={(e) => setForm({...form, precio: Number(e.target.value)})} className="form-input" />
                </Field>
                <Field label="Stock Inicial">
                  <input type="number" min="0" value={form.stock || ''} onChange={(e) => setForm({...form, stock: Number(e.target.value)})} className="form-input" />
                </Field>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 text-white" style={{ background: '#7c3aed' }}>Guardar Cambios</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Eliminar */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white p-6 max-w-[360px]" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>¿Eliminar artículo remoto?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Esta acción modificará los índices relacionales en el servidor de producción.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600">Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 text-white font-bold">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.form-input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; background: #fafafa; font-size: 13px; color: #111; outline: none; }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}