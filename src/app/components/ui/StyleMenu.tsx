import { useState, useEffect } from 'react';

const API_URL = 'https://y2kvault-backend.onrender.com/api/estilos';

interface Estilo {
  est_id: number;
  est_nombre: string;
}

export function StyleMenu() {
  const [estilos, setEstilos] = useState<Estilo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerEstilosPublicos = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Error al cargar estilos');
        const data = await response.json();
        setEstilos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error en StyleMenu:', error);
      } finally {
        setLoading(false);
      }
    };

    obtenerEstilosPublicos();
  }, []);

  if (loading || estilos.length === 0) return null;

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm my-6">
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
        Explorar por Estilo
      </h3>
      <div className="flex flex-wrap gap-2">
        {estilos.map((estilo) => (
          <button
            key={estilo.est_id}
            className="px-4 py-2 bg-gray-50 text-gray-700 rounded-full text-sm font-medium transition-all hover:bg-purple-50 hover:text-purple-600 active:scale-95"
            onClick={() => console.log(`Filtrando productos por estilo: ${estilo.est_nombre}`)}
          >
            {estilo.est_nombre}
          </button>
        ))}
      </div>
    </div>
  );
}