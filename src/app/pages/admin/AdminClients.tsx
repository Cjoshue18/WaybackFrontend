import { useState, useEffect } from 'react';
import { Search, Edit2, Trash2, X } from 'lucide-react';
import { getClientes, updateCliente, deleteCliente } from '@/lib/api';

interface Cliente {
  cli_id: number;
  cli_nombre: string;
  cli_apellido: string;
  cli_email: string;
  cli_documento_tipo: string;
  cli_documento: string;
  cli_fecha_registro: string;
}

// Formulario completo (CREATE usa todos los campos; EDIT solo nombre/apellido/email)
const EMPTY_FORM = {
  cli_nombre: '',
  cli_apellido: '',
  cli_email: '',
  cli_documento_tipo: 'DNI',
  cli_documento: '',
};

export function AdminClients() {
  const [clients,  setClients]  = useState<Cliente[]>([]);
  const [search,   setSearch]   = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing,  setEditing]  = useState<Cliente | null>(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const filtered = clients.filter((c) =>
    `${c.cli_nombre} ${c.cli_apellido} ${c.cli_email}`.toLowerCase().includes(search.toLowerCase())
  );

  const loadClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getClientes();
      setClients(data ?? []);
    } catch (err) {
      console.error('❌ Error cargando clientes:', err);
      setError('No se pudieron cargar los clientes. Verifica que hayas iniciado sesión como Administrador.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClients(); }, []);

  const openEdit = (c: Cliente) => {
    setEditing(c);
    // Solo cargamos los campos que el backend permite editar
    setForm({
      cli_nombre:         c.cli_nombre,
      cli_apellido:       c.cli_apellido,
      cli_email:          c.cli_email,
      // Estos dos se muestran como solo-lectura en modo edición
      cli_documento_tipo: c.cli_documento_tipo,
      cli_documento:      c.cli_documento,
    });
    setError(null);
    setShowForm(true);
  };

const handleSave = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError(null);

  try {
    if (!editing) return;

    await updateCliente(editing.cli_id, {
      cli_nombre: form.cli_nombre,
      cli_apellido: form.cli_apellido,
      cli_email: form.cli_email,
    });

    setShowForm(false);
    await loadClients();
  } catch (err) {
    console.error('❌ Error guardando cliente:', err);
    setError('Error al guardar los datos del cliente. Inténtalo de nuevo.');
  } finally {
    setSaving(false);
  }
};

  const handleDelete = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      await deleteCliente(id);
      setDeleteId(null);
      await loadClients();
    } catch (err) {
      console.error('❌ Error eliminando cliente:', err);
      setError('No se pudo eliminar el cliente del servidor.');
      setDeleteId(null);
    } finally {
      setSaving(false);
    }
  };

  const f = (k: keyof typeof EMPTY_FORM, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div>
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 4 }}>Clientes</h1>
          <p style={{ fontSize: 13, color: '#9ca3af' }}>{clients.length} clientes registrados</p>
        </div>
      </div>

      {/* Error global */}
      {error && !showForm && deleteId === null && (
        <div className="flex items-center gap-3 mb-4 px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
          <span style={{ fontSize: 13, color: '#b91c1c', flex: 1 }}>{error}</span>
          <button onClick={() => setError(null)}><X style={{ width: 14, height: 14, color: '#b91c1c' }} /></button>
        </div>
      )}

      {/* Buscador */}
      <div className="flex items-center gap-3 bg-white px-4 py-2.5 mb-5" style={{ border: '1px solid #f0f0f0', maxWidth: 380 }}>
        <Search style={{ width: 15, height: 15, color: '#9ca3af', flexShrink: 0 }} />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar cliente..." className="flex-1 outline-none bg-transparent text-gray-700 placeholder-gray-300"
          style={{ fontSize: 13 }}
        />
      </div>

      {/* Tabla */}
      <div className="bg-white" style={{ border: '1px solid #f0f0f0', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {loading ? (
          <div className="text-center py-16">
            <p className="animate-pulse" style={{ fontSize: 14, color: '#9ca3af' }}>Sincronizando con el servidor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p style={{ fontSize: 14, color: '#9ca3af', marginBottom: 6 }}>
              {search ? `Sin resultados para "${search}"` : 'No hay clientes registrados'}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                {['ID', 'Nombre', 'Email', 'Documento', 'Registrado', 'Acciones'].map((h) => (
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
                      <button onClick={() => openEdit(c)} className="p-1.5 text-gray-300 hover:text-[#7c3aed] transition-colors" title="Editar">
                        <Edit2 style={{ width: 13, height: 13 }} />
                      </button>
                      <button onClick={() => setDeleteId(c.cli_id)} className="p-1.5 text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
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

      {/* Modal formulario */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setShowForm(false)} />
          <div className="relative z-10 bg-white w-full overflow-y-auto" style={{ maxWidth: 480, maxHeight: '90vh', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #f3f4f6' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: '#111' }}>{editing ? 'Editar cliente' : 'Nuevo cliente'}</h3>
              <button onClick={() => !saving && setShowForm(false)} className="text-gray-300 hover:text-gray-600 transition-colors" disabled={saving}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>

            {error && (
              <div className="mx-6 mt-4 px-4 py-3" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                <p style={{ fontSize: 12, color: '#b91c1c' }}>{error}</p>
              </div>
            )}

            <form onSubmit={handleSave} className="p-6 flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Nombre">
                  <input required type="text" value={form.cli_nombre} onChange={(e) => f('cli_nombre', e.target.value)} placeholder="Juan" className="fi" disabled={saving} />
                </FormField>
                <FormField label="Apellido">
                  <input required type="text" value={form.cli_apellido} onChange={(e) => f('cli_apellido', e.target.value)} placeholder="García" className="fi" disabled={saving} />
                </FormField>
              </div>

              <FormField label="Email">
                <input required type="email" value={form.cli_email} onChange={(e) => f('cli_email', e.target.value)} placeholder="juan@correo.com" className="fi" disabled={saving} />
              </FormField>

              {/* Documento: editable solo al CREAR, solo-lectura al EDITAR */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={editing ? 'Tipo documento (no editable)' : 'Tipo documento'}>
                  {editing ? (
                    <div className="fi" style={{ background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' }}>
                      {form.cli_documento_tipo}
                    </div>
                  ) : (
                    <select value={form.cli_documento_tipo} onChange={(e) => f('cli_documento_tipo', e.target.value)} className="fi w-full" disabled={saving}>
                      {['DNI', 'RUC', 'Pasaporte', 'CE'].map((t) => <option key={t}>{t}</option>)}
                    </select>
                  )}
                </FormField>
                <FormField label={editing ? 'Número (no editable)' : 'Número'}>
                  <input
                    type="text" value={form.cli_documento}
                    onChange={(e) => !editing && f('cli_documento', e.target.value)}
                    placeholder="12345678" className="fi"
                    readOnly={!!editing}
                    style={editing ? { background: '#f3f4f6', color: '#9ca3af', cursor: 'not-allowed' } : {}}
                  />
                </FormField>
              </div>

              {editing && (
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: -8 }}>
                  * El tipo y número de documento no pueden modificarse una vez registrados.
                </p>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} disabled={saving}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600" style={{ fontSize: 12, opacity: saving ? 0.5 : 1 }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 text-white" style={{ background: saving ? '#a78bfa' : '#7c3aed', fontSize: 12, fontWeight: 700 }}>
                  {saving ? 'Guardando...' : editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => !saving && setDeleteId(null)} />
          <div className="relative z-10 bg-white p-6" style={{ maxWidth: 360, boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: '#111', marginBottom: 8 }}>¿Eliminar cliente?</h3>
            <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>Se eliminarán también sus pedidos y datos asociados del servidor.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} disabled={saving}
                className="flex-1 py-2.5 border border-gray-200 text-gray-600" style={{ fontSize: 12, opacity: saving ? 0.5 : 1 }}>
                Cancelar
              </button>
              <button onClick={() => handleDelete(deleteId)} disabled={saving}
                className="flex-1 py-2.5 bg-red-500 text-white hover:bg-red-600 transition-colors" style={{ fontSize: 12, fontWeight: 700 }}>
                {saving ? 'Eliminando...' : 'Eliminar'}
              </button>
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