import { Header } from '../components/Header'; // 🚨 REGLA ADD: Importamos el Header real
import { ImageCarousel } from '../components/ImageCarousel';

const TICKER_ITEMS = [
  'WAYBACK · SS25', 'Prendas de archivo', 'Y2K Heritage', 'Hecho para durar',
  'WAYBACK · SS25', 'Prendas de archivo', 'Y2K Heritage', 'Hecho para durar',
];

function ProductSlot() {
  return (
    <div>
      <div
        style={{ aspectRatio: '3/4', background: '#f3f4f6', width: '100%' }}
        className="animate-pulse"
      />
      <div className="mt-3 space-y-2">
        <div style={{ height: 11, background: '#f0f0f0', width: '65%', borderRadius: 2 }} />
        <div style={{ height: 11, background: '#f0f0f0', width: '35%', borderRadius: 2 }} />
      </div>
    </div>
  );
}

export function HomePage() {
  return (
    <div className="bg-white">
      

      {/* ── Hero Carousel ── */}
      <ImageCarousel />

      {/* ── Ticker ── */}
      <div
        className="overflow-hidden border-y border-gray-100 py-3"
        style={{ background: '#fafafa' }}
      >
        <div
          className="flex gap-10 whitespace-nowrap"
          style={{ animation: 'ticker 18s linear infinite' }}
        >
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span
              key={i}
              className="uppercase"
              style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', color: '#9ca3af' }}
            >
              {t}
            </span>
          ))}
        </div>
        <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
      </div>

      {/* ── Para Ti ── */}
      <section className="container mx-auto px-6 py-16">
        <div className="mb-10">
          <p
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 8 }}
          >
            Wayback · Selección
          </p>
          <h2
            style={{ fontSize: 28, fontWeight: 800, color: '#111', letterSpacing: '-0.03em', lineHeight: 1.1 }}
          >
            Para ti
          </h2>
        </div>

        {/* Placeholder slots — ready for API */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSlot key={i} />
          ))}
        </div>

        {/* Coming soon note */}
        <div
          className="mt-14 flex flex-col items-center text-center py-12"
          style={{ borderTop: '1px solid #f3f4f6' }}
        >
          <p
            className="uppercase mb-3"
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#7c3aed' }}
          >
            Próximamente
          </p>
          <p
            style={{ fontSize: 18, fontWeight: 700, color: '#111', letterSpacing: '-0.02em', marginBottom: 8 }}
          >
            Catálogo en preparación
          </p>
          <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 380, lineHeight: 1.65 }}>
            Estamos curating las prendas perfectas para ti.<br />
            Suscríbete abajo para ser el primero en verlas.
          </p>
        </div>
      </section>

      {/* ── Editorial divider ── */}
      <div
        className="w-full overflow-hidden"
        style={{ height: '50vh', minHeight: 300, background: '#111', position: 'relative' }}
      >
        <img
          src="https://i.pinimg.com/1200x/a6/9e/2a/a69e2abb318ccc05b70ba52f5c61dbd2.jpg"
          alt="Wayback editorial"
          className="w-full h-full object-cover"
          style={{ opacity: 0.55 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center px-6">
            <p
              className="text-white uppercase mb-4"
              style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.28em', opacity: 0.55 }}
            >
              Wayback · Philosophy
            </p>
            <h3
              className="text-white"
              style={{ fontSize: 'clamp(28px, 5vw, 60px)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.05 }}
            >
              Ropa que cuenta<br />quién eres.
            </h3>
          </div>
        </div>
      </div>

      {/* ── Newsletter ── */}
      <section style={{ borderTop: '1px solid #f3f4f6', background: '#fafafa' }}>
        <div className="container mx-auto px-6 py-20 text-center max-w-lg">
          <p
            style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', color: '#7c3aed', textTransform: 'uppercase', marginBottom: 12 }}
          >
            Comunidad
          </p>
          <h3
            style={{ fontSize: 24, fontWeight: 800, color: '#111', letterSpacing: '-0.02em', marginBottom: 8 }}
          >
            Sé el primero en saberlo.
          </h3>
          <p
            style={{ fontSize: 14, color: '#6b7280', marginBottom: 24, lineHeight: 1.6 }}
          >
            Nuevas prendas, drops exclusivos y archivo Wayback directo a tu correo.
          </p>
          <div className="flex gap-0">
            <input
              type="email"
              placeholder="tu@correo.com"
              className="flex-1 px-4 py-3 bg-white border border-gray-200 border-r-0 text-gray-800 placeholder-gray-300 focus:outline-none focus:border-purple-400 transition-colors"
              style={{ fontSize: 13 }}
            />
            <button
              className="px-5 py-3 text-white transition-colors"
              style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', whiteSpace: 'nowrap', background: '#7c3aed' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#6d28d9'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#7c3aed'; }}
            >
              Suscribirse
            </button>
          </div>
          <p style={{ fontSize: 11, color: '#d1d5db', marginTop: 12 }}>
            Sin spam. Puedes darte de baja cuando quieras.
          </p>
        </div>
      </section>
    </div>
  );
}