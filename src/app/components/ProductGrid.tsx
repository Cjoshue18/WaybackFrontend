import React from 'react';
import { ProductCard } from './ProductCard';

// 🛠️ Extraemos dinámicamente el tipo exacto de producto que 'ProductCard' exige
type ProductCardProps = React.ComponentProps<typeof ProductCard>;
type RealProduct = ProductCardProps['product'];

interface ProductGridProps {
  products?: RealProduct[]; // Ahora usan exactamente el mismo tipo, con id: number, image, etc.
  showViewAll?: boolean;
}

export function ProductGrid({ products = [], showViewAll }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}