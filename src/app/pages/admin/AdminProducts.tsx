import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, X, ChevronDown } from 'lucide-react';

const CATEGORIAS = ['Pantalón','Falda','Shorts','Jogger','Camisetas','Suéteres','Chaquetas','Sets Baggy','Sets Denim','Sets Deportivos','Sets Tejidos'];
const TALLAS     = ['S','M','L','XL'];
const SEXOS      = ['Mujer','Hombre','Unisex'];

interface Producto {
  pro_id: number;
  pro_nombre: string;
  categoria: string;
  sexo: string;
  pro_descuento: number;
  pro_fecha_creacion: string;
}

const EMPTY_PRODUCTS: Producto[] = [];

interface FormData {
  pro_nombre: string;
  pro_descripcion: string;
  categoria: string;
  sexo: string;
  pro_descuento: string;
  talla: string;
  precio: string;
  stock: string;
}

const EMPTY_FORM: FormData = {
  pro_nombre: '', pro_descripcion: '', categoria: 'Camisetas',
  sexo: 'Unisex', pro_descuento: '0', talla: 'M', precio: '', stock: '0',
};

export function AdminProducts() {
  const [products, setProducts] = useState<Producto[]>(EMPTY_PRODUCTS);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Producto | null>(null);
  const [form,     setForm]     = useState<FormData>(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const filtered = products.filter((p) =>
    p.pro_nombre.toLowerCase().includes(search.toLowerCase()) ||
    p.categoria.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setForm(EMPTY_FORM); setEditing(null); setShowForm(true); };
  const openEdit = (p: Producto) => {
    setEditing(p);
    setForm({ pro_nombre: p.pro_nombre, pro_descripcion: '', categoria: p.categoria, sexo: p.sexo, pro_descuento: String(p.pro_descuento), talla: 'M', precio: '', stock: '0' });
    setShowForm(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setProducts((prev) => prev.map((p) => p.pro_id === editing.pro_id ? { ...p, pro_nombre: form.pro_nombre, categoria: form.categoria, sexo: form.sexo, pro_descuento: Number(form.pro_descuento) } : p));
    } else {
      const newProd: Producto = {
        pro_id: Date.now(),
        pro_nombre: form.pro_nombre,
        categoria: form.categoria,
        sexo: form.sexo,
        pro_descuento: Number(form.pro_descuento),
        pro_fecha_creacion: new Date().toLocaleDateString('es-PE'),
      };
      setProducts((prev) => [newProd, ...prev]);
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    setProducts((prev) => prev.filter((p) => p.pro_id !== id));
    setDeleteId(null);
  };

  const f = (k: keyof FormData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div>
      {/* header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Productos</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{products.length} productos registrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-white transition-colors"
          style={{ background: '#7c3aed', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
        >
          <Plus style={{ width: 14, height: 14 }} />
          Agregar
        </button>
      </div>

      {/* search */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 mb-5" style={{ border: '1px solid #f0f0f0', maxWidth: 380 }}>
        <Search style={{ width: 15, height: 15, color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-300"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* table */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
              {search ? `Sin resultados para "${search}"` : 'No hay productos registrados'}
            </p>
            <p style={{ fontSize: 12, color: '#d1d5db' }}>
              {!search && 'Agrega el primer producto con el botón de arriba'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['ID','Nombre','Categoría','Género','Descuento','Creado','Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.pro_id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>#{p.pro_id}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{p.pro_nombre}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#374151' }}>{p.categoria}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#374151' }}>{p.sexo}</td>
                  <td className="px-5 py-3.5">
                    {p.pro_descuento > 0 ? (
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#7c3aed', background: 'rgba(124,58,237,0.08)', padding: '2px 8px' }}>
                        -{p.pro_descuento}%
                      </span>
                    ) : <span style={{ fontSize: 12, color: '#d1d5db' }}>—</span>}
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>{p.pro_fecha_creacion}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-[#7c3aed] hover:bg-[rgba(124,58,237,0.05)] transition-colors">
                        <Edit2 style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={() => setDeleteId(p.pro_id)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors">
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

      {/* Add/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div
            className="relative z-10 bg-white w-full overflow-y-auto"
            style={{ maxWidth: 520, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}
          >
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{editing ? 'Editar producto' : 'Nuevo producto'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-600 transition-colors">
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <Field label="Nombre del producto">
                <input type="text" required value={form.pro_nombre} onChange={(e) => f('pro_nombre', e.target.value)} placeholder="Ej: Camiseta oversized blanca" className="form-input" />
              </Field>
              <Field label="Descripción">
                <textarea value={form.pro_descripcion} onChange={(e) => f('pro_descripcion', e.target.value)} rows={3} placeholder="Descripción del producto..." className="form-input resize-none" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Categoría">
                  <div className="relative">
                    <select value={form.categoria} onChange={(e) => f('categoria', e.target.value)} className="form-input appearance-none w-full pr-8">
                      {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <ChevronDown style={{ width: 13, height: 13, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </Field>
                <Field label="Género">
                  <div className="relative">
                    <select value={form.sexo} onChange={(e) => f('sexo', e.target.value)} className="form-input appearance-none w-full pr-8">
                      {SEXOS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <ChevronDown style={{ width: 13, height: 13, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Talla">
                  <div className="relative">
                    <select value={form.talla} onChange={(e) => f('talla', e.target.value)} className="form-input appearance-none w-full pr-8">
                      {TALLAS.map((t) => <option key={t}>{t}</option>)}
                    </select>
                    <ChevronDown style={{ width: 13, height: 13, position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
                  </div>
                </Field>
                <Field label="Precio (S/)">
                  <input type="number" min="0" step="0.01" value={form.precio} onChange={(e) => f('precio', e.target.value)} placeholder="0.00" className="form-input" />
                </Field>
                <Field label="Descuento (%)">
                  <input type="number" min="0" max="100" value={form.pro_descuento} onChange={(e) => f('pro_descuento', e.target.value)} placeholder="0" className="form-input" />
                </Field>
              </div>
              <Field label="Stock">
                <input type="number" min="0" value={form.stock} onChange={(e) => f('stock', e.target.value)} placeholder="0" className="form-input" />
              </Field>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors" style={{ fontSize: 12, fontWeight: 600 }}>
                  Cancelar
                </button>
                <button type="submit" className="flex-1 py-2.5 text-white transition-colors" style={{ background: '#7c3aed', fontSize: 12, fontWeight: 700 }}>
                  {editing ? 'Guardar cambios' : 'Crear producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete confirm */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white p-6" style={{ maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>¿Eliminar producto?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 border border-gray-200 text-gray-600 hover:border-gray-400 transition-colors" style={{ fontSize: 12, fontWeight: 600 }}>Cancelar</button>
              <button onClick={() => handleDelete(deleteId)} className="flex-1 py-2.5 bg-red-500 text-white hover:bg-red-600 transition-colors" style={{ fontSize: 12, fontWeight: 700 }}>Eliminar</button>
            </div>
          </div>
        </div>
      )}

      <style>{`.form-input { width: 100%; padding: 8px 12px; border: 1px solid #e5e7eb; background: #fafafa; font-size: 13px; color: #111; outline: none; } .form-input:focus { border-color: #7c3aed; background: #fff; }`}</style>
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
