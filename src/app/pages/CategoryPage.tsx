import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { FilterSidebar } from '../components/FilterSidebar';
import { ProductCard } from '../components/ProductCard'; 
import { getProductos, Product } from '@/lib/api';
import type { ProductFilters, SortOption } from '../types/database';

// 🔑 DICCIONARIO TRADUCTOR: Mapea tanto texto como IDs numéricos al destino correcto
const CATEGORY_MAP: Record<string, { id: string; label: string }> = {
  'pantalon':     { id: '1',  label: 'Pantalón' },
  'falda':        { id: '2',  label: 'Falda' },
  'shorts':       { id: '3',  label: 'Shorts' },
  'jogger':       { id: '4',  label: 'Jogger' },
  'camisetas':    { id: '5',  label: 'Camisetas' },
  'sueteres':     { id: '6',  label: 'Suéteres' },
  'chaquetas':    { id: '7',  label: 'Chaquetas' },
  'sets-baggy':   { id: '8',  label: 'Sets Baggy' },
  'sets-denim':   { id: '9',  label: 'Sets Denim' },
  'sets-depor':   { id: '10', label: 'Sets Deportivos' },
  'sets-tejidos': { id: '11', label: 'Sets Tejidos' },
  // Soporte nativo por si la URL ya viene con el número ID directo:
  '1':  { id: '1',  label: 'Pantalón' },
  '2':  { id: '2',  label: 'Falda' },
  '3':  { id: '3',  label: 'Shorts' },
  '4':  { id: '4',  label: 'Jogger' },
  '5':  { id: '5',  label: 'Camisetas' },
  '6':  { id: '6',  label: 'Suéteres' },
  '7':  { id: '7',  label: 'Chaquetas' },
  '8':  { id: '8',  label: 'Sets Baggy' },
  '9':  { id: '9',  label: 'Sets Denim' },
  '10': { id: '10', label: 'Sets Deportivos' },
  '11': { id: '11', label: 'Sets Tejidos' },
};

const DEFAULT_FILTERS: ProductFilters = {
  sexo: [],
  colors: [],
  tallas: [],
  soloDisponibles: false,
  precioMin: 0,
  precioMax: 500,
};

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div style={{ aspectRatio: '3/4', background: '#f3f4f6' }} />
      <div className="mt-3 space-y-2">
        <div style={{ height: 12, background: '#f3f4f6', width: '70%' }} />
        <div style={{ height: 11, background: '#f3f4f6', width: '40%' }} />
      </div>
    </div>
  );
}

export function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ProductFilters>(DEFAULT_FILTERS);
  const [sort, setSort]       = useState<SortOption>('recientes');

  // 🛠️ Resolvemos de forma segura el texto y el ID numérico que exige el backend
  const urlKey = categoryId ? categoryId.toLowerCase().trim() : '';
  const resolvedCategory = CATEGORY_MAP[urlKey];

  const label = resolvedCategory ? resolvedCategory.label : (categoryId ?? 'Categoría');
  const apiId = resolvedCategory ? resolvedCategory.id : urlKey;

  // ── 🎯 LLAMADA ASÍNCRONA OPTIMIZADA CON PARÁMETROS UNIFICADOS ──
  useEffect(() => {
    if (!apiId) return;
    
    let active = true;
    setLoading(true);

    // 🔥 CORRECCIÓN: Invocamos al nuevo método pasando el ID unificado como un objeto filtro
    getProductos({ categoria: apiId })
      .then((data) => {
        if (active) {
          setProducts(data);
        }
      })
      .catch((err) => console.error("Error al sincronizar categoría:", err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [apiId]); 

  // Filtrado en tiempo real
  const filteredProducts = products.filter((p) => {
    if (filters.sexo && filters.sexo.length > 0 && !filters.sexo.includes(p.sexo)) return false;
    if (filters.tallas && filters.tallas.length > 0 && !p.tallas?.some((t) => filters.tallas.includes(t))) return false;
    if (filters.colors && filters.colors.length > 0 && !p.colors?.some((c) => filters.colors.includes(c))) return false;
    if (filters.soloDisponibles && !p.inStock) return false;
    if (p.price < filters.precioMin || p.price > filters.precioMax) return false;
    return true;
  });

  // Ordenamiento dinámico
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sort === 'precio_asc') return a.price - b.price;
    if (sort === 'precio_desc') return b.price - a.price;
    return b.id - a.id; 
  });

  const hasActiveFilters =
    filters.sexo.length > 0 ||
    filters.colors.length > 0 ||
    filters.tallas.length > 0 ||
    filters.soloDisponibles ||
    filters.precioMin > 0 ||
    filters.precioMax < 500;

  return (
    <div style={{ background: '#fff', minHeight: '100vh' }}>
      {/* Category header */}
      <div className="border-b border-gray-100" style={{ paddingTop: 48, paddingBottom: 32 }}>
        <div className="container mx-auto px-6">
          <p className="uppercase" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#9ca3af', marginBottom: 8 }}>
            Wayback · Catálogo
          </p>
          <h1 style={{ fontSize: 'clamp(26px, 4vw, 42px)', fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            {label}
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-10">
        <div className="flex gap-10">
          <FilterSidebar filters={filters} setFilters={setFilters} />

          <div className="flex-1 min-w-0">
            {/* toolbar */}
            <div className="flex items-center justify-between mb-8">
              <p style={{ fontSize: 13, color: '#9ca3af' }}>
                {loading ? 'Buscando archivos...' : hasActiveFilters ? `Resultados filtrados (${sortedProducts.length})` : `Colección completa (${products.length})`}
              </p>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="bg-white border border-gray-200 text-gray-600 px-3 py-2 focus:outline-none focus:border-gray-400 transition-colors"
                style={{ fontSize: 12, letterSpacing: '0.04em' }}
              >
                <option value="recientes">Más recientes</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
              </select>
            </div>

            {/* Grid principal */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <ProductSkeleton key={i} />)
              ) : (
                sortedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>

            {/* Aviso dinámico vacío */}
            {!loading && products.length === 0 && (
              <div className="mt-16 text-center py-16 border border-gray-100" style={{ background: '#fafafa' }}>
                <p className="uppercase" style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#9ca3af', marginBottom: 12 }}>
                  Pronto disponible
                </p>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 8 }}>
                  Catálogo en preparación
                </p>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                  Las prendas de {label} estarán disponibles pronto.<br />
                  Suscríbete para ser el primero en enterarte.
                </p>
              </div>
            )}

            {/* Aviso filtros vacíos */}
            {!loading && products.length > 0 && sortedProducts.length === 0 && (
              <div className="mt-16 text-center py-12 border border-dashed border-gray-200">
                <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 4 }}>No hay prendas que coincidan con tus filtros activos.</p>
                <button
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="mt-3 px-4 py-2 border border-gray-300 text-xs font-bold uppercase tracking-wider text-gray-600 hover:border-black hover:text-black transition-all"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}