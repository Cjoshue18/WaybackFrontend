import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { ProductCard } from '../components/ProductCard';
import { FilterSidebar } from '../components/FilterSidebar';

type SortOption = 'recientes' | 'precio-asc' | 'precio-desc' | 'vendidos';

export function SearchPage() {
  const [params] = useSearchParams();
  const q    = params.get('q')   ?? '';
  const sub  = params.get('sub') ?? '';
  const mode = params.get('mode') ?? 'text'; // 'text' | 'image'

  const [filters, setFilters] = useState({
    colors: [] as string[],
    sizes: [] as string[],
    inStock: false,
    priceRange: [0, 200] as [number, number],
  });
  const [sort, setSort] = useState<SortOption>('recientes');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // base filter: by query text OR subcategory
  let base = allProducts.filter((p) => {
    if (sub) return p.subcategory.toLowerCase() === sub.toLowerCase() || p.name.toLowerCase().includes(sub.toLowerCase());
    if (q)   return p.name.toLowerCase().includes(q.toLowerCase()) || p.category.toLowerCase().includes(q.toLowerCase()) || p.subcategory.toLowerCase().includes(q.toLowerCase());
    return true;
  });

  // apply sidebar filters
  base = base.filter((p) => {
    if (filters.colors.length > 0 && !filters.colors.includes(p.color)) return false;
    if (filters.sizes.length > 0 && !p.size.some((s) => filters.sizes.includes(s))) return false;
    if (filters.inStock && !p.inStock) return false;
    if (p.price < filters.priceRange[0] || p.price > filters.priceRange[1]) return false;
    return true;
  });

  // sort
  const sorted = [...base].sort((a, b) => {
    if (sort === 'precio-asc') return a.price - b.price;
    if (sort === 'precio-desc') return b.price - a.price;
    return 0;
  });

  const title = sub ? sub : q ? `"${q}"` : 'Todos los productos';
  const isImage = mode === 'image';

  return (
    <div className="container mx-auto px-6 py-8">

      {/* page header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1" style={{ fontSize: 13, color: '#9ca3af' }}>
          <span>Inicio</span>
          <span>/</span>
          <span style={{ color: '#7c3aed' }}>{isImage ? 'Búsqueda por imagen' : 'Búsqueda'}</span>
        </div>
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-[#7c3aed]" />
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1f2937', letterSpacing: '-0.02em' }}>
            {isImage ? 'Resultados similares a tu imagen' : title}
          </h1>
        </div>
        <p className="mt-1" style={{ fontSize: 13, color: '#9ca3af' }}>
          {sorted.length} {sorted.length === 1 ? 'producto encontrado' : 'productos encontrados'}
        </p>
      </div>

      {/* mobile filter toggle */}
      <button
        className="md:hidden flex items-center gap-2 mb-4 px-4 py-2 border border-[rgba(124,58,237,0.2)] text-[#7c3aed]"
        style={{ fontSize: 13 }}
        onClick={() => setShowMobileFilters((v) => !v)}
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
        {(filters.colors.length + filters.sizes.length + (filters.inStock ? 1 : 0)) > 0 && (
          <span className="w-5 h-5 rounded-full bg-[#7c3aed] text-white flex items-center justify-center" style={{ fontSize: 10 }}>
            {filters.colors.length + filters.sizes.length + (filters.inStock ? 1 : 0)}
          </span>
        )}
      </button>

      <div className="flex gap-8">

        {/* sidebar */}
        <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block`}>
          <FilterSidebar filters={filters} setFilters={setFilters} />
        </div>

        {/* main content */}
        <div className="flex-1 min-w-0">
          {/* toolbar */}
          <div className="flex items-center justify-between mb-6">
            {/* active filter chips */}
            <div className="flex flex-wrap gap-2">
              {filters.colors.map((c) => (
                <span
                  key={c}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(124,58,237,0.04)] text-[#7c3aed] border border-[rgba(124,58,237,0.2)]"
                  style={{ fontSize: 12 }}
                >
                  {c}
                  <button onClick={() => setFilters({ ...filters, colors: filters.colors.filter((x) => x !== c) })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.sizes.map((s) => (
                <span
                  key={s}
                  className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(124,58,237,0.04)] text-[#7c3aed] border border-[rgba(124,58,237,0.2)]"
                  style={{ fontSize: 12 }}
                >
                  Talla {s}
                  <button onClick={() => setFilters({ ...filters, sizes: filters.sizes.filter((x) => x !== s) })}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="px-4 py-2 border border-[rgba(124,58,237,0.2)] bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]"
              style={{ fontSize: 13 }}
            >
              <option value="recientes">Más recientes</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="vendidos">Más vendidos</option>
            </select>
          </div>

          {/* grid */}
          {sorted.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {sorted.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p style={{ fontSize: 15, color: '#6b7280' }}>No encontramos productos con esos criterios.</p>
              <button
                className="mt-4 px-6 py-2 bg-[#7c3aed] text-white hover:bg-[#6d28d9] transition-colors"
                style={{ fontSize: 13 }}
                onClick={() => setFilters({ colors: [], sizes: [], inStock: false, priceRange: [0, 200] })}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
