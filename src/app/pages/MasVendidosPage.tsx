import { ProductGrid } from '../components/ProductGrid';

export function MasVendidosPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl mb-3 text-[#7c3aed]">Más Vendidos</h1>
        <p className="text-gray-600">Los favoritos de nuestra comunidad</p>
      </div>
      <ProductGrid showViewAll={false} />
    </div>
  );
}
