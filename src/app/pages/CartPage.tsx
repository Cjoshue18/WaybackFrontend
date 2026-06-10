import { useState } from 'react';
import { ShoppingBag, Minus, Plus, Trash2, Tag, Truck, ShieldCheck } from 'lucide-react';

interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  quantity: number;
  inStock: boolean;
}


export function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState('');
    
  const updateQuantity = (id: number, delta: number) => {
    setCartItems(
      cartItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(cartItems.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1500 ? 0 : 150;
  const discount = 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="w-8 h-8 text-[#7c3aed]" />
            <h1 className="text-3xl font-bold text-[#7c3aed]">
              Mi Carrito
            </h1>
          </div>
          <p className="text-gray-600">
            {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'} en tu carrito
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[rgba(124,58,237,0.15)]">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              Tu carrito está vacío
            </h3>
            <p className="text-gray-500 mb-6">
              Agrega algunos productos para comenzar tu compra
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] transition-colors"
            >
              Explorar productos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Talla: {item.size} • Color: {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-8 h-8 rounded-full border border-[rgba(124,58,237,0.2)] flex items-center justify-center hover:bg-[rgba(124,58,237,0.05)] transition-colors"
                          >
                            <Minus className="w-4 h-4 text-[#7c3aed]" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-8 h-8 rounded-full border border-[rgba(124,58,237,0.2)] flex items-center justify-center hover:bg-[rgba(124,58,237,0.05)] transition-colors"
                          >
                            <Plus className="w-4 h-4 text-[#7c3aed]" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">
                            ${(item.price * item.quantity).toLocaleString()}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-gray-500">
                              ${item.price} c/u
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Benefits */}
              <div className="bg-[rgba(124,58,237,0.04)] rounded-2xl p-6 border border-[rgba(124,58,237,0.15)]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">
                        Envío gratis
                      </p>
                      <p className="text-xs text-gray-600">
                        En compras mayores a $1,500
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">
                        Compra segura
                      </p>
                      <p className="text-xs text-gray-600">
                        Protección al comprador
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Tag className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm mb-1">
                        Mejor precio
                      </p>
                      <p className="text-xs text-gray-600">
                        Garantía de devolución
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] sticky top-24">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">
                  Resumen de compra
                </h3>

                {/* Coupon */}
                <div className="mb-6">
                  <label className="text-sm text-gray-600 mb-2 block">
                    Código de descuento
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Ingresa tu código"
                      className="flex-1 px-4 py-2 border border-[rgba(124,58,237,0.2)] rounded-full focus:outline-none focus:border-[#7c3aed] text-sm"
                    />
                    <button className="px-6 py-2 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] transition-colors text-sm">
                      Aplicar
                    </button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-[rgba(124,58,237,0.15)]">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Envío</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Gratis</span>
                      ) : (
                        `$${shipping}`
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Descuento</span>
                      <span>-${discount.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div className="flex justify-between mb-6">
                  <span className="text-lg font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-[#7c3aed]">
                    ${total.toLocaleString()}
                  </span>
                </div>

                {/* Checkout Button */}
                <button className="w-full py-4 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] transition-colors font-semibold mb-3">
                  Proceder al pago
                </button>

                {/* Continue Shopping */}
                <a
                  href="/"
                  className="block text-center text-[#7c3aed] hover:text-[#7c3aed] text-sm"
                >
                  Continuar comprando
                </a>

                {/* Free Shipping Info */}
                {shipping > 0 && (
                  <div className="mt-6 p-4 bg-[rgba(124,58,237,0.04)] rounded-xl">
                    <p className="text-sm text-gray-600">
                      Agrega{' '}
                      <span className="font-semibold text-[#7c3aed]">
                        ${(1500 - subtotal).toLocaleString()}
                      </span>{' '}
                      más para obtener envío gratis
                    </p>
                    <div className="mt-2 w-full bg-[rgba(124,58,237,0.2)] rounded-full h-2">
                      <div
                        className="bg-[#7c3aed] h-2 rounded-full transition-all"
                        style={{ width: `${Math.min((subtotal / 1500) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
