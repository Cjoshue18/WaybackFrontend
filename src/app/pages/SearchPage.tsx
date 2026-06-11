import React, { useState, useEffect } from 'react';
import { FilterSidebar } from '@/app/components/FilterSidebar';
import { ProductGrid } from '@/app/components/ProductGrid';
import { getProductos, type Product } from '@/lib/api'; // 🚨 Importamos el método de la API real

export function SearchPage() {
  // Estado dinámico para almacenar los productos del servidor
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    sexo: [] as string[],       
    tallas: [] as string[],
    soloDisponibles: false,
    precioMin: 0,
    precioMax: 1000,
    colors: [] as number[],     
  });

  // 🚨 LLAMADA A LA API REAL AL MONTAR EL COMPONENTE 🚨
  useEffect(() => {
    getProductos().then((data) => {
      setAllProducts(data);
      setLoading(false);
    });
  }, []);

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
      <div className="flex-1">
        <ProductGrid products={base} />
      </div>
    </div>
  );
}