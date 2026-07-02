import { useState } from 'react';
import { toast } from 'sonner';
import {
  ShoppingBag, Minus, Plus, Trash2, Truck, ShieldCheck,
  MapPin, RefreshCw, Lock, CheckCircle2, Loader2, Smartphone, Hash,
} from 'lucide-react';
import { useCart } from '@/app/hooks/useCart';
import { useDirecciones } from '@/app/hooks/useProfile';
import { crearPedido } from '@/lib/api';
import { Toaster } from '@/app/components/ui/sonner';

// ── Número de Yape del negocio ── (cambia por el número real)
const YAPE_NEGOCIO_NUMERO = '987 654 321';
const YAPE_NEGOCIO_NOMBRE = 'Wayback Store';

type Paso = 'carrito' | 'yape' | 'procesando' | 'exito';

interface YapeForm {
  numero: string;
  codigo: string;
}
interface YapeErrors {
  numero?: string;
  codigo?: string;
}

export function CartPage() {
  const { items: cartItems, updateQuantity, removeItem, clearCart } = useCart();
  const { direcciones, loading: direccionesLoading } = useDirecciones();

  const [selectedDirId, setSelectedDirId] = useState<number | null>(null);
  const [paso, setPaso]                   = useState<Paso>('carrito');
  const [yape, setYape]                   = useState<YapeForm>({ numero: '', codigo: '' });
  const [errors, setErrors]               = useState<YapeErrors>({});

  // ── Cálculos ──────────────────────────────────────────────────────────────
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping  = subtotal > 1500 ? 0 : 150;
  const total     = subtotal + shipping;

  const itemsSinVariante = cartItems.some((item) => !item.varId);
  const puedeIrAPagar    =
    cartItems.length > 0 && !itemsSinVariante && selectedDirId !== null;

  // ── Yape form helpers ─────────────────────────────────────────────────────
  const soloDigitos = (val: string, max: number) =>
    val.replace(/\D/g, '').slice(0, max);

  const handleYapeChange = (field: keyof YapeForm, raw: string, max: number) => {
    setYape((prev) => ({ ...prev, [field]: soloDigitos(raw, max) }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validar = (): boolean => {
    const e: YapeErrors = {};
    if (!/^\d{9}$/.test(yape.numero)) e.numero = 'Debe tener exactamente 9 dígitos.';
    if (!/^\d{6}$/.test(yape.codigo)) e.codigo = 'Debe tener exactamente 6 dígitos.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Confirmar pedido ──────────────────────────────────────────────────────
  const handleConfirmar = async () => {
    if (!validar() || selectedDirId === null) return;

    setPaso('procesando');

    const result = await crearPedido({
      dirId:            selectedDirId,
      NumeroYape:       yape.numero,
      CodigoAprobacion: yape.codigo,
      Items: cartItems.map((item) => ({
        VarId:    item.varId as number,
        Cantidad: item.quantity,
      })),
    });

    if (!result.success) {
      setPaso('yape');
      toast.error(result.error ?? 'No se pudo registrar el pedido. Intenta de nuevo.');
      return;
    }

    setPaso('exito');
    // Pequeño delay para mostrar animación de éxito
    await new Promise((r) => setTimeout(r, 1600));

    clearCart();
    setSelectedDirId(null);
    setYape({ numero: '', codigo: '' });
    setErrors({});
    setPaso('carrito');
    toast.success('¡Pedido registrado! Te avisaremos cuando confirmemos tu Yape.');
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">

        {/* ─── Header ─── */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingBag className="w-8 h-8 text-[#7c3aed]" />
            <h1 className="text-3xl font-bold text-[#7c3aed]">Mi Carrito</h1>
          </div>
          <p className="text-gray-500 text-sm">
            {cartItems.length} {cartItems.length === 1 ? 'artículo' : 'artículos'}
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* ─── Carrito vacío ─── */
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-[rgba(124,58,237,0.15)]">
            <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">Agrega algunos productos para comenzar tu compra</p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] transition-colors font-medium"
            >
              Explorar productos
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ─── Columna izquierda: productos ─── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Lista de ítems */}
              {cartItems.map((item) => (
                <div
                  key={item.cartKey}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    <div className="w-24 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <h3 className="font-semibold text-gray-800">{item.name}</h3>
                          <p className="text-sm text-gray-400 mt-0.5">
                            Talla: {item.size} &bull; Color: {item.color}
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.cartKey)}
                          className="p-2 hover:bg-red-50 rounded-full transition-colors text-gray-300 hover:text-red-500"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Cantidad */}
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(item.cartKey, -1)}
                            className="w-8 h-8 rounded-full border border-[rgba(124,58,237,0.25)] flex items-center justify-center hover:bg-[rgba(124,58,237,0.06)] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5 text-[#7c3aed]" />
                          </button>
                          <span className="w-6 text-center font-semibold text-gray-800 text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cartKey, 1)}
                            className="w-8 h-8 rounded-full border border-[rgba(124,58,237,0.25)] flex items-center justify-center hover:bg-[rgba(124,58,237,0.06)] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#7c3aed]" />
                          </button>
                        </div>

                        {/* Precio */}
                        <div className="text-right">
                          <p className="text-base font-bold text-gray-800">
                            S/. {(item.price * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-gray-400">S/. {item.price.toFixed(2)} c/u</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Beneficios */}
              <div className="bg-[rgba(124,58,237,0.03)] rounded-2xl p-6 border border-[rgba(124,58,237,0.12)]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Envío gratis</p>
                      <p className="text-xs text-gray-500">En compras mayores a S/. 1,500</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#7c3aed] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">Compra segura</p>
                      <p className="text-xs text-gray-500">Verificamos tu pago Yape manualmente</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ─── Columna derecha: resumen + checkout ─── */}
            <div className="lg:col-span-1 space-y-4">

              {/* Dirección de envío */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)]">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#7c3aed]" /> Dirección de envío
                </h3>

                {direccionesLoading ? (
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Cargando…
                  </p>
                ) : direcciones.length === 0 ? (
                  <p className="text-xs text-gray-400">
                    No tienes direcciones guardadas. Agrega una desde{' '}
                    <a href="/perfil" className="text-[#7c3aed] underline">tu perfil</a>.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {direcciones.map((dir) => (
                      <label
                        key={dir.dirId}
                        className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all"
                        style={{
                          borderColor: selectedDirId === dir.dirId ? '#7c3aed' : '#e5e7eb',
                          background:  selectedDirId === dir.dirId ? 'rgba(124,58,237,0.04)' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name="dir"
                          checked={selectedDirId === dir.dirId}
                          onChange={() => setSelectedDirId(dir.dirId)}
                          className="mt-1 accent-[#7c3aed]"
                        />
                        <span className="text-sm text-gray-700 leading-snug">
                          {dir.dirCalle}, {dir.dirDistrito} — {dir.dirProvincia}
                          {dir.dirPreferido && (
                            <span className="ml-2 text-[10px] font-bold uppercase text-[#7c3aed] bg-[rgba(124,58,237,0.1)] px-1.5 py-0.5 rounded">
                              Preferida
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* ─── Formulario Yape (paso 'yape') ─── */}
              {paso === 'yape' && (
                <div className="bg-white rounded-2xl p-6 shadow-md border-2 border-[#7c3aed]">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-4 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#7c3aed]" /> Pago con Yape
                  </h3>

                  {/* Instrucciones */}
                  <div className="rounded-xl bg-green-50 border border-green-200 p-4 mb-5">
                    <p className="text-xs font-semibold text-green-800 mb-2">
                      1. Envía tu pago por Yape a:
                    </p>
                    <p className="text-lg font-bold text-green-900 tracking-widest">
                      {YAPE_NEGOCIO_NUMERO}
                    </p>
                    <p className="text-xs text-green-700">{YAPE_NEGOCIO_NOMBRE}</p>
                    <div className="mt-2 pt-2 border-t border-green-200">
                      <p className="text-xs text-green-700">
                        Monto a enviar:{' '}
                        <span className="font-bold text-green-900">S/. {total.toFixed(2)}</span>
                      </p>
                    </div>
                    <p className="text-xs text-green-600 mt-2">
                      2. Luego ingresa los datos que aparecen en tu app Yape:
                    </p>
                  </div>

                  {/* Número de celular */}
                  <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Tu número de celular
                    </label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        id="yape-numero"
                        type="tel"
                        inputMode="numeric"
                        maxLength={9}
                        value={yape.numero}
                        onChange={(e) => handleYapeChange('numero', e.target.value, 9)}
                        placeholder="987 654 321"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 transition-all ${
                          errors.numero
                            ? 'border-red-400 bg-red-50'
                            : 'border-[rgba(124,58,237,0.25)] focus:border-[#7c3aed]'
                        }`}
                      />
                    </div>
                    {errors.numero && (
                      <p className="text-xs text-red-500 mt-1">{errors.numero}</p>
                    )}
                  </div>

                  {/* Código de aprobación */}
                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1.5">
                      Código de aprobación (6 dígitos)
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        id="yape-codigo"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={yape.codigo}
                        onChange={(e) => handleYapeChange('codigo', e.target.value, 6)}
                        placeholder="123456"
                        className={`w-full pl-9 pr-4 py-2.5 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/30 transition-all ${
                          errors.codigo
                            ? 'border-red-400 bg-red-50'
                            : 'border-[rgba(124,58,237,0.25)] focus:border-[#7c3aed]'
                        }`}
                      />
                    </div>
                    {errors.codigo && (
                      <p className="text-xs text-red-500 mt-1">{errors.codigo}</p>
                    )}
                  </div>

                  {/* Botones */}
                  <button
                    id="btn-confirmar-pedido"
                    onClick={handleConfirmar}
                    className="w-full py-3 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] active:scale-[0.98] transition-all font-semibold text-sm flex items-center justify-center gap-2"
                  >
                    <Lock className="w-4 h-4" /> Confirmar pedido
                  </button>
                  <button
                    onClick={() => { setPaso('carrito'); setErrors({}); }}
                    className="w-full mt-2 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}

              {/* ─── Resumen de la orden ─── */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[rgba(124,58,237,0.15)] sticky top-24">
                <h3 className="text-base font-semibold text-gray-800 mb-5">Resumen</h3>

                <div className="space-y-2.5 mb-5 pb-5 border-b border-gray-100">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>S/. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Envío</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-green-600 font-semibold">Gratis</span>
                      ) : (
                        `S/. ${shipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline mb-6">
                  <span className="text-base font-semibold text-gray-800">Total</span>
                  <span className="text-2xl font-bold text-[#7c3aed]">S/. {total.toFixed(2)}</span>
                </div>

                {/* Botón principal: "Pagar con Yape" */}
                {paso === 'carrito' && (
                  <>
                    {itemsSinVariante && (
                      <p className="text-xs text-red-500 mb-3 text-center">
                        Algunos productos no tienen talla/color válida. Quítalos y agrégalos de nuevo desde el catálogo.
                      </p>
                    )}
                    {!selectedDirId && !itemsSinVariante && (
                      <p className="text-xs text-gray-400 mb-3 text-center">
                        Selecciona una dirección para continuar.
                      </p>
                    )}
                    <button
                      id="btn-pagar-yape"
                      onClick={() => setPaso('yape')}
                      disabled={!puedeIrAPagar}
                      className="w-full py-3.5 bg-[#7c3aed] text-white rounded-full hover:bg-[#6d28d9] active:scale-[0.98] transition-all font-semibold text-sm mb-3 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" /> Pagar con Yape
                    </button>
                  </>
                )}

                <a
                  href="/"
                  className="block text-center text-xs text-gray-400 hover:text-[#7c3aed] transition-colors"
                >
                  Continuar comprando
                </a>

                {/* Barra de progreso hacia envío gratis */}
                {shipping > 0 && (
                  <div className="mt-5 p-4 bg-[rgba(124,58,237,0.04)] rounded-xl">
                    <p className="text-xs text-gray-600 mb-2">
                      Te faltan{' '}
                      <span className="font-semibold text-[#7c3aed]">
                        S/. {(1500 - subtotal).toFixed(2)}
                      </span>{' '}
                      para envío gratis
                    </p>
                    <div className="w-full bg-[rgba(124,58,237,0.15)] rounded-full h-1.5">
                      <div
                        className="bg-[#7c3aed] h-1.5 rounded-full transition-all duration-500"
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

      {/* ─── Overlay: procesando / éxito ─── */}
      {(paso === 'procesando' || paso === 'exito') && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl px-10 py-12 max-w-sm w-full mx-6 text-center shadow-2xl">
            {paso === 'procesando' ? (
              <>
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-[rgba(124,58,237,0.1)] flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[#7c3aed] animate-spin" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Registrando tu pedido…</h3>
                <p className="text-sm text-gray-400">No cierres esta ventana.</p>
              </>
            ) : (
              <>
                <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">¡Pedido recibido!</h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  Verificaremos tu pago Yape y te confirmaremos a la brevedad.
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <Toaster />
    </div>
  );
}
