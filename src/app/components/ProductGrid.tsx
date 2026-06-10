import { ProductCard } from './ProductCard';

interface ProductGridProps {
  title?: string;
  showViewAll?: boolean;
}


export function ProductGrid({ title = 'Productos', showViewAll = true }: ProductGridProps) {
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl text-[#7c3aed]">{title}</h2>
        {showViewAll && (
          <button className="text-[#7c3aed] hover:text-[#7c3aed] transition-colors">
            Ver todo →
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
