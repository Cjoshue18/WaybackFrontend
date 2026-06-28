import { useState } from 'react';
import { toast } from 'sonner';
import { ShoppingBag, Minus, Plus, Trash2, Tag, Truck, ShieldCheck, MapPin, RefreshCw, CreditCard, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { useCart } from '@/app/hooks/useCart';
import { useDirecciones } from '@/app/hooks/useProfile';
import { crearPedido, crearPreferenciaPago, notificarPagoWebhook } from '@/lib/api';
import { Toaster } from '@/app/components/ui/sonner';

export function CartPage() {
  const { items: cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { direcciones, loading: direccionesLoading } = useDirecciones();
  const [couponCode, setCouponCode] = useState('');

  const [selectedDirId, setSelectedDirId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Estado de la pasarela para el overlay de animación.
  const [pagoEstado, setPagoEstado] = useState<'idle' | 'procesando' | 'exito'>('idle');

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal > 1500 ? 0 : 150;
  const discount = 0;
  const total = subtotal + shipping - discount;

  // El backend exige VarId por ítem: si algo en el carrito no tiene variante asociada, no se puede facturar.
  const itemsSinVariante = cartItems.some((item) => !item.varId);
  const puedeConfirmar =
    !submitting &&
    cartItems.length > 0 &&
    !itemsSinVariante &&
    selectedDirId !== null;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // ── FLUJO DE PAGO 100% AUTOMÁTICO ──
  // 1) crea la preferencia → 2) anima la "apertura" de la pasarela →
  // 3) crea el pedido → 4) dispara el webhook que lo aprueba automáticamente.
  const handlePagoSeguro = async () => {
    if (!puedeConfirmar || selectedDirId === null) return;
    setSubmitting(true);
    setPagoEstado('procesando');

    // 1) Preferencia de pago (monto calculado en el server con los ítems reales).
    const pref = await crearPreferenciaPago({
      Items: cartItems.map((item) => ({ precio: item.price, cantidad: item.quantity })),
    });

    if (!pref.success) {
      setPagoEstado('idle');
      setSubmitting(false);
      toast.error(pref.error ?? 'No se pudo iniciar el pago.');
      return;
    }

    // 2) Simulamos la apertura/procesamiento de la pasarela.
    await sleep(2000);

    // 3) Creamos el pedido (queda 'pendiente' en el server).
    const pedido = await crearPedido({
      dirId: selectedDirId,
      Items: cartItems.map((item) => ({ VarId: item.varId as number, Cantidad: item.quantity })),
    });

    if (!pedido.success || !pedido.pedId) {
      setPagoEstado('idle');
      setSubmitting(false);
      toast.error(pedido.error ?? 'No se pudo registrar el pedido.');
      return;
    }

    // 4) Webhook de pago aprobado → el server lo pasa a 'aceptado' automáticamente.
    await notificarPagoWebhook(pedido.pedId, 'aprobado');

    setPagoEstado('exito');
    await sleep(1200);

    toast.success('¡Pago aprobado! Tu pedido fue confirmado automáticamente.');
    clearCart();
    setSelectedDirId(null);
    setSubmitting(false);
    setPagoEstado('idle');
  };

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
                  key={item.cartKey}
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
                          onClick={() => removeItem(item.cartKey)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            className="w-8 h-8 rounded-full border border-[rgba(124,58,237,0.2)] flex items-center justify-center hover:bg-[rgba(124,58,237,0.05)] transition-colors"
                          >
                            <Minus className="w-4 h-4 text-[#7c3aed]" />
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, 1)}
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

            {/* Order Summary + Checkout */}
            <div className="lg:col-span-1 space-y-6">
              {/* Dirección de envío */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#7c3aed]" /> Dirección de envío
                </h3>

                {direccionesLoading ? (
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando direcciones…
                  </p>
                ) : direcciones.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No tienes direcciones guardadas. Agrega una desde tu perfil antes de continuar.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {direcciones.map((dir) => (
                      <label
                        key={dir.dirId}
                        className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors"
                        style={{ borderColor: selectedDirId === dir.dirId ? '#7c3aed' : '#e5e7eb' }}
                      >
                        <input
                          type="radio"
                          name="direccionEnvio"
                          checked={selectedDirId === dir.dirId}
                          onChange={() => setSelectedDirId(dir.dirId)}
                          className="mt-1 accent-[#7c3aed]"
                        />
                        <span className="text-sm text-gray-700">
                          {dir.dirCalle}, {dir.dirDistrito} — {dir.dirProvincia}
                          {dir.dirPreferido && (
                            <span className="ml-2 text-[10px] font-bold uppercase text-[#7c3aed]">Preferida</span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Pago Seguro (pasarela automática) */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 mb-4 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#7c3aed]" /> Pago Seguro
                </h3>

                <div className="rounded-2xl p-5 bg-[rgba(124,58,237,0.04)] border border-[rgba(124,58,237,0.15)] flex items-center gap-4">
                  <CreditCard className="w-10 h-10 text-[#7c3aed] flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-sm font-semibold text-gray-800 mb-0.5">Pasarela de pago integrada</p>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Tu pedido se confirma automáticamente al aprobarse el pago. Sin pasos manuales ni códigos.
                    </p>
                  </div>
                </div>

                {itemsSinVariante && (
                  <p className="text-xs text-red-500 mt-4">
                    Algunos productos del carrito no tienen una variante válida (talla/color). Quítalos y agrégalos de nuevo desde el catálogo.
                  </p>
                )}
              </div>

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

                {/* Checkout Button — Pago Seguro automático */}
                <button
                  onClick={handlePagoSeguro}
                  disabled={!puedeConfirmar}
                  className="w-full py-4 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] transition-colors font-semibold mb-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <><RefreshCw className="w-4 h-4 animate-spin" /> Procesando pago…</> : '💳 Proceder al Pago Seguro'}
                </button>
                {!selectedDirId && cartItems.length > 0 && (
                  <p className="text-xs text-gray-400 text-center mb-3">Selecciona una dirección de envío para continuar.</p>
                )}

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

      {/* ── Overlay de la pasarela de pago ── */}
      {pagoEstado !== 'idle' && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl px-10 py-12 max-w-sm w-full mx-6 text-center shadow-2xl">
            {pagoEstado === 'procesando' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Procesando tu pago…</h3>
                <p className="text-sm text-gray-500">Estamos contactando con la pasarela de pago segura. No cierres esta ventana.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">¡Pago aprobado!</h3>
                <p className="text-sm text-gray-500">Tu pedido fue confirmado automáticamente.</p>
              </>
            )}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
