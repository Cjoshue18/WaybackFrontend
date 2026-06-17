import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, SlidersHorizontal } from 'lucide-react';

interface Estilo {
  est_id: number;
  est_nombre: string;
}

// Datos iniciales en memoria local idénticos a los que tenías en pantalla
const INITIAL_ESTILOS: Estilo[] = [
  { est_id: 1, est_nombre: 'Boho' },
  { est_id: 2, est_nombre: 'Grunge' },
  { est_id: 3, est_nombre: 'Streetwear' },
  { est_id: 4, est_nombre: 'Y2K Casual' }
];

export function AdminEstilos() {
  const [estilos, setEstilos] = useState<Estilo[]>(INITIAL_ESTILOS);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Estilo | null>(null);
  const [nombre, setNombre] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false); // Desactivamos el loading de API
  const [error, setError] = useState<string | null>(null);

  const openAdd = () => {
    setEditing(null);
    setNombre('');
    setError(null);
    setShowForm(true);
  };

  const openEdit = (estilo: Estilo) => {
    setEditing(estilo);
    setNombre(estilo.est_nombre);
    setError(null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    // 🔥 Modificación local interactiva igual que en Categorías
    if (editing) {
      setEstilos((prev) =>
        prev.map((est) => (est.est_id === editing.est_id ? { ...est, est_nombre: nombre } : est))
      );
    } else {
      // Si es nuevo, genera un ID correlativo o temporal
      const nuevoId = estilos.length > 0 ? Math.max(...estilos.map(o => o.est_id)) + 1 : 1;
      setEstilos((prev) => [...prev, { est_id: nuevoId, est_nombre: nombre }]);
    }

    setShowForm(false);
    setNombre('');
    setEditing(null);
  };

  const handleDelete = () => {
    if (deleteId === null) return;
    // 🔥 Eliminación local interactiva
    setEstilos((prev) => prev.filter((est) => est.est_id !== deleteId));
    setDeleteId(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-purple-600" />
            Estilos
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {estilos.length} {estilos.length === 1 ? 'estilo activo' : 'estilos activos'}
          </p>
        </div>
        <button
          onClick={openAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold tracking-wider uppercase rounded transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Agregar
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-50 bg-gray-50/50">
          <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
            Lista de Estilos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-bold tracking-wider text-gray-400 uppercase bg-gray-50/30">
                <th className="py-4 px-6 w-24">ID</th>
                <th className="py-4 px-6">Nombre del Estilo</th>
                <th className="py-4 px-6 text-right w-28">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {estilos.map((estilo) => (
                <tr key={estilo.est_id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6 font-mono text-xs text-gray-400">
                    {String(estilo.est_id).padStart(2, '0')}
                  </td>
                  <td className="py-4 px-6 font-semibold text-gray-800">
                    {estilo.est_nombre}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => openEdit(estilo)}
                        className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
                        title="Editar estilo"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setDeleteId(estilo.est_id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Eliminar estilo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {estilos.length === 0 && (
          <div className="p-12 text-center">
            <p className="text-sm text-gray-500 font-medium">
              No se encontraron estilos registrados en el sistema.
            </p>
          </div>
        )}
      </div>

      {/* MODAL DE FORMULARIO */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-base font-bold text-gray-900">
                {editing ? 'Editar Estilo' : 'Agregar Nuevo Estilo'}
              </h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Nombre del Estilo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Y2K Heritage, Archivo, Grunge"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-purple-500 transition-colors text-gray-800"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors"
                >
                  {editing ? 'Guardar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINAR */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 max-w-sm w-full p-6">
            <h3 className="text-base font-bold text-gray-900 mb-2">¿Confirmar eliminación?</h3>
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Esta acción no se puede deshacer. El estilo será removido localmente del catálogo.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold tracking-wide uppercase hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold tracking-wide uppercase transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}