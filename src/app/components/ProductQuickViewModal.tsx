import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { calcularDescuento, type Product } from '@/app/components/ProductCard';
import { useCart } from '@/app/hooks/useCart';
import { getProductoDetalle } from '@/lib/api';

interface ProductQuickViewModalProps {
  product: Product;
  onClose: () => void;
  // Se dispara tras agregar al carrito: ProductCard cierra esta vista previa y abre el drawer.
  onAdded: () => void;
}

export function ProductQuickViewModal({ product, onClose, onAdded }: ProductQuickViewModalProps) {
  const { addToCart } = useCart();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedTalla, setSelectedTalla] = useState<string | null>(null);

  // El listado no trae variantes (varId); las cargamos del detalle al abrir.
  const [detalle, setDetalle] = useState<Product | null>(product.variantes?.length ? product : null);
  const [cargandoVariantes, setCargandoVariantes] = useState(!product.variantes?.length);

  useEffect(() => {
    if (product.variantes?.length) return; // Ya venían incluidas.
    let activo = true;
    setCargandoVariantes(true);
    getProductoDetalle(product.id)
      .then((d) => { if (activo && d) setDetalle(d); })
      .finally(() => { if (activo) setCargandoVariantes(false); });
    return () => { activo = false; };
  }, [product.id, product.variantes]);

  // Fuente de datos: el detalle (con variantes) si ya cargó, si no el producto del listado.
  const fuente = detalle ?? product;
  const { activo: descuentoActivo, precioFinal } = calcularDescuento(fuente);
  const variantes = fuente.variantes ?? [];

  // Con variantes reales tenemos colorHex/colorNombre y stock por combinación;
  // sin ellas, caemos a los arreglos planos de colors/tallas (sin detalle de stock).
  const colores: { hex: string; nombre: string }[] = variantes.length > 0
    ? Array.from(new Map(variantes.map((v) => [v.colorHex, v.colorNombre])).entries())
        .map(([hex, nombre]) => ({ hex, nombre }))
    : (fuente.colors ?? []).map((c) => ({ hex: String(c).toUpperCase(), nombre: String(c) }));

  const tallas: string[] = variantes.length > 0
    ? Array.from(new Set(variantes.map((v) => v.varTalla)))
    : (fuente.tallas ?? []);

  const tallaDisponible = (talla: string) => {
    if (variantes.length === 0) return true;
    return variantes.some(
      (v) => v.varTalla === talla && (!selectedColor || v.colorHex === selectedColor) && v.varStock > 0
    );
  };

  const requiereTalla = tallas.length > 0;
  const requiereColor = colores.length > 0;

  const varianteSeleccionada = variantes.find(
    (v) => (!requiereTalla || v.varTalla === selectedTalla) && (!requiereColor || v.colorHex === selectedColor)
  );

  const puedeAgregar =
    fuente.inStock !== false &&
    !cargandoVariantes &&
    (!requiereTalla || !!selectedTalla) &&
    (!requiereColor || !!selectedColor) &&
    // Si el producto tiene variantes, exigimos una con varId válido (es lo que factura el pedido).
    (variantes.length === 0 || !!varianteSeleccionada?.varId);

  const handleAddToCart = () => {
    if (!puedeAgregar) return;
    const colorNombre = colores.find((c) => c.hex === selectedColor)?.nombre ?? 'Único';
    addToCart({
      id: fuente.id,
      varId: varianteSeleccionada?.varId,
      name: fuente.name,
      price: precioFinal,
      image: fuente.image,
      size: selectedTalla ?? 'Único',
      color: colorNombre,
      inStock: fuente.inStock ?? true,
    });
    onAdded();
  };

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Imagen principal */}
        <div className="relative w-full md:w-1/2 aspect-[3/4] bg-gray-50 flex-shrink-0">
          <img
            src={product.image}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Información y selección */}
        <div className="flex-1 p-6 flex flex-col overflow-y-auto">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>

          <div className="flex items-baseline gap-2 mb-6">
            {descuentoActivo ? (
              <>
                <span className="line-through text-gray-400" style={{ fontSize: 13 }}>
                  S/ {product.price.toFixed(2)}
                </span>
                <span className="text-2xl font-black text-[#7c3aed]">S/ {precioFinal.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-2xl font-black text-[#7c3aed]">S/ {product.price.toFixed(2)}</span>
            )}
          </div>

          {colores.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Color</p>
              <div className="flex gap-2 flex-wrap">
                {colores.map(({ hex, nombre }) => (
                  <button
                    key={hex}
                    type="button"
                    title={nombre}
                    onClick={() => setSelectedColor(hex)}
                    className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-110"
                    style={{
                      background: hex,
                      borderColor: selectedColor === hex ? '#7c3aed' : '#e5e7eb',
                      transform: selectedColor === hex ? 'scale(1.15)' : 'scale(1)',
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {tallas.length > 0 && (
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Talla</p>
              <div className="flex gap-2 flex-wrap">
                {tallas.map((talla) => {
                  const disponible = tallaDisponible(talla);
                  const activa = selectedTalla === talla;
                  return (
                    <button
                      key={talla}
                      type="button"
                      disabled={!disponible}
                      onClick={() => setSelectedTalla(talla)}
                      className="px-3.5 py-1.5 text-xs font-bold border rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      style={{
                        borderColor: activa ? '#7c3aed' : '#e5e7eb',
                        background: activa ? '#7c3aed' : 'transparent',
                        color: activa ? '#fff' : '#374151',
                      }}
                    >
                      {talla}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-auto pt-2">
            {fuente.inStock !== false && !puedeAgregar && !cargandoVariantes && (
              <p className="text-xs text-gray-400 mb-2 text-center">
                {requiereTalla && !selectedTalla ? 'Selecciona una talla' : 'Selecciona un color'}
              </p>
            )}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!puedeAgregar}
              className="w-full py-3 rounded-full text-white text-xs font-bold uppercase tracking-widest transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#a78bfa)' }}
            >
              {fuente.inStock === false
                ? 'Agotado'
                : cargandoVariantes
                ? 'Cargando opciones…'
                : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
