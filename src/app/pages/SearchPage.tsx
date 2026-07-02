import React, { useState, useEffect } from 'react';
import { FilterSidebar } from '@/app/components/FilterSidebar';
import { ProductGrid } from '@/app/components/ProductGrid';
import { getProductos, type Product } from '@/lib/api'; // Se importa el método de la API real

export function SearchPage() {
  // Estado dinámico para almacenar los productos del servidor
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const ITEMS_PER_PAGE = 12;

  const [filters, setFilters] = useState({
    sexo: [] as string[],       
    tallas: [] as string[],
    soloDisponibles: false,
    precioMin: 0,
    precioMax: 1000,
    colors: [] as number[],     
  });

  // LLAMADA A LA API REAL AL MONTAR EL COMPONENTE Y CAMBIAR PÁGINA 🚨
  useEffect(() => {
    setLoading(true);
    getProductos({ pagina: page, registrosPorPagina: ITEMS_PER_PAGE }).then((data) => {
      setAllProducts(data.elementos ?? []);
      setTotalPages(data.totalPaginas || 1);
      setTotalRegistros(data.totalRegistros || 0);
      setLoading(false);
    });
  }, [page]);

  // Tu lógica de filtrado se mantiene idéntica, pero ahora procesa datos del backend
  let base = allProducts.filter((p: any) => {
    if (filters.sexo.length > 0 && !filters.sexo.includes(p.sexo)) return false;
    if (filters.tallas.length > 0 && !p.tallas?.some((t: any) => filters.tallas.includes(t))) return false;
    if (filters.colors.length > 0 && !p.colors?.some((c: number) => filters.colors.includes(c))) return false;
    if (filters.soloDisponibles && !p.inStock) return false;
    if (p.price < filters.precioMin || p.price > filters.precioMax) return false;
    return true;
  });

  if (loading) {
    return <div className="text-center py-20 text-sm text-gray-400">Cargando colección de archivo...</div>;
  }

  return (
    <div className="flex gap-6 p-6">
      <FilterSidebar filters={filters} setFilters={setFilters} />
      <div className="flex-1 flex flex-col">
        <ProductGrid products={base} />
        
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#7c3aed] disabled:opacity-40 disabled:hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200"
            >
              Anterior
            </button>
            <span className="text-xs text-slate-500 font-medium">
              Página {page} de {totalPages} ({totalRegistros} productos)
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#7c3aed] disabled:opacity-40 disabled:hover:text-slate-600 transition-colors bg-white px-3 py-1.5 rounded-md border border-slate-200"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}