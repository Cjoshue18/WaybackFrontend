import { useState } from 'react';
import { ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

interface FilterSidebarProps {
  filters: any;
  setFilters: (filters: any) => void;
}

const CATEGORIAS_TIENDA = [
  'Pantalón', 'Falda', 'Shorts', 'Jogger', 'Camisetas', 'Suéteres', 'Chaquetas', 'Sets Baggy', 'Sets Denim'
];

const COLORS = [
  { id: 1,  nombre: 'Blanco',   hex: '#FFFFFF' },
  { id: 2,  nombre: 'Negro',    hex: '#000000' },
  { id: 3,  nombre: 'Azul',     hex: '#0000FF' },
  { id: 4,  nombre: 'Verde',    hex: '#008000' },
  { id: 5,  nombre: 'Amarillo', hex: '#FFFF00' },
  { id: 6,  nombre: 'Rojo',     hex: '#FF0000' },
  { id: 7,  nombre: 'Rosa',     hex: '#FFC0CB' },
  { id: 8,  nombre: 'Morado',   hex: '#800080' },
];

const TALLAS = ['S', 'M', 'L', 'XL'];
const SEXOS  = ['Mujer', 'Hombre', 'Unisex'];
const PRECIO_MIN = 0;
const PRECIO_MAX = 500;

function SectionHeader({ label, expanded, onToggle }: { label: string; expanded: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center justify-between w-full text-left py-1">
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', color: '#374151', textTransform: 'uppercase' }}>
        {label}
      </span>
      {expanded ? <ChevronUp style={{ width: 14, height: 14, color: '#9ca3af' }} /> : <ChevronDown style={{ width: 14, height: 14, color: '#9ca3af' }} />}
    </button>
  );
}

function Divider() {
  return <div style={{ height: 1, background: '#f3f4f6', margin: '4px 0' }} />;
}

export function FilterSidebar({ filters, setFilters }: FilterSidebarProps) {
  const [expanded, setExpanded] = useState({ categorias: true, genero: true, color: true, talla: true, disponibilidad: true, precio: true });
  const toggle = (k: keyof typeof expanded) => setExpanded((p) => ({ ...p, [k]: !p[k] }));

  const normalizarFiltro = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  // ── 🔑 TIPADO DE PARAMETROS INTERNOS ANÓNIMOS (SOLUCIÓN AL ERROR 7006) ──
  const toggleCategoria = (c: string) => {
    const actuales: string[] = Array.isArray(filters.categorias) ? filters.categorias : [];
    const normaC = normalizarFiltro(c);
    const existe = actuales.some((x: string) => normalizarFiltro(x) === normaC);
    
    setFilters({ 
      ...filters, 
      categorias: existe 
        ? actuales.filter((x: string) => normalizarFiltro(x) !== normaC) 
        : [...actuales, normaC] 
    });
  };

  const toggleSexo = (s: string) => {
    const actuales: string[] = Array.isArray(filters.sexo) ? filters.sexo : [];
    setFilters({ 
      ...filters, 
      sexo: actuales.includes(s) ? actuales.filter((x: string) => x !== s) : [...actuales, s] 
    });
  };

  const toggleColor = (id: number) => {
    const actuales: number[] = Array.isArray(filters.colors) ? filters.colors : [];
    setFilters({ 
      ...filters, 
      colors: actuales.includes(id) ? actuales.filter((x: number) => x !== id) : [...actuales, id] 
    });
  };

  const toggleTalla = (t: string) => {
    const actuales: string[] = Array.isArray(filters.tallas) ? filters.tallas : [];
    setFilters({ 
      ...filters, 
      tallas: actuales.includes(t) ? actuales.filter((x: string) => x !== t) : [...actuales, t] 
    });
  };

  const hasActive =
    (filters.categorias?.length ?? 0) > 0 || 
    (filters.sexo?.length ?? 0) > 0 || 
    (filters.colors?.length ?? 0) > 0 || 
    (filters.tallas?.length ?? 0) > 0 || 
    filters.soloDisponibles || 
    filters.precioMax < PRECIO_MAX;

  const resetAll = () => setFilters({ categorias: [], sexo: [], colors: [], tallas: [], soloDisponibles: false, precioMin: PRECIO_MIN, precioMax: PRECIO_MAX });

  return (
    <aside style={{ width: 220, flexShrink: 0 }}>
      <div className="sticky" style={{ top: 80 }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal style={{ width: 14, height: 14, color: '#111' }} />
            <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', color: '#111', textTransform: 'uppercase' }}>Filtros</span>
          </div>
          {hasActive && (
            <button onClick={resetAll} style={{ fontSize: 11, color: '#7c3aed', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600 }} className="hover:text-[#6d28d9] transition-colors">
              Limpiar
            </button>
          )}
        </div>

        <Divider />

        <div className="flex flex-col" style={{ gap: 16, marginTop: 16 }}>
          
          {/* Categorías */}
          <div>
            <SectionHeader label="Prendas" expanded={expanded.categorias} onToggle={() => toggle('categorias')} />
            {expanded.categorias && (
              <div className="flex flex-col mt-3" style={{ gap: 6 }}>
                {CATEGORIAS_TIENDA.map((c: string) => {
                  const actuales: string[] = Array.isArray(filters.categorias) ? filters.categorias : [];
                  const active = actuales.some((x: string) => normalizarFiltro(x) === normalizarFiltro(c));
                  return (
                    <button type="button" key={c} onClick={() => toggleCategoria(c)} className="flex items-center gap-2.5 text-left transition-colors group">
                      <span style={{ width: 14, height: 14, border: `1.5px solid ${active ? '#7c3aed' : '#d1d5db'}`, background: active ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span style={{ fontSize: 13, color: active ? '#7c3aed' : '#6b7280', fontWeight: active ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">{c}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Género */}
          <div>
            <SectionHeader label="Género" expanded={expanded.genero} onToggle={() => toggle('genero')} />
            {expanded.genero && (
              <div className="flex flex-col mt-3" style={{ gap: 6 }}>
                {SEXOS.map((s: string) => {
                  const actuales: string[] = Array.isArray(filters.sexo) ? filters.sexo : [];
                  const active = actuales.includes(s);
                  return (
                    <button type="button" key={s} onClick={() => toggleSexo(s)} className="flex items-center gap-2.5 text-left transition-colors group">
                      <span style={{ width: 14, height: 14, border: `1.5px solid ${active ? '#7c3aed' : '#d1d5db'}`, background: active ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {active && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span style={{ fontSize: 13, color: active ? '#7c3aed' : '#6b7280', fontWeight: active ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">{s}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Color */}
          <div>
            <SectionHeader label="Color" expanded={expanded.color} onToggle={() => toggle('color')} />
            {expanded.color && (
              <div className="grid mt-3" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: 7 }}>
                {COLORS.map((c) => {
                  const actuales: number[] = Array.isArray(filters.colors) ? filters.colors : [];
                  const active = actuales.includes(c.id);
                  return (
                    <button type="button" key={c.id} onClick={() => toggleColor(c.id)} title={c.nombre} style={{ width: 26, height: 26, background: c.hex, border: active ? '2px solid #7c3aed' : `1px solid ${['#FFFFFF'].includes(c.hex) ? '#d1d5db' : 'transparent'}`, outline: active ? '2px solid #7c3aed' : 'none', outlineOffset: 2, transition: 'transform 0.15s', transform: active ? 'scale(1.15)' : 'scale(1)' }} className="hover:scale-110 transition-transform" />
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Talla */}
          <div>
            <SectionHeader label="Talla" expanded={expanded.talla} onToggle={() => toggle('talla')} />
            {expanded.talla && (
              <div className="flex flex-wrap mt-3" style={{ gap: 6 }}>
                {TALLAS.map((t: string) => {
                  const actuales: string[] = Array.isArray(filters.tallas) ? filters.tallas : [];
                  const active = actuales.includes(t);
                  return (
                    <button type="button" key={t} onClick={() => toggleTalla(t)} style={{ padding: '4px 12px', border: `1.5px solid ${active ? '#7c3aed' : '#e5e7eb'}`, background: active ? '#7c3aed' : 'transparent', color: active ? '#fff' : '#374151', fontSize: 12, fontWeight: active ? 700 : 400, letterSpacing: '0.04em', transition: 'all 0.15s' }}>
                      {t}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <Divider />

          {/* Disponibilidad */}
          <div>
            <SectionHeader label="Disponibilidad" expanded={expanded.disponibilidad} onToggle={() => toggle('disponibilidad')} />
            {expanded.disponibilidad && (
              <label className="flex items-center gap-2.5 cursor-pointer mt-3 group">
                <input type="checkbox" checked={filters.soloDisponibles || false} onChange={(e) => setFilters({ ...filters, soloDisponibles: e.target.checked })} className="sr-only" />
                <span style={{ width: 14, height: 14, border: `1.5px solid ${filters.soloDisponibles ? '#7c3aed' : '#d1d5db'}`, background: filters.soloDisponibles ? '#7c3aed' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {filters.soloDisponibles && <svg viewBox="0 0 10 10" fill="none" style={{ width: 8, height: 8 }}><path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                </span>
                <span style={{ fontSize: 13, color: filters.soloDisponibles ? '#7c3aed' : '#6b7280', fontWeight: filters.soloDisponibles ? 600 : 400 }} className="group-hover:text-[#7c3aed] transition-colors">Solo en stock</span>
              </label>
            )}
          </div>

          <Divider />

          {/* Precio */}
          <div>
            <SectionHeader label="Precio" expanded={expanded.precio} onToggle={() => toggle('precio')} />
            {expanded.precio && (
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Min: S/ {PRECIO_MIN}</span>
                  <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>Max: S/ {filters.precioMax ?? PRECIO_MAX}</span>
                </div>
                <input type="range" min={PRECIO_MIN} max={PRECIO_MAX} step={10} value={filters.precioMax ?? PRECIO_MAX} onChange={(e) => setFilters({ ...filters, precioMax: Number(e.target.value) })} className="w-full" style={{ accentColor: '#7c3aed' }} />
              </div>
            )}
          </div>

        </div>
      </div>
    </aside>
  );
}