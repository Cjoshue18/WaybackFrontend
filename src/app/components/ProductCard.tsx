import { useState } from 'react';
import { Heart, Plus } from 'lucide-react';


interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  hoverImage?: string;
  badge?: string;
  inStock?: boolean;
}

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isHovered, setIsHovered]   = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);

  return (
    <>
      <div
        className="group cursor-pointer bg-white overflow-hidden transition-all duration-300"
        style={{
          boxShadow: isHovered
            ? '0 16px 40px rgba(124,58,237,0.13), 0 4px 16px rgba(0,0,0,0.06)'
            : '0 2px 12px rgba(124,58,237,0.07), 0 1px 4px rgba(0,0,0,0.04)',
          transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ── Image ── */}
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">

          {/* badges */}
          {product.badge && product.inStock !== false && (
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs uppercase tracking-wide bg-[#7c3aed]">
              {product.badge}
            </span>
          )}
          {product.inStock === false && (
            <span className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-full text-white text-xs uppercase tracking-wide bg-gray-400">
              Agotado
            </span>
          )}

          {/* main image */}
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
            style={{ opacity: isHovered && product.hoverImage ? 0 : 1 }}
          />

          {/* hover / alternate image — smooth fade */}
          {product.hoverImage && (
            <img
              src={product.hoverImage}
              alt=""
              className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
              style={{ opacity: isHovered ? 1 : 0 }}
            />
          )}

          {/* wishlist — visible on hover */}
          <button
            onClick={(e) => { e.stopPropagation(); setWishlisted((w) => !w); }}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
            style={{
              opacity: isHovered ? 1 : 0,
              boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <Heart
              className="w-4 h-4"
              style={{ color: wishlisted ? '#7c3aed' : '#9ca3af', fill: wishlisted ? '#7c3aed' : 'none' }}
            />
          </button>
        </div>

        {/* ── Info row: title + price + "+" ── */}
        <div className="px-3.5 pt-3 pb-3.5 flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p
              className="truncate text-gray-800 mb-0.5 transition-colors duration-200"
              style={{ fontSize: 13, fontWeight: 500, color: isHovered ? '#7c3aed' : '' }}
            >
              {product.name}
            </p>
            <div className="flex items-baseline gap-1.5">
              {product.originalPrice && (
                <span className="line-through text-gray-400" style={{ fontSize: 12 }}>
                  ${product.originalPrice}
                </span>
              )}
              <span style={{ fontSize: 17, fontWeight: 800, color: '#7c3aed' }}>
                ${product.price}
              </span>
            </div>
          </div>

          {/* quick-view "+" button */}
          <button
            onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
            disabled={product.inStock === false}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Ver producto"
            style={{
              background: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
              boxShadow: '2px 2px 8px rgba(124,58,237,0.3)',
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={3} />
          </button>
        </div>
      </div>

    </>
  );
}
