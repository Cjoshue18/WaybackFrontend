import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router'; 
import { FilterSidebar } from '@/app/components/FilterSidebar';
import { ProductCard } from '@/app/components/ProductCard'; 
import { getProductos } from '@/lib/api';
import type { Product } from '@/lib/api';

export function CatalogoPage() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [searchParams, setSearchParams] = useSearchParams(); 

  const categoriaUrl = searchParams.get('categoria');
  
  const [filters, setFilters] = useState<any>({
    categorias: categoriaUrl ? [categoriaUrl] : [], 
    sexo: [],
    colors: [],
    tallas: [],
    soloDisponibles: false,
    precioMin: 0,
    precioMax: 500
  });

  useEffect(() => {
    const cat = searchParams.get('categoria');
    if (cat) setFilters((f: any) => ({ ...f, categorias: [cat] }));
  }, [searchParams]);

  // ── 🎯 CONSUMO DINÁMICO CONECTADO A LOS FILTROS DE C# ──
  useEffect(() => {
    let active = true;
    setLoading(true);

    getProductos({
      categoria: filters.categorias.length > 0 ? filters.categorias[0] : undefined,
      genero: filters.sexo.length > 0 ? filters.sexo[0] : undefined,
      precioMin: filters.precioMin,
      precioMax: filters.precioMax
    })
      .then(res => {
        if (active) {
          console.log("👉 [Wayback C# Catalogo Sync]:", res.length, "prendas recibidas.");
          setProductos(res ?? []);
        }
      })
      .catch(err => console.error("Error conectando a la API:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  // 🔑 CORREGIDO: Agregados filters.tallas y filters.colors para activar el ciclo de renderizado de React
  }, [filters.categorias, filters.sexo, filters.precioMin, filters.precioMax, filters.tallas, filters.colors]); 

  // Función de escape para limpiar filtros
  const resetAll = () => {
    setSearchParams({});
    setFilters({
      categorias: [],
      sexo: [],
      colors: [],
      tallas: [],
      soloDisponibles: false,
      precioMin: 0,
      precioMax: 500
    });
  };

  // ── 📐 ESCUDO DE FILTRADO COMPLEMENTARIO LOCAL CORREGIDO ──
  const productosFiltrados = useMemo(() => {
    // Mapa espejo id -> HEX idéntico al de tu FilterSidebar.tsx
    const MAPA_COLORS_HEX: Record<number, string> = {
      1: '#FFFFFF', // Blanco
      2: '#000000', // Negro
      3: '#0000FF', // Azul
      4: '#008000', // Verde
      5: '#FFFF00', // Amarillo
      6: '#FF0000', // Rojo
      7: '#FFC0CB', // Rosa
      8: '#800080', // Morado
    };

    return productos.filter((producto) => {
      
      // 🎨 1. Filtro de Colores (Mapea el ID seleccionado al HEX de la prenda)
      if (filters.colors && filters.colors.length > 0) {
        const hexSeleccionados = filters.colors.map((id: number) => MAPA_COLORS_HEX[id] || '');
        const arrayColoresPrenda = Array.isArray(producto.colors) ? producto.colors.map(String) : [];
        
        const match = arrayColoresPrenda.some((colorHex: string) => 
          hexSeleccionados.includes(colorHex.toUpperCase())
        );
        if (!match) return false;
      }

      // 📐 2. Filtro de Tallas ULTRA-SEGURO
      if (filters.tallas && filters.tallas.length > 0) {
        const tallasPrenda = Array.isArray(producto.tallas) 
          ? producto.tallas.map((t: any) => String(t).trim().toUpperCase())
          : [];

        const tallasSeleccionadas = filters.tallas.map((x: string) => String(x).trim().toUpperCase());
        const match = tallasPrenda.some((t: string) => tallasSeleccionadas.includes(t));
        
        if (!match) return false;
      }

      // 🛒 3. Filtro de Disponibilidad (Stock)
      if (filters.soloDisponibles) {
        if (!producto.inStock) return false;
      }

      return true;
    });
  }, [productos, filters.colors, filters.tallas, filters.soloDisponibles]);

  return (
    <div className="container mx-auto px-6 py-8 flex gap-8 min-h-[60vh]">
      <FilterSidebar filters={filters} setFilters={setFilters} />

      <div className="flex-1">
        <h2 className="text-xl font-black uppercase tracking-tight mb-6 text-gray-900">
          Catálogo de Productos
        </h2>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[1, 2, 3, 6].map((n) => (
              <div key={n} className="animate-pulse bg-gray-100 aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {productosFiltrados.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}

        {!loading && productosFiltrados.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border border-dashed border-gray-200 bg-white rounded-2xl p-8 mt-2">
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center mb-4">
              No se encontraron prendas con los filtros seleccionados.
            </p>
            <button
              type="button"
              onClick={resetAll}
              className="px-5 py-2 text-xs font-black uppercase tracking-widest bg-black text-white rounded-full hover:bg-neutral-800 transition-colors shadow-sm"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}