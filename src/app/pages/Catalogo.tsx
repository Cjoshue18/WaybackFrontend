import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { FilterSidebar } from '@/app/components/FilterSidebar';
import { ProductCard } from '@/app/components/ProductCard';
import { getProductos } from '@/lib/api';
import type { Product } from '@/lib/api';

// El filtro de colores ahora envía IDs directamente a la API, no nombres.

export function CatalogoPage() {
  const [productos, setProductos] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Pagination states
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const ITEMS_PER_PAGE = 12;

  // ── 🎯 URL = fuente de verdad. Los filtros se derivan directamente de los searchParams ──
  const filters = {
    categorias: searchParams.getAll('categoria'),
    estilos: searchParams.getAll('estilo'),
    colors: searchParams.getAll('color').map(Number).filter(n => !isNaN(n)),
    sexo: searchParams.get('genero') ? [searchParams.get('genero') as string] : [],
    tallas: searchParams.getAll('talla').map((t) => t.toUpperCase()),
    soloDisponibles: searchParams.get('stock') === 'true',
    precioMin: Number(searchParams.get('precioMin') ?? 0),
    precioMax: Number(searchParams.get('precioMax') ?? 500),
    pagina: Number(searchParams.get('pagina') ?? 1),
  };

  const setFilters = (newFiltersOrFn: any) => {
    let resolvedFilters = newFiltersOrFn;
    if (typeof newFiltersOrFn === 'function') {
      resolvedFilters = newFiltersOrFn(filters);
    }
    
    const urlParams: [string, string][] = [];
    (resolvedFilters.categorias || []).forEach((c: string) => urlParams.push(['categoria', c]));
    (resolvedFilters.estilos || []).forEach((e: string) => urlParams.push(['estilo', e]));
    (resolvedFilters.colors || []).forEach((c: number) => urlParams.push(['color', String(c)]));
    (resolvedFilters.tallas || []).map((t: string) => t.toUpperCase()).forEach((t: string) => urlParams.push(['talla', t]));
    if (resolvedFilters.sexo && resolvedFilters.sexo.length > 0) urlParams.push(['genero', resolvedFilters.sexo[0]]);
    if (resolvedFilters.soloDisponibles) urlParams.push(['stock', 'true']);
    if (resolvedFilters.precioMin) urlParams.push(['precioMin', String(resolvedFilters.precioMin)]);
    if (resolvedFilters.precioMax !== undefined && resolvedFilters.precioMax !== 500) urlParams.push(['precioMax', String(resolvedFilters.precioMax)]);
    if (resolvedFilters.pagina && resolvedFilters.pagina > 1) urlParams.push(['pagina', String(resolvedFilters.pagina)]);
    
    setSearchParams(urlParams, { replace: true });
  };

  // Cada vez que cambian los searchParams (la URL), hacemos fetch a la API
  useEffect(() => {
    let active = true;
    setLoading(true);

    const categorias = filters.categorias;
    const estilos = filters.estilos;
    const coloresIds = filters.colors;
    const tallasLower = filters.tallas.map((t) => t.toLowerCase());
    const genero = filters.sexo.length > 0 ? filters.sexo[0] : undefined;

    getProductos({
      categoria: categorias.length > 0 ? categorias : undefined,
      estilo: estilos.length > 0 ? estilos : undefined,
      genero,
      color: coloresIds.length > 0 ? coloresIds : undefined,
      talla: tallasLower.length > 0 ? tallasLower : undefined,
      stock: filters.soloDisponibles || undefined,
      precioMin: filters.precioMin,
      precioMax: filters.precioMax,
      pagina: filters.pagina,
      registrosPorPagina: ITEMS_PER_PAGE
    })
      .then((res) => {
        if (active) {
          console.log('👉 [Wayback C# Catalogo Sync]:', res.elementos?.length || 0, 'prendas recibidas.');
          setProductos(res.elementos ?? []);
          setTotalPages(res.totalPaginas || 1);
          setTotalRegistros(res.totalRegistros || 0);
        }
      })
      .catch((err) => console.error('Error conectando a la API:', err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [searchParams]);

  // Limpiar filtros simplemente limpia los searchParams
  const resetAll = () => {
    setSearchParams([], { replace: true });
  };

  return (
    /* 👉 CAMBIO AQUÍ: Agregamos 'items-start'.
      Esto evita que la barra de filtros se estire hacia abajo acompañando al catálogo entero.
    */
    <div className="container mx-auto px-6 py-8 flex items-start gap-8 min-h-[60vh]">
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
            {productos.map((prod) => (
              <ProductCard key={prod.id} product={prod} />
            ))}
          </div>
        )}
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setFilters({ ...filters, pagina: Math.max(1, filters.pagina - 1) })}
              disabled={filters.pagina === 1}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#7c3aed] disabled:opacity-40 disabled:hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200"
            >
              Anterior
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Página {filters.pagina} de {totalPages} ({totalRegistros} productos)
            </span>
            <button 
              onClick={() => setFilters({ ...filters, pagina: Math.min(totalPages, filters.pagina + 1) })}
              disabled={filters.pagina === totalPages}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#7c3aed] disabled:opacity-40 disabled:hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200"
            >
              Siguiente
            </button>
          </div>
        )}

        {!loading && productos.length === 0 && (
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
