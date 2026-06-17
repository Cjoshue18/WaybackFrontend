import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X, Plus } from 'lucide-react';
// 🛠️ Importamos los métodos CRUD reales que creamos en tu api.ts
import { getClientes, createCliente, updateCliente, deleteCliente } from '@/lib/api';

interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_documento_tipo: string;
  cli_documento: string;
  cli_fecha_registro: string;
}

const EMPTY_CLIENTS: Cliente[] = [];

const EMPTY_FORM = {
  cli_nombre: '', cli_apellido: '', cli_email: '', cli_documento_tipo: 'DNI', cli_documento: '',
};

export function AdminClients() {
  const [clients,   setClients]   = useState<Cliente[]>(EMPTY_CLIENTS);
  const [search,    setSearch]    = useState('');
  const [showForm,  setShowForm]  = useState(false);
  const [editing,   setEditing]   = useState<Cliente | null>(null);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [deleteId,  setDeleteId]  = useState<number | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState<string | null>(null);

  const filtered = clients.filter((c) =>
    `${c.cli_nombre} ${c.cli_apellido} ${c.cli_email}`.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  
  const openEdit = (c: Cliente) => {
    setEditing(c);
    setForm({ 
      cli_nombre: c.cli_nombre, 
      cli_apellido: c.cli_apellido, 
      cli_email: c.cli_email, 
      cli_documento_tipo: c.cli_documento_tipo, 
      cli_documento: c.cli_documento 
    });
    setShowForm(true);
  };

  // Función reutilizable para refrescar la grilla desde el servidor de Render
  // Función reutilizable para refrescar la grilla desde el servidor de Render
  const loadRemoteData = async (isActive: boolean) => {
    try {
      const remote = await getClientes();
      if (isActive) {
        // Si el servidor responde un arreglo vacío o nulo, aseguramos que caiga en un array limpio
        setClients(remote ?? []);
        setError(null);
      }
    } catch (err: any) {
      if (isActive) {
        console.error("❌ [Wayback Admin Auth Sync Error]:", err);
        setError('No se pudieron cargar los clientes. Verifica que hayas iniciado sesión con una cuenta de Administrador válida.');
      }
    } finally {
      if (isActive) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadRemoteData(active);
    return () => { active = false; };
  }, []);

  // 🛠️ GUARDAR REAL (POST / PUT) CONECTADO CON EL BACKEND
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (editing) {
        // Ejecuta petición PUT pasándole el Token de forma transparente
        await updateCliente(editing.cli_id, form);
      } else {
        // Ejecuta petición POST para insertar en la Base de Datos
        await createCliente(form);
      }
      setShowForm(false);
      await loadRemoteData(true); // Recarga datos frescos del servidor
    } catch (err) {
      setError('Error al intentar guardar los datos del cliente en el servidor.');
      setLoading(false);
    }
  };

  // 🛠️ ELIMINAR REAL (DELETE) CONECTADO CON EL BACKEND
  const handleDelete = async (id: number) => {
    setError(null);
    setLoading(true);
    try {
      // Ejecuta petición DELETE contra Render
      await deleteCliente(id);
      setDeleteId(null);
      await loadRemoteData(true); // Recarga datos limpios
    } catch (err) {
      setError('Error de comunicación. No se pudo eliminar el registro del servidor.');
      setLoading(false);
      setDeleteId(null);
    }
  };

  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Clientes</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{clients.length} clientes registrados</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 text-white"
          style={{ background: '#7c3aed', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
        >
          <Plus style={{ width: 14, height: 14 }} /> Agregar
        </button>
      </div>

      {/* search */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 mb-5" style={{ border: '1px solid #f0f0f0', maxWidth: 380 }}>
        <Search style={{ width: 15, height: 15, color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..." className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-300"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* table */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {error ? (
          <div className="px-5 py-4 text-sm text-red-600" style={{ background: '#fff1f2' }}>
            {error}
          </div>
        ) : null}
        {loading ? (
          <div className="text-center py-16">
            <p className="animate-pulse" style={{ fontSize: 14, color: '#9ca3af' }}>Sincronizando con el servidor seguro...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
              {search ? `Sin resultados para "${search}"` : 'No hay clientes registrados'}
            </p>
            <p style={{ fontSize: 12, color: '#d1d5db' }}>
              {!search && 'Los clientes aparecerán aquí al registrarse'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['ID','Nombre','Email','Documento','Registrado','Acciones'].map((h) => (
                  <th key={h} className="text-left px-5 py-3" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: '#9ca3af', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.cli_id} className="hover:bg-gray-50 transition-colors" style={{ borderBottom: '1px solid #f9f9f9' }}>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>#{c.cli_id}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 13, fontWeight: 600, color: '#111' }}>{c.cli_nombre} {c.cli_apellido}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#374151' }}>{c.cli_email}</td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#374151' }}>
                    <span className="bg-gray-100 text-gray-600 px-1 py-0.5 rounded text-[10px] font-bold mr-1">{c.cli_documento_tipo}</span>
                    {c.cli_documento}
                  </td>
                  <td className="px-5 py-3.5" style={{ fontSize: 12, color: '#9ca3af' }}>
                    {c.cli_fecha_registro ? new Date(c.cli_fecha_registro).toLocaleDateString('es-PE') : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-300 hover:text-[#7c3aed] transition-colors">
                        <Edit2 style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={() => setDeleteId(c.cli_id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors">
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

      {/* form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowForm(false)} />
          <div className="relative z-10 bg-white w-full overflow-y-auto" style={{ maxWidth: 480, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-600 transition-colors"><X style={{ width: 16, height: 16 }} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Nombre"><input required type="text" value={form.cli_nombre} onChange={(e) => f('cli_nombre', e.target.value)} placeholder="Juan" className="fi" /></FormField>
                <FormField label="Apellido"><input required type="text" value={form.cli_apellido} onChange={(e) => f('cli_apellido', e.target.value)} placeholder="García" className="fi" /></FormField>
              </div>
              <FormField label="Email"><input required type="email" value={form.cli_email} onChange={(e) => f('cli_email', e.target.value)} placeholder="juan@correo.com" className="fi" /></FormField>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Tipo documento">
                  <select value={form.cli_documento_tipo} onChange={(e) => f('cli_documento_tipo', e.target.value)} className="fi w-full">
                    {['DNI','RUC','Pasaporte','CE'].map((t) => <option key={t}>{t}</option>)}
                  </select>
                </FormField>
                <FormField label="Número"><input required type="text" value={form.cli_documento} onChange={(e) => f('cli_documento', e.target.value)} placeholder="12345678" className="fi" /></FormField>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 text-gray-600" style={{ fontSize: 12 }}>Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 text-white" style={{ background: '#7c3aed', fontSize: 12, fontWeight: 700 }}>{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* delete confirmation modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteId(null)} />
          <div className="relative z-10 bg-white p-6" style={{ maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>¿Eliminar cliente?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Se eliminarán también sus pedidos y datos asociados del servidor.</p>
            <div className="flex gap-3">
              <div className="flex-1">
                <button onClick={() => setDeleteId(null)} className="w-full py-2.5 border border-gray-200 text-gray-600" style={{ fontSize: 12 }}>Cancelar</button>
              </div>
              <div className="flex-1">
                <button onClick={() => handleDelete(deleteId)} className="w-full py-2.5 bg-red-500 text-white hover:bg-red-600 transition-colors" style={{ fontSize: 12, fontWeight: 700 }}>Eliminar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`.fi { width:100%; padding:8px 12px; border:1px solid #e5e7eb; background:#fafafa; font-size:13px; color:#111; outline:none; } .fi:focus { border-color:#7c3aed; background:#fff; }`}</style>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
} 