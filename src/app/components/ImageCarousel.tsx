import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';

const slides = [
  {
    url: 'https://res.cloudinary.com/duxjpbmhs/image/upload/c_scale,w_1800,e_upscale,f_auto,q_auto/v1781326951/Newjeans_Hyein_design_by_me_%EF%B8%8E_rdualk.jpg',
    eyebrow: 'Wayback · SS25',
    title: 'No es vintage.\nEs eterno.',
    cta: 'Explorar',
    ctaPath: '/categoria/camisetas',
  },
  {
    url: 'https://res.cloudinary.com/duxjpbmhs/image/upload/c_scale,w_1800,e_upscale,f_auto,q_auto/v1781327253/jpg_1_f6ifge.jpg',
    eyebrow: 'Colección Denim',
    title: 'Construido\npara quedar.',
    cta: 'Ver Sets Denim',
    ctaPath: '/categoria/sets-denim',
  },
  {
    url: 'https://i.pinimg.com/1200x/63/6c/75/636c75518cd7ce7266abbdbfc956a1b7.jpg5',
    eyebrow: 'Wayback Sets',
    title: 'Vestir fácil.\nDestacar siempre.',
    cta: 'Ver Colecciones',
    ctaPath: '/categoria/sets-baggy',
  },
];

export function ImageCarousel() {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setCurrent((p) => (p + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);
  const next = () => setCurrent((p) => (p + 1) % slides.length);

  const slide = slides[current];

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ height: '88vh', minHeight: 540, maxHeight: 820 }}>
      {/* slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? 'auto' : 'none' }}
        >
          <img
            src={s.url}
            alt={s.eyebrow}
            className="w-full h-full object-cover"
            style={{ opacity: 0.82 }}
          />
        </div>
      ))}

      {/* cinematic gradient overlay */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.25) 55%, transparent 100%)' }}
      />

      {/* text content */}
      <div className="absolute inset-0 flex items-end pb-20 sm:items-center sm:pb-0">
        <div className="container mx-auto px-8 sm:px-12">
          <div className="max-w-xl">
            <p
              className="text-white/60 uppercase mb-4 tracking-[0.2em]"
              style={{ fontSize: 11, fontWeight: 600 }}
            >
              {slide.eyebrow}
            </p>
            <h1
              className="text-white mb-8 whitespace-pre-line"
              style={{
                fontSize: 'clamp(42px, 6vw, 80px)',
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              }}
            >
              {slide.title}
            </h1>
            <button
              onClick={() => navigate(slide.ctaPath)}
              className="flex items-center gap-3 text-white border-b border-white/60 pb-0.5 hover:border-white transition-all duration-200 group"
              style={{ fontSize: 13, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
            >
              <span style={{ borderBottom: '1px solid rgba(255,255,255,0.6)', paddingBottom: 2 }}>
                {slide.cta}
              </span>
              <ChevronRight
                className="group-hover:translate-x-1 transition-transform duration-200"
                style={{ width: 15, height: 15 }}
              />
            </button>
          </div>
        </div>
      </div>

      {/* prev/next */}
      <button
        onClick={prev}
        className="absolute left-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200"
        aria-label="Anterior"
      >
        <ChevronLeft style={{ width: 18, height: 18 }} />
      </button>
      <button
        onClick={next}
        className="absolute right-5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center border border-white/30 text-white hover:bg-white hover:text-black transition-all duration-200"
        aria-label="Siguiente"
      >
        <ChevronRight style={{ width: 18, height: 18 }} />
      </button>

      {/* dot indicators */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              height: 2,
              width: i === current ? 28 : 12,
              background: i === current ? '#fff' : 'rgba(255,255,255,0.35)',
              border: 'none',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>

      {/* slide counter */}
      <div
        className="absolute bottom-7 right-8 text-white/40"
        style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em' }}
      >
        {String(current + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
      </div>
    </div>
  );
}